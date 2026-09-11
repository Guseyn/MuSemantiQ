#!/usr/bin/env node

/**
 * Music-js font generator.
 *
 * Traces every glyph MuSemantiQ draws out of a SMuFL `.otf` and writes the
 * music-js file the drawer consumes — the same shape as
 * src/drawer/font/music-js/bravura.js, with each `points` array rendered from
 * the font instead of pasted in by hand.
 *
 * Two files drive it, both alongside this one:
 *
 *   smufl-font.js.template   the file skeleton: the factory signature, every
 *                            scalar metric and every hand-tuned correction,
 *                            with `__UNICODE:<entry>__` and
 *                            `__POINTS:<entry>.<field>__` where glyph data goes
 *   smufl-glyph-table.js     entry path -> SMuFL codepoint (+ a private-use
 *                            fallback, and Bravura's bbox for drift reporting)
 *
 * A glyph the font does not carry, under either codepoint, gets an empty
 * `points` array and is listed in the HTML report rather than silently keeping
 * another font's shape.
 *
 * Usage:
 *
 *   node src/tools/generate-smufl-js-font.js <font.otf> <output.js> [--html <path>]
 *
 * The corrections in the template are Bravura's, so a freshly generated font
 * draws correct shapes at inherited offsets: re-tune the entries the report
 * flags as drifting.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import opentype from '#msq/drawer/lib/opentype/opentype.js'
import bboxForPath from '#msq/drawer/elements/basic/bboxForPath.js'
import generateUnicodePoints from '#msq/drawer/generateUnicodePoints.js'
import glyphTable from '#msq/tools/smufl-glyph-table.js'
import { scanMusicJsFont, INTERVAL_BETWEEN_STAVE_LINES } from '#msq/tools/scanMusicJsFont.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TEMPLATE_PATH = path.join(__dirname, 'smufl-font.js.template')

// A generated glyph counts as drifting when either side of its bounding box
// differs from Bravura's by more than this, in stave-line intervals.
const DRIFT_THRESHOLD = 0.1

// The music-js files write coordinates to this many decimals.
const COORDINATE_DECIMALS = 2

/**
 * Format a codepoint the way the music-js files write it.
 */
function escapedUnicode(characters) {
  const escaped = [ ...characters ].map(
    (character) => '\\u' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  ).join('')
  return `'${escaped}'`
}

function unicodeLabel(characters) {
  return [ ...characters ].map(
    (character) => 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  ).join(' ')
}

/**
 * Convert a traced path from pixels to the stave-line intervals the music-js
 * files are written in.
 */
function pointsInStaveIntervals(points, interval) {
  return points.map(
    (point) => typeof point === 'string'
      ? point
      : Number((point / interval).toFixed(COORDINATE_DECIMALS))
  )
}

/**
 * Lay a point array out the way the committed music-js fonts are written: each
 * command letter on its own line, followed by its coordinates.
 */
