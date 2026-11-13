'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { applyDegradations } from '#msq/omr/training/applyDegradations.js'
import { drawSymbolSample, drawableClassIds } from '#msq/omr/training/drawSymbols.js'
import { resampleToGrid } from '#msq/omr/training/cropComponents.js'

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
      const pixels = resampleToGrid(
        degraded,
        { x1: 0, y1: 0, x2: degraded.width, y2: degraded.height },
        gridSize
      )
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

export default generateTrainingSet
