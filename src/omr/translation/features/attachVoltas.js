'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, centerX, centerY, rightX } from './featureGeometry.js'

export default function attachVoltas (measures, blobs, staves, barLines, voltaBrackets) {
  for (const [ index, bracket ] of voltaBrackets.entries()) {
    if (bracket.staveIndex === null || bracket.staveIndex === undefined) {
      continue
    }
    const stave = staves[bracket.staveIndex]
    const interval = stave.intervalBetweenStaveLines
    const digits = blobs.filter((blob) => roleOf(blob.className) === 'digit' &&
      blob.staveIndex === bracket.staveIndex && /^digit-\d$/.test(blob.className) &&
      centerX(blob) >= bracket.box.x - interval && centerX(blob) <= bracket.box.x + 3 * interval &&
      centerY(blob) >= bracket.box.y - interval && centerY(blob) <= bracket.box.y + bracket.box.h + interval
    ).sort((first, second) => centerX(first) - centerX(second))
    if (!digits.length) {
      continue
    }
    const systemIndex = stave.systemIndex ?? 0
    const measuresInSystem = measures.filter((measure) => (measure.systemIndex ?? 0) === systemIndex)
    const internal = barLines.filter((barLine) => (barLine.systemIndex ?? 0) === systemIndex && barLine.kind === 'internal')
    const startIndex = internal.filter((barLine) => barLine.x < bracket.box.x).length
    const finishIndex = internal.filter((barLine) => barLine.x < rightX(bracket)).length
    const start = measuresInSystem[startIndex]
    const finish = measuresInSystem[Math.min(finishIndex, measuresInSystem.length - 1)]
    if (!start || !finish) {
      continue
    }
    const key = `volta-mark-${index + 1}`
    const sources = [ bracket, ...digits ]
    start.voltaMark = {
      key,
      value: `${digits.map((digit) => digit.className.slice(-1)).join('')}.`,
      startsHere: true,
      finishesHere: start === finish,
      ...(bracket.box.x < stave.xStart ? { startsBefore: true } : {})
    }
    addSourceBlobs(start, sources)
    if (start !== finish) {
      finish.voltaMark = {
        key,
        finishesHere: true,
        ...(rightX(bracket) > stave.xEnd ? { finishesAfter: true } : {})
      }
      addSourceBlobs(finish, sources)
    }
  }
}
