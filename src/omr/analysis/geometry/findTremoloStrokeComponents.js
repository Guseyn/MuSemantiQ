'use strict'

import { nearestStave, fitStraightInk } from './measureInkGeometry.js'

export function findTremoloStrokeComponents (bitmap, components, staves, stems) {
  const strokes = []
  for (const component of components) {
    const { box } = component
    const nearest = nearestStave(box, staves, 4)
    if (!nearest) {
      continue
    }
    const interval = nearest.intervalBetweenStaveLines
    if (box.w < 0.5 * interval || box.h < 0.5 * interval || box.w > 3 * interval || box.h > 3 * interval) {
      continue
    }
    const fit = fitStraightInk(bitmap, box)
    if (!fit || fit.columnCoverage < 0.5 || Math.abs(fit.slope) < 0.3 || Math.abs(fit.slope) > 3 ||
      fit.perpendicularResidual > Math.max(1, 0.4 * nearest.staveLineThickness)) {
      continue
    }
    const stem = stems.find((candidate) => candidate.staveIndex === nearest.staveIndex &&
      candidate.x >= box.x - interval && candidate.x <= box.x + box.w + interval &&
      candidate.y1 <= box.y + box.h + interval && candidate.y2 >= box.y - interval)
    if (!stem) {
      continue
    }
    strokes.push({
      className: 'tremolo-stroke',
      box,
      staveIndex: nearest.staveIndex,
      systemIndex: nearest.stave.systemIndex ?? 0,
      stem
    })
  }
  return strokes
}

export default findTremoloStrokeComponents
