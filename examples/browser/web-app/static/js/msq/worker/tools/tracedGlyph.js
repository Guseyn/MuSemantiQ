'use strict'

/**
 * Tracing one glyph the way the music-js fonts record it.
 *
 * Shared by the generator and the browser font viewer so both measure a glyph
 * identically. Keep this module free of Node built-ins.
 */

import text from '/js/msq/worker/drawer/elements/basic/text.js'
import generateUnicodePoints from '/js/msq/worker/drawer/generateUnicodePoints.js'
import { pointsInStaveIntervals } from '/js/msq/worker/tools/pointArrayLines.js'
import { INTERVAL_BETWEEN_STAVE_LINES } from '/js/msq/worker/tools/scanMusicJsFont.js'

/**
 * Trace `characters` out of `font` into music-js point coordinates, alongside
 * the vertical geometry the corrections are derived from.
 *
 * `generateUnicodePoints` shifts the path down by its own height, which puts the
 * glyph's SMuFL origin — the y the notation anchors to — at `y = height` in the
 * written coordinates. That is why `height` is the term a yCorrection is built
 * on: `yCorrection = staveLine * interval - height` places the origin on the
 * wanted line. It is measured here before that shift, where it still means
 * something.
 */
export function traceGlyph(font, characters, {
  musicFontSourceSize = 4.0,
  scale = 1,
  interval = INTERVAL_BETWEEN_STAVE_LINES
} = {}) {
  const size = musicFontSourceSize * scale

  const drawn = text(characters, {
    source: font,
    size: size * interval,
    color: '#000',
    anchor: 'center baseline'
  })({ textFontSource: null }, 0, 0)

  return {
    points: pointsInStaveIntervals(
      generateUnicodePoints(characters, font, null, size, interval), interval
    ),
    // All in stave-line intervals, relative to the glyph's baseline.
    height: (drawn.bottom - drawn.top) / interval,
    top: drawn.top / interval,
    bottom: drawn.bottom / interval,
    width: (drawn.right - drawn.left) / interval
  }
}

/*
The measurements a correction can be built on, all in stave-line intervals and
all relative to the glyph's baseline.

Which one a glyph uses depends on what the drawer positions it against: a
notehead or an accidental registers by `height`, because the trace leaves its
origin at y = height and that origin belongs on the note's own line; a rest
hangs by its `bottom`; a flag stack is pinned by `height` a fixed distance past
the stem tip. `center` registers a glyph by the middle of its ink.
*/
export const TERMS = {
  height: (glyph) => glyph.height,
  top: (glyph) => glyph.top,
  bottom: (glyph) => glyph.bottom,
  center: (glyph) => (glyph.top + glyph.bottom) / 2
}

/**
 * The vertical correction an anchored glyph gets: put `term` at `k`.
 */
export function yCorrectionFor(anchor, traced) {
  const measure = TERMS[anchor.from]
  if (!measure) {
    throw new Error(`Unknown anchor term '${anchor.from}'`)
  }
  return anchor.k - measure(traced)
}

export default traceGlyph
