'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, centerX, centerY, nearestUnit, rightX, spanEndpoints, unitEntries, unitX, unitY } from './featureGeometry.js'

const OCTAVES = {
  'octave-sign-eight-up': { octaveNumber: '8', octavePostfix: 'va', direction: 'up' },
  'octave-sign-eight-down': { octaveNumber: '8', octavePostfix: 'va', direction: 'down' },
  'octave-sign-fifteen-up': { octaveNumber: '15', octavePostfix: 'ma', direction: 'up' },
  'octave-sign-fifteen-down': { octaveNumber: '15', octavePostfix: 'ma', direction: 'down' }
}

// The label supplies the transposition. A measured dashed line, when present,
// supplies both endpoints; without one the label attaches only to its own unit.
export default function attachOctaveSpans (measures, blobs, staves, octaveSpans) {
  const labels = blobs.filter((blob) => roleOf(blob.className) === 'octave-sign' && OCTAVES[blob.className])
  for (const [ index, label ] of labels.entries()) {
    if (label.staveIndex === null || label.staveIndex === undefined) {
      continue
    }
    const interval = staves[label.staveIndex].intervalBetweenStaveLines
    const entries = unitEntries(measures, label.staveIndex, { notesOnly: true })
    const span = octaveSpans.filter((line) => line.staveIndex === label.staveIndex &&
      Math.abs(line.box.x - centerX(label)) <= 1.5 * interval)
      .sort((first, second) => Math.abs(first.box.x - centerX(label)) - Math.abs(second.box.x - centerX(label)))[0]
    const endpoints = span
      ? spanEndpoints(entries, span.box.x, rightX(span), 2 * interval)
      : singleUnitEndpoint(entries, label, interval)
    if (!endpoints || endpoints.spanned.some((entry) => entry.unit.octaveSignMark)) {
      continue
    }
    const key = `octave-sign-${index + 1}`
    const sources = [ label, ...(span ? [ span ] : []) ]
    for (const entry of endpoints.spanned) {
      const isStart = entry === endpoints.left
      const isFinish = entry === endpoints.right
      entry.unit.octaveSignMark = {
        key,
        ...(isStart ? OCTAVES[label.className] : {}),
        ...(isFinish ? { finish: true } : {})
      }
      addSourceBlobs(entry.unit, sources)
    }
  }
}

function singleUnitEndpoint (entries, label, interval) {
  const nearby = entries.filter((entry) => unitX(entry.unit) >= centerX(label) - 0.75 * interval &&
    unitY(entry.unit) !== null && Math.abs(unitY(entry.unit) - centerY(label)) <= 4.5 * interval)
  const unit = nearestUnit(nearby, centerX(label), 1.5 * interval)
  return unit ? { left: unit, right: unit, spanned: [ unit ] } : null
}
