#!/usr/bin/env node

/**
 * Music-js font generator.
 *
 * Traces every glyph MuSemantiQ draws out of a SMuFL `.otf` and writes the font
 * file the drawer consumes, in the same shape as
 * src/drawer/font/music-js/bravura.js.
 *
 * The tracing is the one the legacy font viewer used (unison's
 * ViewFontEndpoint): draw the character at `musicFontSourceSize * interval` with
 * the baseline centred, move the path to the top-left corner, then write each
 * coordinate as `n.nn * intervalBetweenStaveLines`, command letters quoted on
 * their own line.
 *
 * The shape itself — which entries exist, their codepoints, and every
 * adjustment value — comes from scaffold.js beside it, whose values are the
 * mean of bravura.js and leland.js. Nothing here computes a correction: a
 * generated font starts from that midpoint and is tuned in the font viewer.
 *
 * Usage:
 *
 *   node tools/smufl/generate-smufl-js-font.js <font.otf> <output.js>
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import opentype from '#msq/drawer/lib/opentype/opentype.js'
import generateUnicodePoints from '#msq/drawer/generateUnicodePoints.js'
import scaffold from '#tools/smufl/scaffold.js'

// The interval the committed fonts were traced at, and the divisor their
// coordinates are written in.
const INTERVAL_BETWEEN_STAVE_LINES = 8.5

// The music-js files write coordinates to this many decimals.
const COORDINATE_DECIMALS = 2

const MULTIPLIER = {
  interval: ' * intervalBetweenStaveLines',
  default: ' * MUSCIC_FONT_SOURCE_SIZE * defaultIntervalBetweenStaveLines',
  plain: ''
}

function unicodeLabel(characters) {
  return [ ...characters ].map(
    (character) => 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  ).join(' ')
}

function escapedUnicode(characters) {
  return `'${[ ...characters ].map(
    (character) => '\\u' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  ).join('')}'`
}

/*
What stands in for a glyph the font does not have.

Its own "?" where there is one, so the substitute is drawn in the same hand as
everything around it. A SMuFL font usually has no such thing — Bravura maps 3298
private-use glyphs and exactly one ASCII character, the space — so the text font
below is what actually draws it nearly every time. The drawer already does this
same substitution at draw time, in elements/basic/text.js.
*/
const SUBSTITUTE = '?'
const SUBSTITUTE_FONT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
  'src/drawer/font/text/NotoSerif-Regular.ttf'
)

const indentOf = (depth) => ' '.repeat(depth * 2)

const quoteKey = (key) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : `'${key}'`

/**
 * Trace one glyph into music-js coordinates.
 *
 * `generateUnicodePoints` returns pixels at the size it drew; dividing by the
 * interval turns them into the multiples the file is written in.
 *
 * A few glyphs are engraved smaller than the rest — time-signature digits,
 * metronome-mark notes — so the entry's scale reduces the size the glyph is
 * drawn at, rather than shrinking the traced path afterwards. Tracing small is
 * what the committed fonts did, and it keeps the curve rounding honest.
 */
function tracePoints(characters, font, musicFontSourceSize, scale = 1) {
  return generateUnicodePoints(
    characters, font, null, musicFontSourceSize * scale, INTERVAL_BETWEEN_STAVE_LINES
  ).map(
    (point) => typeof point === 'string'
      ? point
      : Number((point / INTERVAL_BETWEEN_STAVE_LINES).toFixed(COORDINATE_DECIMALS))
  )
}

/**
 * Lay a point array out the way the committed fonts write it: every command
 * letter on its own line, followed by the coordinates it takes.
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
      // A coordinate that rounds to negative zero keeps its sign, the way
      // toFixed wrote it before the value passed through Number.
      const written = Object.is(point, -0)
        ? `-${(0).toFixed(COORDINATE_DECIMALS)}`
        : point.toFixed(COORDINATE_DECIMALS)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flushCoordinates()

  // Commas between the lines of the array; the closing bracket supplies the rest.
  return lines.map((line, index) => index === lines.length - 1 ? line : `${line},`)
}

/**
 * Write a scalar the way the committed fonts write it: no trailing zeros, and a
 * bare integer stays bare.
 */
function scalarValue(value, unit) {
  return `${String(Number(value.toFixed(4)))}${MULTIPLIER[unit]}`
}

/**
 * Render one scaffold node as a property: its name, and the lines of its value.
 *
 * Commas are added by the caller, which is the only place that knows whether a
 * property is the last of its object.
 */
