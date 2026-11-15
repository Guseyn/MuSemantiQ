'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, bottomY, centerX, centerY, rightX, spanEndpoints, unitEntries } from './featureGeometry.js'

// Digits alone do not prove a tuplet, and a bracket alone does not supply its
// ratio. Both must share one measured bracket before any units are stamped.
export default function attachTuplets (measures, blobs, staves, tupletBrackets) {
  for (const [ index, bracket ] of tupletBrackets.entries()) {
    if (bracket.staveIndex === null || bracket.staveIndex === undefined) {
      continue
    }
    const interval = staves[bracket.staveIndex].intervalBetweenStaveLines
    const digits = blobs.filter((blob) => roleOf(blob.className) === 'digit' &&
      blob.staveIndex === bracket.staveIndex &&
      centerX(blob) >= bracket.box.x - 0.5 * interval && centerX(blob) <= rightX(bracket) + 0.5 * interval &&
      centerY(blob) >= bracket.box.y - interval && centerY(blob) <= bottomY(bracket) + interval &&
      /^digit-\d$/.test(blob.className))
      .sort((first, second) => centerX(first) - centerX(second))
    if (!digits.length) {
      continue
    }
    const entries = unitEntries(measures, bracket.staveIndex)
    const endpoints = spanEndpoints(entries, bracket.box.x, rightX(bracket), 2.5 * interval)
    if (!endpoints || endpoints.spanned.some((entry) => entry.unit.tupletMarks?.some((mark) => !mark.finish))) {
      continue
    }
    const key = `tuplet-${index + 1}`
    const value = digits.map((digit) => digit.className.slice(-1)).join('')
    for (const entry of endpoints.spanned) {
      const isStart = entry === endpoints.left
      const isFinish = entry === endpoints.right
      entry.unit.tupletMarks = [ ...(entry.unit.tupletMarks || []), {
        key,
        ...(isStart ? { value, withBrackets: true } : {}),
        ...(isFinish ? { finish: true } : {})
      } ]
      addSourceBlobs(entry.unit, [ bracket, ...digits ])
    }
  }
}
