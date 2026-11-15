'use strict'

import { nearestStave, centerX, centerY } from './measureInkGeometry.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

export function findBracketComponents (components, staves, blobs) {
  const brackets = []
  for (const component of components) {
    const { box } = component
    const nearest = nearestStave(box, staves, 4)
    if (!nearest) {
      continue
    }
    const interval = nearest.intervalBetweenStaveLines
    if (box.w < 3 * interval || box.h > 4 * interval || box.h < 0.15 * interval) {
      continue
    }
    const digits = blobs.filter((blob) => roleOf(blob.className) === 'digit' && blob.staveIndex === nearest.staveIndex)
    const inside = digits.filter((blob) => centerX(blob.box) >= box.x - 0.5 * interval && centerX(blob.box) <= box.x + box.w + 0.5 * interval &&
      centerY(blob.box) >= box.y - interval && centerY(blob.box) <= box.y + box.h + interval)
    const atLeft = digits.filter((blob) => centerX(blob.box) >= box.x - interval && centerX(blob.box) <= box.x + 3 * interval &&
      centerY(blob.box) >= box.y - interval && centerY(blob.box) <= box.y + box.h + interval)
    let className = null
    if (inside.length) {
      className = 'tuplet-bracket'
    } else if (atLeft.length) {
      className = 'volta-bracket'
    }
    if (className) {
      brackets.push({
        className,
        box,
        staveIndex: nearest.staveIndex,
        systemIndex: nearest.stave.systemIndex ?? 0
      })
    }
  }
  return brackets
}

export default findBracketComponents
