'use strict'

import removeStaffLines from '#msq/omr/analysis/removeStaffLines.js'
import findBarLines from '#msq/omr/analysis/findBarLines.js'
import findStems, { measureStemEnds } from '#msq/omr/analysis/findStems.js'
import findSymbolComponents from '#msq/omr/analysis/findSymbolComponents.js'
import splitTouchingComponents from '#msq/omr/analysis/splitTouchingComponents.js'
import findSlurOrTieComponents from '#msq/omr/analysis/findSlurOrTieComponents.js'
import findHairpinComponents from '#msq/omr/analysis/findHairpinComponents.js'
import hasPlausibleClassGeometry from '#msq/omr/analysis/hasPlausibleClassGeometry.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

/**
 * What the ink is, where it is.
 *
 * Lines first — barlines and stems are geometry — then whatever ink is left
 * is blobs, and each blob is classified. Every symbol carries its stave and,
 * for blobs, its staff position in half staff-spaces from the top line: the
 * number the pitch rule reads. The classifier is passed in, so the rules stay
 * testable against exact classes and the default stays the trained model.
 */

export function extractSymbols (bitmap, staves, { classify, textBlocks = [] }) {
  const withoutLines = removeStaffLines(bitmap, staves)
  const barLines = findBarLines(withoutLines, staves)
  const stems = findStems(withoutLines, staves)
  const withoutLinesAndStems = clearVerticalRuns(withoutLines, [ ...stems, ...barLines ])
  const rawComponents = findSymbolComponents(withoutLinesAndStems)
    .filter((component) => !insidePageText(component.box, textBlocks))
  const hairpins = findHairpinComponents(withoutLinesAndStems, rawComponents, staves)
  const hairpinBoxes = new Set(hairpins.map((hairpin) => hairpin.box))
  const curves = findSlurOrTieComponents(withoutLinesAndStems, rawComponents.filter((component) => !hairpinBoxes.has(component.box)), staves)
  const curveBoxes = new Set(curves.map((curve) => curve.box))
  const components = splitTouchingComponents(withoutLinesAndStems, rawComponents.filter((component) => !hairpinBoxes.has(component.box) && !curveBoxes.has(component.box)))
  const blobs = components.map((component) => {
    const pixels = cropPixels(withoutLinesAndStems, component.box)
    // One-dimensional ink is geometry or a fragment, never a complete glyph.
    const answer = component.box.w < 2 || component.box.h < 2 || component.ink < 2
      ? { className: 'other', confidence: 1, candidates: [] }
      : classify(pixels, component.box, withoutLinesAndStems)
    const staveIndex = staveIndexOf(component.box, staves)
    const staffSpace = staveIndex === null ? mean(staves.map((stave) => stave.staffSpaceHeightPx)) : staves[staveIndex].staffSpaceHeightPx
    const plausible = answer.className === 'unknown' || answer.className === 'other' ||
      hasPlausibleClassGeometry(answer.className, component.box, staffSpace)
    return {
      kind: 'blob',
      className: plausible ? answer.className : 'other',
      confidence: answer.confidence,
      candidates: answer.candidates,
      ...(!plausible ? { rejectedClassName: answer.className, rejectionReason: 'implausible glyph geometry' } : {}),
      box: component.box,
      staveIndex,
      staffPosition: staffPositionOf(component.box, staves)
    }
  })
  for (const stem of stems) {
    stem.kind = 'stem'
    stem.stemDirection = headSideOf(stem, blobs)
    // the head hangs at one end, so beams and flags can only be at the other
    const outerEnd = stem.stemDirection === 'up' ? stem.y1 : stem.y2
    measureStemEnds(stem, withoutLines, staves[stem.staveIndex].staffSpaceHeightPx, outerEnd)
  }
  return {
    blobs,
    stems,
    barLines,
    curves,
    hairpins
  }
}

function insidePageText (box, textBlocks) {
  const centerX = box.x + (box.w - 1) / 2
  const centerY = box.y + (box.h - 1) / 2
  return textBlocks.some((block) => block.role !== 'text' &&
    centerX >= block.box.x && centerX <= block.box.x + block.box.w - 1 &&
    centerY >= block.box.y && centerY <= block.box.y + block.box.h - 1)
}

function clearVerticalRuns (bitmap, runs) {
  const cleared = new Float32Array(bitmap.grayscale)
  for (const run of runs) {
    const center = Math.round(run.x)
    const halfWidth = Math.max(0, Math.floor((run.columns || 1) / 2))
    for (let x = center - halfWidth; x <= center + halfWidth; x++) {
      for (let y = Math.round(run.y1); y <= Math.round(run.y2); y++) {
        if (x >= 0 && x < bitmap.width && y >= 0 && y < bitmap.height) {
          cleared[y * bitmap.width + x] = 0
        }
      }
    }
  }
  return { width: bitmap.width, height: bitmap.height, grayscale: cleared }
}

function cropPixels (bitmap, box) {
  const pixels = new Float64Array(box.w * box.h)
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      pixels[y * box.w + x] = bitmap.grayscale[(box.y + y) * bitmap.width + box.x + x]
    }
  }
  return pixels
}

function staveIndexOf (box, staves) {
  const centerY = box.y + (box.h - 1) / 2
  let best = null
  let bestDistance = Infinity
  staves.forEach((stave, index) => {
    // Ledger notes need several spaces, but distant titles and page furniture
    // must not silently become notes on the first staff.
    const margin = 4.5 * stave.staffSpaceHeightPx
    const distance = centerY < stave.topY
      ? stave.topY - centerY
      : centerY > stave.bottomY
        ? centerY - stave.bottomY
        : 0
    if (distance <= margin && distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  return best
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

// Half staff-spaces down from the top line: 0 is the top line, 1 is the first
// space, 2 the second line. This is the pitch rule's input.
function staffPositionOf (box, staves) {
  const staveIndex = staveIndexOf(box, staves)
  if (staveIndex === null) {
    return null
  }
  const stave = staves[staveIndex]
  const centerY = box.y + (box.h - 1) / 2
  return Math.round((centerY - stave.linesY[0]) / (stave.staffSpaceHeightPx / 2))
}

// A stem points away from its head: up when the head hangs below it.
function headSideOf (stem, blobs) {
  const nearTop = blobs.some((blob) => touchesStemEnd(blob, stem.x, stem.y1))
  const nearBottom = blobs.some((blob) => touchesStemEnd(blob, stem.x, stem.y2))
  return nearTop && !nearBottom ? 'down' : 'up'
}

// The stem's end sits at the head's edge, so a head within its own height of
// the end is the head of that stem.
function touchesStemEnd (blob, x, y) {
  return roleOf(blob.className) === 'head' &&
    x >= blob.box.x - 1 && x <= blob.box.x + blob.box.w + 1 &&
    Math.abs(blob.box.y + blob.box.h / 2 - y) <= blob.box.h
}

export default extractSymbols
