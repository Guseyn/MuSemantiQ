'use strict'

import { addSourceBlobs, centerX, centerY, hasExplicitUnits, measureLocation, removeGeneratedUnits } from './featureGeometry.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

// The long rest proves a measure rest, not how many measures it covers. Any
// number printed above it remains an OCR target; multiMeasureRestCount is not
// fabricated from the bar or from surrounding measures.
export default function attachMeasureRests (measures, blobs, staves, barLines) {
  for (const blob of blobs.filter((item) => item.className === 'rest-measure')) {
    const location = measureLocation(blob, measures, staves, barLines)
    if (!location || hasExplicitUnits(location.measure) || location.measure.similePreviousMeasureCount ||
      location.measure.simileTwoPreviousMeasuresCount) {
      continue
    }
    location.measure.isMeasureRest = true
    const interval = staves[blob.staveIndex].intervalBetweenStaveLines
    const digits = blobs.filter((candidate) => roleOf(candidate.className) === 'digit' &&
      candidate.staveIndex === blob.staveIndex && /^digit-\d$/.test(candidate.className) &&
      Math.abs(centerX(candidate) - centerX(blob)) <= 2 * interval &&
      centerY(blob) - centerY(candidate) > 0 && centerY(blob) - centerY(candidate) <= 3 * interval
    ).sort((first, second) => centerX(first) - centerX(second))
    if (digits.length) {
      location.measure.multiMeasureRestCount = digits.map((digit) => digit.className.slice(-1)).join('')
    }
    addSourceBlobs(location.measure, [ blob, ...digits ])
    removeGeneratedUnits(location.measure)
  }
}
