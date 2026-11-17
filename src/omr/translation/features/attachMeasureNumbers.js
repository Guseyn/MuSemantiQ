'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, centerX, centerY, measureLocation } from './featureGeometry.js'

export default function attachMeasureNumbers (musicModel, blobs, staves, barLines) {
  const { measures } = musicModel
  const evidence = []
  for (const measure of measures) {
    const staveIndex = measure.staves[0]?.staveIndex
    if (staveIndex === undefined) {
      continue
    }
    const stave = staves[staveIndex]
    const interval = stave.intervalBetweenStaveLines
    const digits = blobs.filter((blob) => roleOf(blob.className) === 'digit' && blob.staveIndex === staveIndex &&
      measureLocation(blob, measures, staves, barLines)?.measure === measure &&
      /^digit-\d$/.test(blob.className) &&
      centerY(blob) >= stave.topY - 4 * interval && centerY(blob) <= stave.bottomY + 4 * interval &&
      (centerY(blob) < stave.topY - 0.5 * interval || centerY(blob) > stave.bottomY + 0.5 * interval)
    ).sort((first, second) => centerX(first) - centerX(second))
    const value = digits.map((digit) => digit.className.slice(-1)).join('')
    if (value !== String(measure.measureIndex + 1)) {
      continue
    }
    const direction = centerY(digits[0]) < stave.topY ? 'up' : 'down'
    evidence.push({ measure, digits, direction })
    addSourceBlobs(measure, digits)
  }
  if (evidence.length) {
    musicModel.showMeasureNumbers = evidence.length === 1 && evidence[0].measure.measureIndex === 0 ? 'first' : 'all'
    musicModel.directionOfMeasureNumbers = evidence[0].direction
  }
}
