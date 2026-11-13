'use strict'

import removeStaffLines from './removeStaffLines.js'
import findBarLines from './findBarLines.js'
import findStems, { measureStemEnds } from './findStems.js'
import findSymbolComponents from './findSymbolComponents.js'
import splitTouchingComponents from './splitTouchingComponents.js'
import { roleOf } from './symbolClasses.js'

/**
 * What the ink is, where it is.
 *
 * Lines first — barlines and stems are geometry — then whatever ink is left
 * is blobs, and each blob is classified. Every symbol carries its stave and,
 * for blobs, its staff position in half staff-spaces from the top line: the
 * number the pitch rule reads. The classifier is passed in, so the rules stay
 * testable against exact classes and the default stays the trained model.
 */

export function extractSymbols (bitmap, staves, { classify }) {
  const withoutLines = removeStaffLines(bitmap, staves)
  const barLines = findBarLines(withoutLines, staves)
  const stems = findStems(withoutLines, staves)
  const withoutLinesAndStems = clearVerticalRuns(withoutLines, [ ...stems, ...barLines.map((x) => ({ x, y1: 0, y2: bitmap.height - 1 })) ])
  const components = splitTouchingComponents(withoutLinesAndStems, findSymbolComponents(withoutLinesAndStems))
  const blobs = components.map((component) => {
    const pixels = cropPixels(withoutLinesAndStems, component.box)
    const answer = classify(pixels, component.box)
    return {
      kind: 'blob',
      className: answer.className,
      confidence: answer.confidence,
      candidates: answer.candidates,
      box: component.box,
      staveIndex: staveIndexOf(component.box, staves),
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
    barLines
  }
}

function clearVerticalRuns (bitmap, runs) {
  const cleared = new Float32Array(bitmap.grayscale)
  for (const run of runs) {
    const center = Math.round(run.x)
    for (let x = center - 1; x <= center + 1; x++) {
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
  const centerY = box.y + box.h / 2
  let best = 0
  let bestDistance = Infinity
  staves.forEach((stave, index) => {
    const margin = 1.5 * stave.staffSpaceHeightPx
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

// Half staff-spaces down from the top line: 0 is the top line, 2 is the first
// space, 4 the second line. This is the pitch rule's input.
function staffPositionOf (box, staves) {
  const stave = staves[staveIndexOf(box, staves)]
  const centerY = box.y + box.h / 2
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
