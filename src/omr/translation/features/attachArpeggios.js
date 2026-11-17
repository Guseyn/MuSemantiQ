'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, bottomY, centerY, rightX, unitEntries } from './featureGeometry.js'

const ARROWS = {
  'arpeggio-arrow-up': 'up',
  'arpeggio-arrow-down': 'down'
}

// An arpeggio is a vertical line immediately to the left of a chord and
// covering its noteheads. A single note or a remote mark is not enough.
export default function attachArpeggios (measures, blobs, staves) {
  for (const blob of blobs.filter((item) => roleOf(item.className) === 'arpeggio')) {
    if (blob.staveIndex === null || blob.staveIndex === undefined) {
      continue
    }
    const interval = staves[blob.staveIndex].intervalBetweenStaveLines
    const candidates = unitEntries(measures, blob.staveIndex, { notesOnly: true })
      .filter((entry) => entry.unit.notes.length > 1 && !entry.unit.arpeggiated)
      .map((entry) => ({ entry, heads: headsOf(entry.unit) }))
      .filter(({ heads }) => heads.length > 1)
      .map((candidate) => ({
        ...candidate,
        distance: Math.min(...candidate.heads.map((head) => head.box.x)) - rightX(blob)
      }))
      .filter((candidate) => candidate.distance >= -0.25 * interval && candidate.distance <= 1.5 * interval)
      .filter(({ heads }) => blob.box.y <= Math.max(...heads.map(centerY)) + interval &&
        bottomY(blob) >= Math.min(...heads.map(centerY)) - interval)
      .sort((first, second) => first.distance - second.distance)
    const unit = candidates[0]?.entry.unit
    if (!unit) {
      continue
    }
    unit.arpeggiated = ARROWS[blob.className] ? { arrow: ARROWS[blob.className] } : true
    addSourceBlobs(unit, [ blob ])
  }
}

function headsOf (unit) {
  return (unit.sourceBlobs || []).filter((blob) => roleOf(blob.className) === 'head')
}
