#!/usr/bin/env node

/*
The landing page's two pieces of artwork, engraved by the engine itself.

A page about writing music with words should not be decorated with a drawing of
music. Both of these come out of the same pipeline the product runs: a few words
of MSQ in, an SVG out. So the notes on the opening screen are really engraved,
and the notehead in the section rail is really a notehead from the music font —
adjust the source below and the page follows.

    npm run docs:art

Writes into docs/web-app/static/images/. Both files are committed: they change
only when this script or the fonts change, and the landing page should not have
to wait for the engine to start before it can draw its own header.
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  setupFonts,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage
} from '#msq/api.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const fontDir = path.join(projectRoot, 'src', 'drawer', 'font')
const outDir = path.join(projectRoot, 'docs', 'web-app', 'static', 'images')

const fontPath = (...parts) => path.join(fontDir, ...parts)

const fontConfig = {
  'chord-letters': {
    'gentium plus': fontPath('chord-letters', 'GentiumPlus-Regular.ttf')
  },
  'text': {
    'noto-serif': {
      'regular': fontPath('text', 'NotoSerif-Regular.ttf'),
      'bold': fontPath('text', 'NotoSerif-Bold.ttf')
    }
  },
  'music': {
    'bravura': {
      'font': fontPath('music', 'Bravura.otf'),
      'js': '#msq/drawer/font/music-js/bravura.js'
    }
  }
}

/*
The opening phrase. Beamed quavers so the shape reads as music at a glance even
at the size the header draws it, and no clef or time signature — the screen
wants a stave with notes on it, not a score.

The page is narrow on purpose, and 260 exactly.

A measure is ruled to the width of the page it is on while its notes keep their
natural spacing, so on a default page these eight fill a fifth of the stave and
the rest is an empty rule. Narrow it too far, though, and the music runs past
the edge — at which point the engine rules a dashed line down the page width to
say so. That dash is a warning, not an ornament. 260 is the first width that
holds the clef and all eight notes without raising it, and they still fill 94%
of the stave.

Check it after any change to the music: a dashed vertical line in the artwork
means this number is now too small.
*/
const PHRASE = `
page line width is 260
no opening barline
treble clef
1/8 g beamed, a, b, c5 not beamed
d5 beamed, c5, b, a not beamed
`

/*
One quaver, alone, for the section rail. `no opening barline` keeps the
barline out of it, and what is left on the page is a stave and a single note.
*/
const ONE_NOTE = `
no opening barline
1/8 c
`

async function engrave(pageText) {
  const supportedFontSources = await setupFonts(fontConfig)

  const { pageSchema, customStyles, errors } = generateIntermediateStructuresForSinglePage({ pageText })
  if (errors && errors.length) {
    throw new Error(`the source does not parse:\n  ${errors.join('\n  ')}`)
  }

  const pageStyles = generateStylesForSinglePage({ customStyles, supportedFontSources })
  return generateSvgForSinglePage({ pageSchema, pageStyles })
}

/**
 * The `<g data-name="…">` subtree, still standing where the engine put it.
 *
 * Tags are balanced rather than matched lazily, and — this is the part that
 * matters — the transforms of every group it was nested in are carried with it.
 * The engine positions a note by translating the groups above it, so a subtree
 * lifted out on its own draws at the wrong place, while the bounds it records
 * are for the page. Taking the ancestors' transforms along keeps the two
 * agreeing.
 */
function group(svg, name) {
  const open = new RegExp(`<g data-name="${name}"[^>]*>`)
  const start = svg.search(open)
  if (start === -1) {
    throw new Error(`the engine drew no "${name}" group`)
  }

  // Which groups are still open at the point this one starts.
  const ancestors = []
  const before = /<g\b([^>]*)>|<\/g>/g
  let tag
  while ((tag = before.exec(svg)) !== null && tag.index < start) {
    if (tag[0] === '</g>') {
      ancestors.pop()
    } else {
      ancestors.push(tag[1])
    }
  }

  const tags = /<g\b[^>]*>|<\/g>/g
  tags.lastIndex = start
  let depth = 0
  let match
  let fragment = null
  while ((match = tags.exec(svg)) !== null) {
    depth += match[0] === '</g>' ? -1 : 1
    if (depth === 0) {
      fragment = svg.slice(start, match.index + match[0].length)
      break
    }
  }
  if (fragment === null) {
    throw new Error(`the "${name}" group is never closed`)
  }

  const transforms = ancestors
    .map((attributes) => (/\stransform="([^"]*)"/.exec(attributes) || [])[1])
    .filter(Boolean)

  return transforms.reduceRight(
    (inner, transform) => `<g transform="${transform}">${inner}</g>`,
    fragment
  )
}

