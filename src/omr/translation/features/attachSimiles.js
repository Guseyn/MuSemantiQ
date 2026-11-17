'use strict'

import { addSourceBlobs, centerX, centerY, hasExplicitUnits, measureLocation, nearestUnit, removeGeneratedUnits, unitEntries, unitX, unitY } from './featureGeometry.js'

// A simile immediately after a chord repeats that unit. In an otherwise empty
// measure it is measure furniture; the two-measure glyph only has the latter
// meaning. One visible glyph is one repetition, with larger counts left to OCR.
export default function attachSimiles (measures, blobs, staves, barLines) {
  const similes = blobs.filter((blob) => [ 'simile', 'simile-two-measures' ].includes(blob.className))
  for (const [ index, blob ] of similes.entries()) {
    const location = measureLocation(blob, measures, staves, barLines)
    if (!location) {
      continue
    }
    if (blob.className === 'simile') {
      const interval = staves[blob.staveIndex].intervalBetweenStaveLines
      const candidates = unitEntries(measures, blob.staveIndex, { notesOnly: true })
        .filter((entry) => entry.measure === location.measure &&
          unitX(entry.unit) <= centerX(blob) + 0.25 * interval &&
          unitY(entry.unit) !== null && Math.abs(unitY(entry.unit) - centerY(blob)) <= 3 * interval)
      const entry = nearestUnit(candidates, centerX(blob), 2 * interval)
      if (entry && !entry.unit.simileMark) {
        entry.unit.simileMark = { refId: `simile-mark-${index + 1}`, count: 1, finish: true }
        addSourceBlobs(entry.unit, [ blob ])
        continue
      }
    }
    if (hasExplicitUnits(location.measure) || location.measure.isMeasureRest ||
      location.measure.similePreviousMeasureCount || location.measure.simileTwoPreviousMeasuresCount) {
      continue
    }
    if (blob.className === 'simile-two-measures') {
      location.measure.simileTwoPreviousMeasuresCount = '1'
    } else {
      location.measure.similePreviousMeasureCount = '1'
    }
    addSourceBlobs(location.measure, [ blob ])
    removeGeneratedUnits(location.measure)
  }
}