function pointArrayLines(points) {
  const lines = []
  let coordinates = []

  const flushCoordinates = () => {
    if (coordinates.length) {
      lines.push(coordinates.join(', '))
      coordinates = []
    }
  }

  for (const point of points) {
    if (typeof point === 'string') {
      flushCoordinates()
      lines.push(`'${point}'`)
    } else {
      // A coordinate that rounds to negative zero is written '-0.00', the way
      // toFixed produced it before the value made the round trip through Number.
      const written = Object.is(point, -0)
        ? `-${(0).toFixed(COORDINATE_DECIMALS)}`
        : point.toFixed(COORDINATE_DECIMALS)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flushCoordinates()

  return lines.map(
    (line, index) => index === lines.length - 1 ? line : `${line},`
  )
}

/**
 * Resolve one entry's codepoints against the font, character by character.
 *
 * Each character is tried as its standard SMuFL codepoint first, then as the
 * private-use fallback the table names for that entry.
 */
function resolveCharacters(font, glyph) {
  return [ ...glyph.smufl ].map((character, index) => {
    if (font.charToGlyphIndex(character) !== 0) {
      return { character, source: 'smufl' }
    }
    const fallback = glyph.fallback ? [ ...glyph.fallback ][index] : undefined
    if (fallback !== undefined && font.charToGlyphIndex(fallback) !== 0) {
      return { character: fallback, source: 'fallback' }
    }
    return { character, source: 'missing' }
  })
}

/**
 * Trace one point array out of the font, in stave-line intervals.
 *
 * A few glyphs are engraved smaller than the rest — time signature digits,
 * metronome-mark notes — so the entry's scale reduces the size the glyph is
 * drawn at, rather than shrinking the path afterwards. Tracing at the smaller
 * size is what the committed fonts did, and it keeps the curve rounding honest.
 */
function tracePoints(characters, font, musicFontSourceSize, scale) {
  return pointsInStaveIntervals(
    generateUnicodePoints(
      characters,
      font,
      null,
      musicFontSourceSize * (scale === undefined ? 1 : scale),
      INTERVAL_BETWEEN_STAVE_LINES
    ),
    INTERVAL_BETWEEN_STAVE_LINES
  )
}

/**
 * Bounding box of a point array.
 *
 * Measured in pixels, because bboxForPath's "is this cubic really a quadratic"
 * epsilon is an absolute one: the same path measured in stave-line intervals
 * takes different branches and comes out a hair different. Pixels are also what
 * the drawer itself measures.
 */
function boundingBox(points) {
  if (!points.length) {
    return null
  }
  const pixels = points.map(
    (point) => typeof point === 'number' ? point * INTERVAL_BETWEEN_STAVE_LINES : point
  )
  const box = bboxForPath(pixels.join(' '))
  return {
    left: box.minLeft,
    top: box.minTop,
    width: box.maxRight - box.minLeft,
    height: box.maxBottom - box.minTop,
    intervalWidth: (box.maxRight - box.minLeft) / INTERVAL_BETWEEN_STAVE_LINES,
    intervalHeight: (box.maxBottom - box.minTop) / INTERVAL_BETWEEN_STAVE_LINES
  }
}

/**
 * Render one report row's glyph, at a size that keeps the whole table legible.
 */
function previewSvg(points) {
  const box = boundingBox(points)
  if (!box) {
    return '<span class="empty">no points</span>'
  }
  // 16px per stave-line interval reads comfortably next to 14px body text.
  const pixelsPerInterval = 16
  const path = points.map(
    (point) => typeof point === 'number' ? point * INTERVAL_BETWEEN_STAVE_LINES : point
  )
  return [
    `<svg viewBox="${box.left.toFixed(2)} ${box.top.toFixed(2)}`,
    `${box.width.toFixed(2)} ${box.height.toFixed(2)}"`,
    `height="${Math.min(96, Math.max(10, box.intervalHeight * pixelsPerInterval)).toFixed(0)}"`,
    `width="${Math.min(240, Math.max(6, box.intervalWidth * pixelsPerInterval)).toFixed(0)}">`,
    `<path d="${path.join(' ')}" fill="currentColor" fill-rule="evenodd"/></svg>`
  ].join(' ')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function reportHtml(fontName, rows) {
  const missing = rows.filter((row) => row.missing).length
  const drifted = rows.filter((row) => row.drift).length

  const body = rows.map((row) => {
    const badges = [
      row.missing ? '<span class="badge missing">MISSING</span>' : '',
      row.drift ? `<span class="badge drift">DRIFT ${escapeHtml(row.drift)}</span>` : '',
      row.source === 'fallback' ? '<span class="badge fallback">FALLBACK</span>' : ''
    ].join('')

    return [
      `<tr class="${row.missing ? 'is-missing' : ''}">`,
      `<td class="name"><code>${escapeHtml(row.id)}</code>${badges}</td>`,
      `<td class="unicode"><code>${escapeHtml(row.unicode)}</code></td>`,
      `<td class="glyph">${row.svg}</td>`,
      '</tr>'
    ].join('')
  }).join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fontName)} — music-js glyphs</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; padding: 24px;
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #fff; color: #111;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .summary { color: #555; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e3e3e3; vertical-align: middle; }
  th { position: sticky; top: 0; background: #fff; border-bottom: 2px solid #111; }
  td.name { width: 34%; }
  td.unicode { width: 16%; white-space: nowrap; }
  td.glyph { color: #111; }
  tr.is-missing { background: #fff5f5; }
  code { font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
  .badge {
    display: inline-block; margin-left: 8px; padding: 1px 6px; border-radius: 3px;
    font-size: 10px; font-weight: 600; letter-spacing: .04em; vertical-align: middle;
  }
  .missing { background: #d92d20; color: #fff; }
  .drift { background: #f5a623; color: #3a2500; }
  .fallback { background: #dbe7ff; color: #14306e; }
  .empty { color: #b42318; font-size: 12px; }
  @media (prefers-color-scheme: dark) {
    body { background: #16181d; color: #e8e8ea; }
    th { background: #16181d; border-bottom-color: #e8e8ea; }
    th, td { border-bottom-color: #2c3039; }
    .summary { color: #a0a4ad; }
    td.glyph { color: #e8e8ea; }
    tr.is-missing { background: #2a1b1b; }
    .fallback { background: #1d3260; color: #cfe0ff; }
  }
</style>
</head>
<body>
<h1>${escapeHtml(fontName)}</h1>
<p class="summary">
  ${rows.length} glyphs · ${missing} missing · ${drifted} drifting from Bravura ·
  rendered from the generated point arrays at
  ${INTERVAL_BETWEEN_STAVE_LINES}px between stave lines
</p>
<table>
<thead><tr><th>name</th><th>unicode</th><th>glyph</th></tr></thead>
<tbody>
${body}
</tbody>
</table>
</body>
</html>
`
}

async function main() {
  const args = process.argv.slice(2)
  const htmlFlag = args.indexOf('--html')
  const htmlOverride = htmlFlag === -1 ? null : args[htmlFlag + 1]
  const positional = htmlFlag === -1 ? args : [ ...args.slice(0, htmlFlag), ...args.slice(htmlFlag + 2) ]
  const [ fontArg, outputArg ] = positional

  if (!fontArg || !outputArg) {
    throw new Error(
      'Usage: node src/tools/generate-smufl-js-font.js <font.otf> <output.js> [--html <path>]'
    )
  }

  const fontPath = path.resolve(fontArg)
  const outputPath = path.resolve(outputArg)
  const htmlPath = htmlOverride ? path.resolve(htmlOverride) : `${outputPath}.preview.html`

  if (!fs.existsSync(fontPath)) {
    throw new Error(`Can't find music font: ${fontPath}`)
  }

  const font = await opentype.load(fontPath)
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
  const { lines, entries, arrays } = scanMusicJsFont(template)

  const sourceSize = template.match(/musicFontSourceSize: ([\d.]+)/)
  if (!sourceSize) {
    throw new Error('Template does not declare musicFontSourceSize')
  }
  const musicFontSourceSize = Number(sourceSize[1])

  console.log(`Tracing ${path.basename(fontPath)} at ${musicFontSourceSize} * ${INTERVAL_BETWEEN_STAVE_LINES}px`)
  console.log(`Template: ${TEMPLATE_PATH}`)
  console.log(`Output:   ${outputPath}`)
  console.log()

  const replacements = []
  const rows = []
  let missingCount = 0
  let fallbackCount = 0
  let driftCount = 0

  // Resolve every entry's codepoints, then trace each of its point arrays.
  for (const [ entryPath, glyph ] of Object.entries(glyphTable)) {
    const entry = entries.get(entryPath)
    if (!entry) {
      console.warn(`  ! '${entryPath}' is in the glyph table but not in the template`)
      continue
    }

    const resolved = resolveCharacters(font, glyph)
    const resolvedUnicode = resolved.map((one) => one.character).join('')

    if (entry.unicodeLine !== -1) {
      replacements.push({
        startLine: entry.unicodeLine,
        endLine: entry.unicodeLine,
        textLines: [
          `${' '.repeat(entry.unicodeIndent)}unicode: ${escapedUnicode(resolvedUnicode)},`
        ]
      })
    }

    for (const [ index, array ] of entry.fields.entries()) {
      /*
      An entry with one point field draws its whole codepoint string as a
      single text run — `breathMarkAsDoubleSlash` is one glyph twice. An entry
      with several takes one character per field, in template order: upPoints
      then downPoints, leftPoints then centerPoints then rightPoints.
      */
      const single = entry.fields.length <= 1
      const used = single ? resolved : [ resolved[index] ]
      const characters = used.map((one) => one.character).join('')
      const source = used.some((one) => one.source === 'missing')
        ? 'missing'
        : used.some((one) => one.source === 'fallback') ? 'fallback' : 'smufl'

      const points = source === 'missing'
        ? []
        : tracePoints(characters, font, musicFontSourceSize, glyph.scale)

      const reference = glyph.bbox ? glyph.bbox[index] : null
      const box = boundingBox(points)
      let drift = null
      if (box && reference) {
        const widthDrift = Math.abs(box.intervalWidth - reference[0])
        const heightDrift = Math.abs(box.intervalHeight - reference[1])
        if (widthDrift > DRIFT_THRESHOLD || heightDrift > DRIFT_THRESHOLD) {
          drift = [
            `${reference[0]}×${reference[1]} →`,
            `${box.intervalWidth.toFixed(2)}×${box.intervalHeight.toFixed(2)}`
          ].join(' ')
        }
      }

      if (source === 'missing') {
        missingCount++
        console.warn(`  ! ${array.id}: ${unicodeLabel(characters)} not in the font — points left empty`)
      } else if (source === 'fallback') {
        fallbackCount++
      }
      if (drift) {
        driftCount++
      }

      // A missing glyph collapses its whole array to `[]`, so the gap is plain
      // to see; a traced one replaces just the marker line.
      const closing = lines[array.endLine]
      replacements.push(
        source === 'missing'
          ? {
            startLine: array.startLine,
            endLine: array.endLine,
            textLines: [ `${array.indent}${array.field}: []${closing.trim().endsWith(',') ? ',' : ''}` ]
          }
          : {
            startLine: array.startLine + 1,
            endLine: array.endLine - 1,
            textLines: pointArrayLines(points).map(
              (line) => `${array.indent}  ${line}`
            )
          }
      )

      rows.push({
        id: array.id,
        unicode: `${unicodeLabel(characters)}${source === 'fallback' ? ' (fallback)' : ''}`,
        svg: previewSvg(points),
        missing: source === 'missing',
        source,
        drift
      })
    }
  }

  // Anything still holding a marker means the table and template disagree.
  const untouched = arrays.filter(
    (array) => !entries.get(array.entry.path) || !glyphTable[array.entry.path]
  )
  for (const array of untouched) {
    if (array.body.some((line) => line.includes('__POINTS:'))) {
      throw new Error(`No glyph table row for '${array.entry.path}' (marker ${array.id})`)
    }
  }

  replacements.sort((one, another) => one.startLine - another.startLine)

  const output = []
  let cursor = 0
  for (const replacement of replacements) {
    output.push(...lines.slice(cursor, replacement.startLine))
    output.push(...replacement.textLines)
    cursor = replacement.endLine + 1
  }
  output.push(...lines.slice(cursor))

  const generated = output.join('\n')
  if (generated.includes('__POINTS:') || generated.includes('__UNICODE:')) {
    throw new Error('Template markers left unfilled — the glyph table is incomplete')
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, generated, 'utf-8')
  fs.writeFileSync(htmlPath, reportHtml(path.basename(fontPath), rows), 'utf-8')

  console.log()
  console.log(`${rows.length} point arrays: ${rows.length - missingCount} traced, ${missingCount} empty`)
  console.log(`${fallbackCount} resolved through a private-use fallback`)
  console.log(`${driftCount} drift from Bravura by more than ${DRIFT_THRESHOLD} stave-line intervals`)
  if (driftCount) {
    console.log('  re-tune yCorrection / yOffset for:')
    for (const row of rows.filter((one) => one.drift)) {
      console.log(`    ${row.id.padEnd(44)} ${row.drift}`)
    }
  }
  console.log()
  console.log(`Wrote ${outputPath}`)
  console.log(`Report ${htmlPath}`)
}

main().catch((error) => {
  console.error('[generate-smufl-js-font] Error:', error.message)
  process.exit(1)
})