/**
 * Give every stave line an element of its own.
 *
 * The engine draws a stave as a single path with five subpaths in it, which is
 * the right way to draw one and the wrong way to animate one: there is nothing
 * in the document to rule one line before the next. Each subpath becomes its
 * own path, numbered from the top, and the landing page stages them by that
 * number so the stave is ruled line by line the way it would be by hand.
 *
 * Splitting on `M` is safe here because these are the engine's own stave
 * rectangles — five closed subpaths, absolute coordinates, no curves.
 */
function splitStaveLines(svg) {
  return svg.replace(
    /(<g data-name="stavePiece"[^>]*>)<path\b([^>]*)><\/path><\/g>/g,
    (whole, open, attributes) => {
      const d = /\sd="([^"]*)"/.exec(attributes)
      if (!d) {
        return whole
      }

      const subpaths = d[1].split(/(?=M )/).map((part) => part.trim()).filter(Boolean)
      if (subpaths.length < 2) {
        return whole
      }

      const rest = attributes.replace(/\sd="[^"]*"/, '')
      const lines = subpaths
        .map((subpath, index) => `<path d="${subpath}"${rest} data-stave-line="${index}"></path>`)
        .join('')

      return `${open}${lines}</g>`
    }
  )
}

/** What the engine actually drew, from the bounds it records on every group. */
function bounds(fragment, margin = 2) {
  const read = (attribute) =>
    [ ...fragment.matchAll(new RegExp(`data-${attribute}="(-?[\\d.]+)"`, 'g')) ]
      .map((match) => Number(match[1]))

  const left = Math.min(...read('left')) - margin
  const right = Math.max(...read('right')) + margin
  const top = Math.min(...read('top')) - margin
  const bottom = Math.max(...read('bottom')) + margin
  return { left, top, width: right - left, height: bottom - top }
}

/*
The engine draws a page — a sheet of paper with a stave somewhere on it — and
most of that page is empty. These two want the drawing rather than the sheet,
so the paper is dropped and the viewBox pulled in to what was drawn.

Colours go too. The artwork should follow the stylesheet, so everything is set
to currentColor and coloured by whatever it is placed in.
*/
function artwork(fragment, { margin } = {}) {
  const box = bounds(fragment, margin)

  const body = splitStaveLines(
    fragment
      .replace(/fill="#FFFFFF"/gi, 'fill="none"')
      .replace(/(fill|stroke)="#[0-9a-f]{3,8}"/gi, '$1="currentColor"')
  )

  return [
    '<svg xmlns="http://www.w3.org/2000/svg"',
    ` viewBox="${+box.left.toFixed(2)} ${+box.top.toFixed(2)}`,
    ` ${+box.width.toFixed(2)} ${+box.height.toFixed(2)}"`,
    ' fill="currentColor" preserveAspectRatio="xMidYMid meet" aria-hidden="true">',
    body,
    '</svg>'
  ].join('')
}

function write(name, svg) {
  /*
  The engine rules a dashed line down the page width when the music runs past
  it. On a page that is a warning to the person writing; here it would be a
  stray dash across the artwork, so it fails the build instead of shipping.
  */
  if (/stroke-dasharray="8\.5/.test(svg)) {
    throw new Error(
      `${name}: the music overflows its page line width — the engine has ruled ` +
      'the overflow line into the artwork. Widen the page in the source above.'
    )
  }

  const file = path.join(outDir, name)
  fs.writeFileSync(file, `${svg}\n`)
  console.log(`[generate-landing-art] Output: ${file} (${svg.length} bytes)`)
}

try {
  fs.mkdirSync(outDir, { recursive: true })

  /*
  The phrase keeps the stave it is written on: `measures` is the stave lines,
  the notes and the beams together, which is what the opening screen animates.
  */
  write('phrase.svg', artwork(group(await engrave(PHRASE), 'measures'), { margin: 4 }))

  /*
  The rail wants the note and nothing else — no stave, no barline — so only
  the one unit is taken out of the page around it.
  */
  write('note.svg', artwork(group(await engrave(ONE_NOTE), 'singleUnit'), { margin: 0.5 }))
} catch (error) {
  console.error('[generate-landing-art] Error:', error.message)
  process.exit(1)
}
