'use strict'

import { centerX, measureBounds, unitEntries } from './featureGeometry.js'

const FULL_MEASURE_REST_CLASSES = [ 'rest-whole', 'rest-double-whole', 'rest-quadruple-whole' ]

// Only an explicit, centred rest that fills its voice and its measure becomes
// isFullMeasure. Other whole rests retain their measured staff position.
export default function attachRestPositions (measures, staves, barLines, measureDuration) {
  for (let staveIndex = 0; staveIndex < staves.length; staveIndex++) {
    const entries = unitEntries(measures, staveIndex)
    for (const entry of entries.filter((candidate) => candidate.unit.isRest)) {
      const rest = (entry.unit.sourceBlobs || []).find((blob) => FULL_MEASURE_REST_CLASSES.includes(blob.className))
      if (!rest || entry.unit.numberOfDots || entry.unit.unitDuration !== measureDuration) {
        continue
      }
      const explicitUnits = entry.stave.voices[entry.voiceIndex].filter((unit) => Number.isFinite(unit.x))
      if (explicitUnits.length !== 1) {
        continue
      }
      const bounds = measureBounds(entry.measure, staveIndex, staves, barLines, measures)
      if (Math.abs(centerX(rest) - (bounds.left + bounds.right) / 2) <= 1.5 * staves[staveIndex].intervalBetweenStaveLines) {
        entry.unit.isFullMeasure = true
      }
    }
  }
}
