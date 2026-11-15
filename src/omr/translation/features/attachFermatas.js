'use strict'

import { addSourceBlobs, centerX, centerY, measureBounds, nearestUnit, unitEntries, unitX, unitY } from './featureGeometry.js'

// A fermata centred on a unit belongs to that unit. One on the final barline
// belongs to the measure; the small central overlap is resolved towards the
// unit so an ordinary last-note fermata is not promoted to measure furniture.
export default function attachFermatas (measures, blobs, staves, barLines) {
  for (const blob of blobs.filter((item) => [ 'fermata', 'fermata-down' ].includes(item.className))) {
    if (blob.staveIndex === null || blob.staveIndex === undefined) {
      continue
    }
    const interval = staves[blob.staveIndex].intervalBetweenStaveLines
    const entries = unitEntries(measures, blob.staveIndex)
    const unit = nearestUnit(entries.filter((entry) => {
      const y = unitY(entry.unit)
      return y !== null && Math.abs(centerY(blob) - y) <= 3 * interval
    }), centerX(blob), 1.25 * interval)
    const unitDistance = unit ? Math.abs(unitX(unit.unit) - centerX(blob)) : Infinity
    const systemIndex = staves[blob.staveIndex].systemIndex ?? 0
    const measureEnd = measures.filter((measure) => (measure.systemIndex ?? 0) === systemIndex)
      .map((measure) => ({ measure, right: measureBounds(measure, blob.staveIndex, staves, barLines, measures).right }))
      .map((candidate) => ({ ...candidate, distance: Math.abs(candidate.right - centerX(blob)) }))
      .filter((candidate) => candidate.distance <= 0.75 * interval)
      .sort((first, second) => first.distance - second.distance)[0]
    if (measureEnd && unitDistance > 0.35 * interval) {
      measureEnd.measure.endsWithFermata = true
      addSourceBlobs(measureEnd.measure, [ blob ])
      continue
    }
    if (!unit) {
      continue
    }
    const direction = blob.className === 'fermata-down'
      ? 'down'
      : centerY(blob) < unitY(unit.unit) ? 'up' : 'down'
    unit.unit.articulationParams = [ ...(unit.unit.articulationParams || []), { name: 'fermata', direction } ]
    addSourceBlobs(unit.unit, [ blob ])
  }
}
