/**
 * Reading and writing a glyph in a music-js font.
 *
 * The viewer traces and engraves in the page; all it wants from the server is
 * the source of a font and a way to write a glyph back into it.
 *
 * Both endpoints work on the same file — `src/drawer/font/music-js/<font>.js`.
 * That matters: the page used to read the generated mirror under
 * `/js/msq/worker/` while the writer wrote the source, so an applied change
 * appeared to revert until the worker tree was rebuilt.
 */

import fs from 'fs/promises'

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import { MUSIC_JS_DIRECTORY, respondWith, resolveInside } from './shared.js'

const POINT_FIELDS = [
  'points', 'upPoints', 'downPoints', 'leftPoints', 'centerPoints', 'rightPoints'
]

/**
 * Find one entry's lines in a music-js font.
 *
 * These files are generated, so their formatting is regular enough to walk by
 * line: one property per line, arrays opened by `<field>: [` and closed by `]`
 * at the same indent. Everything the scan does not name is left untouched.
 */
function locate(lines, entryPath) {
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

  return found.arrays.length ? found : null
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

const fontFileFor = (font) =>
  typeof font === 'string' && /^[a-z0-9-]+$/.test(font)
    ? resolveInside(MUSIC_JS_DIRECTORY, `${font}.js`)
    : null

/**
 * The source of a music-js font, as the viewer needs it to read the value a
 * glyph currently carries.
 */
const fontSource = endpoint('/dev/font-source/:font', 'GET', async ({ stream, params }) => {
  const file = fontFileFor(params.font)
  if (!file) {
    return respondWith(stream, 400, { error: 'Not a music-js font name' })
  }
  let source
  try {
    source = await fs.readFile(file, 'utf-8')
  } catch {
    return respondWith(stream, 404, { error: `No such music-js font: ${params.font}` })
  }
  stream.respond({
    'content-type': 'text/javascript; charset=utf-8',
    'content-length': Buffer.byteLength(source),
    'cache-control': 'no-store',
    ':status': 200
  })
  stream.end(source)
})

/**
 * Read the request both endpoints below take, and work out the font it would
 * change. Everything either of them does begins here.
 */
async function glyphEdit(request) {
  const { font, entry, points, yCorrection } = request
  if (typeof font !== 'string' || typeof entry !== 'string' || !Array.isArray(points)) {
    return { status: 400, error: 'Expected { font, entry, points, yCorrection? }' }
  }

  const file = fontFileFor(font)
  if (!file) {
    return { status: 400, error: 'Not a music-js font name' }
  }

  let source
  try {
    source = await fs.readFile(file, 'utf-8')
  } catch {
    return { status: 404, error: `No such music-js font: ${font}` }
  }

  const lines = source.split('\n')
  const found = locate(lines, entry)
  if (!found) {
    return { status: 404, error: `No point array found for '${entry}' in ${font}.js` }
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

  return {
    status: 200,
    file,
    source: updated.join('\n'),
    font,
    entry,
    field: array.field,
    wrote: written.length,
    yCorrection: typeof yCorrection === 'number' && found.yCorrection !== null
  }
}

const readRequest = async (stream) =>
  JSON.parse((await body(stream, { maxSize: 8 })).toString('utf-8'))

/**
 * The font as it *would* be, without writing anything.
 *
 * The viewer engraves through the worker, off the font module the worker
 * imported — so a traced glyph cannot reach the score by any route but giving
 * the worker a different module. That is what this is for: the page takes the
 * source back, makes a blob of it and registers that, which is how a changed
 * size or interval shows up on the stave before anything is committed.
 *
 * It is the same edit `/dev/font-glyph` makes; only the last step differs.
 */
const previewGlyph = endpoint('/dev/font-glyph/preview', 'POST', async ({ stream }) => {
  let request
  try {
    request = await readRequest(stream)
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const edit = await glyphEdit(request)
  if (edit.error) {
    return respondWith(stream, edit.status, { error: edit.error })
  }

  stream.respond({
    'content-type': 'text/javascript; charset=utf-8',
    'content-length': Buffer.byteLength(edit.source),
    'cache-control': 'no-store',
    ':status': 200
  })
  stream.end(edit.source)
})

const applyGlyph = endpoint('/dev/font-glyph', 'POST', async ({ stream }) => {
  let request
  try {
    request = await readRequest(stream)
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const edit = await glyphEdit(request)
  if (edit.error) {
    return respondWith(stream, edit.status, { error: edit.error })
  }

  await fs.writeFile(edit.file, edit.source, 'utf-8')
  respondWith(stream, 200, {
    font: edit.font,
    entry: edit.entry,
    field: edit.field,
    wrote: edit.wrote,
    yCorrection: edit.yCorrection
  })
})

export default [ fontSource, previewGlyph, applyGlyph ]