function renderNode(node, depth, context) {
  const pad = indentOf(depth)
  const key = quoteKey(node.name)

  if (node.kind === 'scalar') {
    return [ `${pad}${key}: ${scalarValue(node.value, node.unit)}` ]
  }
  if (node.kind === 'literal') {
    return [ `${pad}${key}: ${JSON.stringify(node.value)}` ]
  }
  if (node.kind === 'array') {
    return [ `${pad}${key}: [ ${node.value.join(', ')} ]` ]
  }
  if (node.kind === 'group') {
    return [
      `${pad}${key}: {`,
      ...properties(node.entries.map((entry) => renderNode(entry, depth + 1, context))),
      `${pad}}`
    ]
  }

  const characters = [ ...node.smufl ]
  const parts = [ [ `${indentOf(depth + 1)}unicode: ${escapedUnicode(node.smufl)}` ] ]

  node.fields.forEach((field, index) => {
    /*
    One point field means the whole codepoint string is drawn as a single run;
    several mean one character each, in the order the fields are listed — an up
    and a down form, or the three pieces of a multi-measure rest.
    */
    const drawn = node.fields.length <= 1 ? node.smufl : characters[index]
    const missing = [ ...drawn ].filter(
      (character) => context.font.charToGlyphIndex(character) === 0
    )

    if (missing.length) {
      context.missing.push(`${node.name}.${field}: ${unicodeLabel(drawn)}`)
      /*
      A gap is drawn as this font's own question mark rather than left empty.

      An empty point array is worse than an invisible symbol: it joins to a d of
      nothing, and the bounding box of an empty path comes back as its own
      initialisers — top Infinity, right -Infinity — which spread into whatever
      lays the page out and surface much later as a NaN thrown from somewhere
      unrelated. A "?" is a real path with a real box, and it says on the page
      which symbol the font was missing.

      Traced through the same call the glyph itself would have used, so it lands
      in the same coordinate space at the same scale.
      */
      if (!context.substituteFont) {
        // Nothing to draw it with: no "?" in this font and none to borrow.
        parts.push([ `${indentOf(depth + 1)}${field}: []` ])
        return
      }

      const substitute = tracePoints(
        SUBSTITUTE, context.substituteFont, context.musicFontSourceSize, node.scale
      )
      context.substituted++
      parts.push([
        `${indentOf(depth + 1)}${field}: [`,
        ...pointArrayLines(substitute).map((line) => `${indentOf(depth + 2)}${line}`),
        `${indentOf(depth + 1)}]`
      ])
      return
    }

    context.traced++
    parts.push([
      `${indentOf(depth + 1)}${field}: [`,
      ...pointArrayLines(
        tracePoints(drawn, context.font, context.musicFontSourceSize, node.scale)
      ).map((line) => `${indentOf(depth + 2)}${line}`),
      `${indentOf(depth + 1)}]`
    ])
  })

  for (const adjustment of node.rest || []) {
    parts.push(renderNode(adjustment, depth + 1, context))
  }

  return [ `${pad}${key}: {`, ...properties(parts), `${pad}}` ]
}

/**
 * Comma-separate a list of properties, each of which may span several lines.
 */
function properties(rendered) {
  return rendered.flatMap((lines, index) => {
    const last = index === rendered.length - 1
    return lines.map(
      (line, position) => (!last && position === lines.length - 1) ? `${line},` : line
    )
  })
}

function generate(font, fontPath, substituteFont) {
  const sourceSize = scaffold.find((node) => node.name === 'musicFontSourceSize')
  const musicFontSourceSize = sourceSize ? sourceSize.value : 4.0
  const context = {
    font, substituteFont, musicFontSourceSize, traced: 0, substituted: 0, missing: []
  }

  const body = properties([
    [ `${indentOf(2)}musicFontSource` ],
    ...scaffold.map((node) => renderNode(node, 2, context))
  ])

  const file = `'use strict'

// font size(for font file) is ${musicFontSourceSize} * intervalBetweenStaveLines
const MUSCIC_FONT_SOURCE_SIZE = ${musicFontSourceSize.toFixed(1)}

/*
Generated by tools/smufl/generate-smufl-js-font.js from ${path.basename(fontPath)}.

The point arrays are traced from that font. Every other value starts from
tools/smufl/scaffold.js, which holds the mean of bravura.js and
leland.js — tune them in the font viewer at /html/font-viewer.html.
*/
export default function ({
  defaultIntervalBetweenStaveLines,
  intervalBetweenStaveLines,
  musicFontSource
}) {
  return {
${body.join('\n')}
  }
}
`
  return { file, ...context }
}

async function main() {
  const [ fontArg, outputArg ] = process.argv.slice(2)
  if (!fontArg || !outputArg) {
    throw new Error('Usage: node tools/smufl/generate-smufl-js-font.js <font.otf> <output.js>')
  }

  const fontPath = path.resolve(fontArg)
  const outputPath = path.resolve(outputArg)
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Can't find music font: ${fontPath}`)
  }

  const font = await opentype.load(fontPath)

  /*
  What draws the gaps. This font's own "?" if it has one, and otherwise the
  text font's — a SMuFL font almost never carries ASCII, so it is nearly always
  the borrowed one that gets used.
  */
  let substituteFont = font.charToGlyphIndex(SUBSTITUTE) === 0 ? null : font
  let borrowed = false
  if (!substituteFont && fs.existsSync(SUBSTITUTE_FONT)) {
    substituteFont = await opentype.load(SUBSTITUTE_FONT)
    borrowed = true
  }

  const { file, traced, substituted, missing } = generate(font, fontPath, substituteFont)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, file, 'utf-8')

  const drawnAs = !substituteFont
    ? 'written as an empty array — there is no "?" to stand in for it'
    : borrowed
      ? `not in this font — drawn as the "?" of ${path.basename(SUBSTITUTE_FONT)}`
      : 'not in this font — drawn as its own "?"'
  for (const gap of missing) {
    console.warn(`  ! ${gap} is ${drawnAs}`)
  }
  console.log(
    `${traced} point arrays traced, ${missing.length} missing` +
    `${substituted ? ` (${substituted} drawn as "?")` : ''}`
  )
  console.log(`Wrote ${outputPath}`)
}

main().catch((error) => {
  console.error('[generate-smufl-js-font] Error:', error.message)
  process.exit(1)
})
