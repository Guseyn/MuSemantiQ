'use strict'

/**
 * Just enough XML to read and write MusicXML.
 *
 * MuSemantiQ has no dependencies and runs the same code in Node and in a worker,
 * so neither `DOMParser` nor an npm parser is available. MusicXML only needs a
 * small part of XML — elements, attributes, text, comments, CDATA and the five
 * named entities — and that is all this does. It is not a conformant parser:
 * namespaces are kept as part of the tag name, and a DOCTYPE is skipped rather
 * than resolved, which is right for a format whose DTD only names entities the
 * files do not use.
 *
 * A node is `{ name, attributes, children }`, where a child is either a node or
 * a string of text.
 */

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"
}

/**
 * Turn the entities a document may carry back into the characters they stand for.
 */
export function decoded(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    return NAMED_ENTITIES[body] === undefined ? whole : NAMED_ENTITIES[body]
  })
}

/**
 * Escape what cannot appear literally in text or in an attribute value.
 */
export const encoded = (text) => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const node = (name) => ({ name, attributes: {}, children: [] })

/**
 * Read a document and return its root element.
 *
 * Throws on anything it cannot make sense of, naming the line, because a
 * half-read score is worse than a refused one.
 */
export function parseXml(source) {
  let at = 0
  const root = node('#document')
  const stack = [ root ]

  const fail = (why, where) => {
    const line = source.slice(0, where).split('\n').length
    throw new Error(`${why} at line ${line}`)
  }

  while (at < source.length) {
    const opens = source.indexOf('<', at)

    if (opens === -1) {
      break
    }

    if (opens > at) {
      const between = source.slice(at, opens)
      if (between.trim()) {
        stack[stack.length - 1].children.push(decoded(between))
      }
    }

    // <!-- comment -->, <![CDATA[ … ]]>, <?xml … ?>, <!DOCTYPE … >
    if (source.startsWith('<!--', opens)) {
      const ends = source.indexOf('-->', opens)
      at = ends === -1 ? source.length : ends + 3
      continue
    }
    if (source.startsWith('<![CDATA[', opens)) {
      const ends = source.indexOf(']]>', opens)
      if (ends === -1) {
        fail('unterminated CDATA', opens)
      }
      stack[stack.length - 1].children.push(source.slice(opens + 9, ends))
      at = ends + 3
      continue
    }
    if (source.startsWith('<?', opens)) {
      const ends = source.indexOf('?>', opens)
      at = ends === -1 ? source.length : ends + 2
      continue
    }
    if (source.startsWith('<!', opens)) {
      // A DOCTYPE may carry a bracketed internal subset; step over it whole.
      let depth = 0
      let index = opens
      for (; index < source.length; index++) {
        if (source[index] === '[') {
          depth++
        } else if (source[index] === ']') {
          depth--
        } else if (source[index] === '>' && depth <= 0) {
          break
        }
      }
      at = index + 1
      continue
    }

    const closes = source.indexOf('>', opens)
    if (closes === -1) {
      fail('unterminated tag', opens)
    }
    let inside = source.slice(opens + 1, closes)

    // </name>
    if (inside[0] === '/') {
      const name = inside.slice(1).trim()
      const open = stack.pop()
      if (!open || open.name !== name) {
        fail(`</${name}> closes <${open ? open.name : 'nothing'}>`, opens)
      }
      at = closes + 1
      continue
    }

    const selfClosing = inside.endsWith('/')
    if (selfClosing) {
      inside = inside.slice(0, -1)
    }

    const named = inside.match(/^([^\s/>]+)/)
    if (!named) {
      fail('a tag with no name', opens)
    }
    const made = node(named[1])

    const attributes = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g
    let attribute
    while ((attribute = attributes.exec(inside.slice(named[1].length))) !== null) {
      made.attributes[attribute[1]] = decoded(
        attribute[3] === undefined ? attribute[4] : attribute[3]
      )
    }

    stack[stack.length - 1].children.push(made)
    if (!selfClosing) {
      stack.push(made)
    }
    at = closes + 1
  }

  if (stack.length !== 1) {
    fail(`<${stack[stack.length - 1].name}> is never closed`, source.length)
  }

  const found = root.children.find((child) => typeof child !== 'string')
  if (!found) {
    throw new Error('the document has no root element')
  }
  return found
}

// --- reading a tree ---------------------------------------------------------

/** Every child element of `parent`, or only those with the given name. */
export const elements = (parent, name) =>
  !parent ? [] : parent.children.filter(
    (child) => typeof child !== 'string' && (name === undefined || child.name === name)
  )

/** The first child element with that name, or null. */
export const element = (parent, name) => elements(parent, name)[0] || null

/** The text a node holds, with its child elements ignored. */
export const text = (node) =>
  !node ? '' : node.children.filter((child) => typeof child === 'string').join('').trim()

/** The text of a named child, or '' when there is none. */
export const textOf = (parent, name) => text(element(parent, name))

/** The text of a named child as a number, or null when it is absent or not one. */
export function numberOf(parent, name) {
  const value = textOf(parent, name)
  if (value === '') {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** An attribute, or '' when it is not set. */
export const attribute = (node, name) =>
  !node || node.attributes[name] === undefined ? '' : node.attributes[name]

// --- writing a tree ---------------------------------------------------------

/**
 * Build a node without the ceremony: `made('note', { 'print-object': 'no' }, …)`.
 *
 * Children may be nodes, strings, arrays, or null — null and false are dropped,
 * so a caller can write `condition && made(…)` inline.
 */
export function made(name, attributes = {}, ...children) {
  const built = node(name)
  for (const [ key, value ] of Object.entries(attributes)) {
    if (value !== undefined && value !== null && value !== false) {
      built.attributes[key] = String(value)
    }
  }
  built.children = children.flat(Infinity).filter(
    (child) => child !== null && child !== undefined && child !== false
  ).map((child) => typeof child === 'object' ? child : String(child))
  return built
}

const INDENT = '  '

/**
 * Write a tree back out, indented, with an XML declaration.
 *
 * An element holding only text is kept on one line — `<step>C</step>` rather
 * than three — because that is how every MusicXML file in the world is written,
 * and a diff against one should not be all whitespace.
 */
export function serializeXml(root, { declaration = true, doctype = null } = {}) {
  const lines = []

  const write = (node, depth) => {
    const pad = INDENT.repeat(depth)
    const attributes = Object.entries(node.attributes)
      .map(([ name, value ]) => ` ${name}="${encoded(value)}"`)
      .join('')

    if (!node.children.length) {
      lines.push(`${pad}<${node.name}${attributes} />`)
      return
    }

    if (node.children.every((child) => typeof child === 'string')) {
      lines.push(
        `${pad}<${node.name}${attributes}>` +
        `${encoded(node.children.join(''))}</${node.name}>`
      )
      return
    }

    lines.push(`${pad}<${node.name}${attributes}>`)
    for (const child of node.children) {
      if (typeof child === 'string') {
        lines.push(`${INDENT.repeat(depth + 1)}${encoded(child)}`)
      } else {
        write(child, depth + 1)
      }
    }
    lines.push(`${pad}</${node.name}>`)
  }

  if (declaration) {
    lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  }
  if (doctype) {
    lines.push(doctype)
  }
  write(root, 0)
  return `${lines.join('\n')}\n`
}
