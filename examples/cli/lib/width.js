/**
 * Display width in terminal cells, which is what the repaint maths needs — not
 * `string.length`, which counts UTF-16 code units.
 *
 * `util.getStringWidth` does exactly this but is Node-internal and not
 * exported, so the wide/zero-width tables below are the minimum stand-in.
 */
import { stripVTControlCharacters } from 'node:util'

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })

/* Ranges that occupy two cells: CJK, Hangul, fullwidth forms, most emoji. */
const WIDE_RANGES = [
  [ 0x1100, 0x115f ], [ 0x2e80, 0xa4cf ], [ 0xa960, 0xa97f ],
  [ 0xac00, 0xd7a3 ], [ 0xf900, 0xfaff ], [ 0xfe10, 0xfe19 ],
  [ 0xfe30, 0xfe6f ], [ 0xff00, 0xff60 ], [ 0xffe0, 0xffe6 ],
  [ 0x1f300, 0x1f64f ], [ 0x1f900, 0x1f9ff ], [ 0x20000, 0x3fffd ]
]

/* Ranges that occupy no cells: combining marks, variation selectors, joiners. */
const ZERO_WIDTH_RANGES = [
  [ 0x0300, 0x036f ], [ 0x200b, 0x200f ], [ 0xfe00, 0xfe0f ], [ 0xfeff, 0xfeff ]
]

function inRanges(codePoint, ranges) {
  for (const [ start, end ] of ranges) {
    if (codePoint >= start && codePoint <= end) {
      return true
    }
  }
  return false
}

/** Cells one grapheme cluster occupies. */
function graphemeWidth(grapheme) {
  const codePoint = grapheme.codePointAt(0)
  if (inRanges(codePoint, ZERO_WIDTH_RANGES)) {
    return 0
  }
  return inRanges(codePoint, WIDE_RANGES) ? 2 : 1
}

/**
 * Width of `text` in cells, ignoring any ANSI escapes it contains — colouring a
 * line must not change how many columns it is thought to occupy.
 */
export function displayWidth(text) {
  let width = 0
  for (const { segment } of segmenter.segment(stripVTControlCharacters(text))) {
    width += graphemeWidth(segment)
  }
  return width
}

/** The text split into grapheme clusters, so editing never splits a character. */
export function graphemes(text) {
  const list = []
  for (const { segment } of segmenter.segment(text)) {
    list.push(segment)
  }
  return list
}

/**
 * Truncate to at most `limit` cells. Never cuts a grapheme in half, and pads
 * with a space rather than letting a wide character straddle the boundary.
 */
export function truncateToWidth(text, limit) {
  if (limit <= 0) {
    return ''
  }
  if (displayWidth(text) <= limit) {
    return text
  }
  let out = ''
  let width = 0
  for (const { segment } of segmenter.segment(text)) {
    const next = graphemeWidth(segment)
    if (width + next > limit) {
      // A wide glyph that would overhang: pad so the column count stays exact.
      return width === limit ? out : out + ' '.repeat(limit - width)
    }
    out += segment
    width += next
  }
  return out
}

/** Pad on the right to exactly `target` cells (no-op if already wider). */
export function padToWidth(text, target) {
  const width = displayWidth(text)
  return width >= target ? text : text + ' '.repeat(target - width)
}
