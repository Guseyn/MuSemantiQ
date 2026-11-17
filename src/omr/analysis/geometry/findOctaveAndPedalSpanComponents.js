'use strict'

import { nearestStave, centerX } from './measureInkGeometry.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

export function findOctaveAndPedalSpanComponents (components, staves, blobs) {
  const spans = []
  for (const component of components) {
    const { box } = component
    const nearest = nearestStave(box, staves, 5)
    if (!nearest) {
      continue
    }
    const interval = nearest.intervalBetweenStaveLines
    if (box.w < 3 * interval || box.h > 1.5 * interval) {
      continue
    }
    const labels = blobs.filter((blob) => blob.staveIndex === nearest.staveIndex &&
      centerX(blob.box) >= box.x - 1.5 * interval && centerX(blob.box) <= box.x + 1.5 * interval)
    const octave = labels.find((blob) => roleOf(blob.className) === 'octave-sign')
    const pedal = labels.find((blob) => blob.className === 'pedal')
    if (!octave && !pedal) {
      continue
    }
    spans.push({
      className: octave ? 'octave-span' : 'pedal-bracket',
      box,
      staveIndex: nearest.staveIndex,
      systemIndex: nearest.stave.systemIndex ?? 0
    })
  }
  return spans
}

export default findOctaveAndPedalSpanComponents
