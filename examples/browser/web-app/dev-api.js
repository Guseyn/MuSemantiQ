/**
 * The one endpoint the font viewer needs, and nothing else uses.
 *
 * The viewer traces and engraves in the page; all it wants from the server is a
 * way to write a glyph back into a music-js font. That reads and writes files in
 * the working tree, so it belongs to the example app rather than to MuSemantiQ.
 */

import fs from 'fs/promises'
import path from 'path'

import endpoint from '#nodes/endpoint.js'
import body from '#nodes/body.js'

const MUSIC_JS_DIRECTORY = path.join(process.cwd(), 'src/drawer/font/music-js')

const POINT_FIELDS = [
  'points', 'upPoints', 'downPoints', 'leftPoints', 'centerPoints', 'rightPoints'
]

function respondWith(stream, status, payload) {
  const rendered = JSON.stringify(payload)
  stream.respond({
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(rendered),
    'cache-control': 'no-store',
    ':status': status
  })
  stream.end(rendered)
}

/**
 * Resolve a file inside a directory, refusing anything that climbs out of it.
 */
function resolveInside(directory, name) {
  const resolved = path.resolve(directory, name)
  return resolved.startsWith(path.resolve(directory) + path.sep) ? resolved : null
}

/**
 * Find one entry's lines in a music-js font.
 *
 * These files are generated, so their formatting is regular enough to walk by
 * line: one property per line, arrays opened by `<field>: [` and closed by `]`
 * at the same indent. Everything the scan does not name is left untouched.
 */
function locate(lines, entryPath) {
  const wanted = entryPath.split('.')
  const stack = []
  let inside = null
  const found = { arrays: [], yCorrection: null }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const closing = line.match(/^(\s*)\}/)
    if (closing) {
      while (stack.length && stack[stack.length - 1].indent >= closing[1].length) {
        stack.pop()
      }
      inside = stack.map((frame) => frame.name).join('.') === entryPath
    }

    const opening = line.match(/^(\s*)(?:'([^']*)'|([A-Za-z0-9_]+)): \{\s*$/)
    if (opening) {
      const indent = opening[1].length
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      stack.push({ indent, name: opening[2] === undefined ? opening[3] : opening[2] })
      inside = stack.map((frame) => frame.name).join('.') === entryPath
      continue
    }

    if (!inside) {
      continue
    }

    const correction = line.match(/^(\s*)yCorrection: (-?[\d.]+) \* intervalBetweenStaveLines(,?)\s*$/)
    if (correction) {
      found.yCorrection = {
        line: index, indent: correction[1].length, comma: correction[3] === ','
      }
      continue
    }

    const array = line.match(/^(\s*)([A-Za-z]+): \[\s*$/)
    if (array && POINT_FIELDS.includes(array[2])) {
      const closes = new RegExp(`^${array[1]}\\],?\\s*$`)
      let end = index + 1
      while (end < lines.length && !closes.test(lines[end])) {
        end++
      }
      found.arrays.push({ field: array[2], indent: array[1], start: index, end })
    }

    // An empty array is written on one line.
    const empty = line.match(/^(\s*)([A-Za-z]+): \[\],?\s*$/)
    if (empty && POINT_FIELDS.includes(empty[2])) {
      found.arrays.push({ field: empty[2], indent: empty[1], start: index, end: index, inline: true })
    }
  }

  if (!wanted.length || !found.arrays.length) {
    return null
  }
  return found
}

/**
 * Lay a point array out the way the music-js fonts hold it.
 */
function pointArrayLines(points) {
  const lines = []
  let coordinates = []
  const flush = () => {
    if (coordinates.length) {
      lines.push(coordinates.join(', '))
      coordinates = []
    }
  }
  for (const point of points) {
    if (typeof point === 'string') {
      flush()
      lines.push(`'${point}'`)
    } else {
      const written = Object.is(point, -0) ? '-0.00' : point.toFixed(2)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flush()
  return lines.map((line, index) => index === lines.length - 1 ? line : `${line},`)
}

const applyGlyph = endpoint('/dev/font-glyph', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 8 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const { font, entry, points, yCorrection } = request
  if (typeof font !== 'string' || typeof entry !== 'string' || !Array.isArray(points)) {
    return respondWith(stream, 400, { error: 'Expected { font, entry, points, yCorrection? }' })
  }

  const file = resolveInside(MUSIC_JS_DIRECTORY, `${font}.js`)
  if (!file) {
    return respondWith(stream, 400, { error: 'Path escapes the music-js directory' })
  }

  let source
  try {
    source = await fs.readFile(file, 'utf-8')
  } catch {
    return respondWith(stream, 404, { error: `No such music-js font: ${font}` })
  }

  const lines = source.split('\n')
  const found = locate(lines, entry)
  if (!found) {
    return respondWith(stream, 404, { error: `No point array found for '${entry}' in ${font}.js` })
  }

  /*
  Rewrite from the bottom up so the line numbers of the edits above stay valid.
  Only the first point field is written: the viewer traces one character at a
  time, and an up/down pair is two separate visits.
  */
  const array = found.arrays[0]
  const edits = []

  if (typeof yCorrection === 'number' && found.yCorrection) {
    const { line, indent, comma } = found.yCorrection
    edits.push({
      start: line,
      end: line,
      lines: [
        `${' '.repeat(indent)}yCorrection: ${Number(yCorrection.toFixed(4))}` +
        ` * intervalBetweenStaveLines${comma ? ',' : ''}`
      ]
    })
  }

  const written = pointArrayLines(points).map((line) => `${array.indent}  ${line}`)
  const closes = array.inline ? '' : lines[array.end].trim().endsWith(',') ? ',' : ''
  edits.push({
    start: array.start,
    end: array.end,
    lines: points.length
      ? [ `${array.indent}${array.field}: [`, ...written, `${array.indent}]${array.inline ? ',' : closes}` ]
      : [ `${array.indent}${array.field}: []${array.inline ? ',' : closes}` ]
  })

  let updated = lines
  for (const edit of edits.sort((one, another) => another.start - one.start)) {
    updated = [ ...updated.slice(0, edit.start), ...edit.lines, ...updated.slice(edit.end + 1) ]
  }

  await fs.writeFile(file, updated.join('\n'), 'utf-8')
  respondWith(stream, 200, {
    font,
    entry,
    field: array.field,
    wrote: written.length,
    yCorrection: typeof yCorrection === 'number' && found.yCorrection !== null
  })
})

export default [ applyGlyph ]
