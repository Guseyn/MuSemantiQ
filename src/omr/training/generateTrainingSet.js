'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { applyDegradations } from '#msq/omr/training/applyDegradations.js'
import { drawSymbolSample, drawableClassIds } from '#msq/omr/training/drawSymbols.js'
import { resampleComponentToGrid } from '#msq/omr/training/cropComponents.js'

/**
 * The training set, drawn from a seed.
 *
 * One seed gives one exact set: for each class, symbols are drawn with jitter,
 * degraded like photos, and resampled to the model's grid. The label is the
 * class the drawing came from — nothing is ever labeled by hand. The same seed
 * on any machine gives the same bytes.
 */

export function generateTrainingSet ({ seed, samplesPerClass, gridSize, classIds = drawableClassIds, onClass = null }) {
  const random = createSeededRandom(seed)
  const drawSize = gridSize * 2
  const samples = []
  for (const classId of classIds) {
    if (onClass) {
      onClass(classId, classIds.indexOf(classId) + 1, classIds.length)
    }
    for (let sample = 0; sample < samplesPerClass; sample++) {
      const drawn = drawSymbolSample(classId, drawSize, random)
      const degraded = applyDegradations(drawn, random)
      const pixels = resampleComponentToGrid(degraded, tightInkBox(degraded), gridSize)
      samples.push({ pixels, classId, classIndex: classIds.indexOf(classId) })
    }
  }
  // shuffled before returning: samples come out grouped by class, and any
  // train/validation slice of grouped data would leave whole classes unseen
  for (let index = samples.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[ samples[index], samples[swap] ] = [ samples[swap], samples[index] ]
  }
  return { classIds, samples }
}

function tightInkBox ({ width, height, grayscale }) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grayscale[y * width + x] > 0.5) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxX < 0) {
    return { x: 0, y: 0, w: width, h: height }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

export default generateTrainingSet
