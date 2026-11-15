'use strict'

import { addSourceBlobs, rightX, spanEndpoints, unitEntries } from './featureGeometry.js'

export default function attachGlissandi (measures, staves, glissandoLines) {
  for (const [ index, line ] of glissandoLines.entries()) {
    if (line.staveIndex === null || line.staveIndex === undefined) {
      continue
    }
    const interval = staves[line.staveIndex].intervalBetweenStaveLines
    const endpoints = spanEndpoints(unitEntries(measures, line.staveIndex, { notesOnly: true }), line.box.x, rightX(line), 2.5 * interval)
    if (!endpoints || endpoints.left === endpoints.right) {
      continue
    }
    const leftPosition = endpoints.left.unit.notes[0]?.positionNumber
    const rightPosition = endpoints.right.unit.notes[0]?.positionNumber
    const direction = line.direction || (leftPosition !== undefined && rightPosition !== undefined
      ? rightPosition < leftPosition ? 'up' : 'down'
      : null)
    if (!direction) {
      continue
    }
    const key = `glissando-${index + 1}`
    const form = line.className === 'glissando-wave' ? 'wave' : 'line'
    endpoints.left.unit.glissandoMarks = [ ...(endpoints.left.unit.glissandoMarks || []), { key, form, direction } ]
    endpoints.right.unit.glissandoMarks = [ ...(endpoints.right.unit.glissandoMarks || []), { key, finish: true } ]
    addSourceBlobs(endpoints.left.unit, [ line ])
    addSourceBlobs(endpoints.right.unit, [ line ])
  }
}
