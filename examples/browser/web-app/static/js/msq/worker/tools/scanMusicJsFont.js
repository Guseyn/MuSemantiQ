'use strict'

/**
 * Scanner for the music-js font files (src/drawer/font/music-js/*.js) and for
 * smufl-font.js.template, which shares their shape.
 *
 * Those files are generated, so their formatting is perfectly regular: one key
 * per line, point arrays opened by `<field>: [` and closed by `]` at the same
 * indent, holding nothing but quoted command letters and
 * `n.nn * intervalBetweenStaveLines` coordinates. A line scanner is therefore
 * enough, and it leaves every line it does not care about untouched.
 */

// The interval the committed music-js fonts were generated at, and the divisor
// their coordinates are expressed in.
export const INTERVAL_BETWEEN_STAVE_LINES = 8.5

// Point array fields, in the order a multi-glyph entry maps codepoints onto them.
export const POINT_FIELDS = [
  'points',
  'upPoints', 'downPoints',
  'leftPoints', 'centerPoints', 'rightPoints'
]

/**
 * Walk a music-js font source, reporting every glyph entry and point array.
 *
 * Returns the source split into lines, the entries by path (`fermata`,
 * `noteLetters.0`), and every point array with the line range of its body.
 */
export function scanMusicJsFont(source) {
  const lines = source.split('\n')
  const stack = []
  const entries = new Map()
  const arrays = []
  let entry = null

  const currentPath = () => stack.map((frame) => frame.name).join('.')

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const closing = line.match(/^(\s*)\}/)
    if (closing) {
      while (stack.length && stack[stack.length - 1].indent >= closing[1].length) {
        stack.pop()
      }
      entry = entries.get(currentPath()) || null
    }

    const opening = line.match(/^(\s*)(?:'([^']*)'|([A-Za-z0-9_]+)): \{\s*$/)
    if (opening) {
      const indent = opening[1].length
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      stack.push({ indent, name: opening[2] === undefined ? opening[3] : opening[2] })
      entry = { path: currentPath(), unicode: null, unicodeLine: -1, unicodeIndent: 0, fields: [] }
      entries.set(entry.path, entry)
      continue
    }

    // Matches both a real codepoint literal and the template's
    // `unicode: __UNICODE:<path>__,` marker, so one scanner serves both files.
    const unicode = line.match(/^(\s*)unicode: (.*?),?\s*$/)
    if (unicode && entry) {
      const literal = unicode[2].match(/^'(.*)'$/)
      entry.unicode = literal === null
        ? null
        : literal[1].replace(
          /\\u([0-9a-fA-F]{4})/g, (_all, hex) => String.fromCharCode(parseInt(hex, 16))
        )
      entry.unicodeLine = index
      entry.unicodeIndent = unicode[1].length
      continue
    }

    const array = line.match(/^(\s*)([A-Za-z]+): \[\s*$/)
    if (array && POINT_FIELDS.includes(array[2]) && entry) {
      const indent = array[1]
      const closesArray = new RegExp(`^${indent}\\],?\\s*$`)
      let end = index + 1
      while (end < lines.length && !closesArray.test(lines[end])) {
        end++
      }
      if (end >= lines.length) {
        throw new Error(`Unterminated '${array[2]}' array at line ${index + 1}`)
      }
      const record = {
        id: `${entry.path}.${array[2]}`,
        entry,
        field: array[2],
        indent,
        startLine: index,
        endLine: end,
        body: lines.slice(index + 1, end)
      }
      entry.fields.push(record)
      arrays.push(record)
    }
  }

  return { lines, entries, arrays }
}

export default scanMusicJsFont
