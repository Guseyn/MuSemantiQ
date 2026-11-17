'use strict'

import { nearestStave, fitStraightInk, interpolatedCenterLine } from './measureInkGeometry.js'

export function findGlissandoComponents (bitmap, components, staves) {
  const lines = []
  for (const component of components) {
    const { box } = component
    const nearest = nearestStave(box, staves, 4)
    if (!nearest) {
      continue
    }
    const interval = nearest.intervalBetweenStaveLines
    if (box.w < 1.5 * interval || box.h < 0.75 * interval || box.w > 12 * interval || box.h > 8 * interval) {
      continue
    }
    const fit = fitStraightInk(bitmap, box)
    if (!fit || fit.columnCoverage < 0.55 || Math.abs(fit.slope) < 0.2 || Math.abs(fit.slope) > 4) {
      continue
    }
    const centers = interpolatedCenterLine(bitmap, box)
    const wave = centers.length > 4 && directionChanges(centers) >= 2
    if (!wave && fit.perpendicularResidual > Math.max(1, 0.35 * nearest.staveLineThickness)) {
      continue
    }
    lines.push({
      className: wave ? 'glissando-wave' : 'glissando-line',
      direction: fit.slope < 0 ? 'up' : 'down',
      box,
      staveIndex: nearest.staveIndex,
      systemIndex: nearest.stave.systemIndex ?? 0
    })
  }
  return lines
}

function directionChanges (centers) {
  const signs = []
  for (let index = 2; index < centers.length; index++) {
    const curvature = centers[index] - 2 * centers[index - 1] + centers[index - 2]
    if (Math.abs(curvature) > 0.25) {
      signs.push(Math.sign(curvature))
    }
  }
  return signs.slice(1).filter((sign, index) => sign !== signs[index]).length
}

export default findGlissandoComponents
