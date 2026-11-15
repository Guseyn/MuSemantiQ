'use strict'

import { addSourceBlobs } from './featureGeometry.js'

export default function mergeCrossStaveUnits (measures, staves) {
  for (const measure of measures) {
    for (const hostStave of measure.staves) {
      const interval = staves[hostStave.staveIndex].intervalBetweenStaveLines
      for (const host of hostStave.voices.flat().filter((unit) => !unit.isRest && unit.stem)) {
        for (const otherStave of measure.staves.filter((stave) => stave.staveIndex !== hostStave.staveIndex)) {
          const otherInterval = staves[otherStave.staveIndex].intervalBetweenStaveLines
          for (const voice of otherStave.voices) {
            const index = voice.findIndex((unit) => {
              if (unit.isRest || Math.abs(unit.x - host.x) > 0.5 * Math.max(interval, otherInterval)) {
                return false
              }
              const other = staves[otherStave.staveIndex]
              const reachesOtherStave = host.stem.y1 <= other.bottomY + otherInterval && host.stem.y2 >= other.topY - otherInterval
              return reachesOtherStave
            })
            if (index < 0) {
              continue
            }
            const other = voice[index]
            host.notes.forEach((note) => { note.stave = 'current' })
            other.notes.forEach((note) => {
              note.stave = otherStave.staveIndex < hostStave.staveIndex ? 'prev' : 'next'
            })
            host.notes.push(...other.notes)
            addSourceBlobs(host, other.sourceBlobs || [])
            voice.splice(index, 1)
          }
        }
      }
    }
  }
}
