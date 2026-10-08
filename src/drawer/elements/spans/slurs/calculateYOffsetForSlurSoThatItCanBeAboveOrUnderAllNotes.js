'use strict'

export default function (intersectionPointsOfSlurWithItsSingleUnits, allSlurSingleUnits, slurDirection, styles) {
  let gap = 0
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  for (let index = 0; index < intersectionPointsOfSlurWithItsSingleUnits.length; index++) {
    const topGap = intersectionPointsOfSlurWithItsSingleUnits[index].y - allSlurSingleUnits[index].top
    const bottomGap = allSlurSingleUnits[index].bottom - intersectionPointsOfSlurWithItsSingleUnits[index].y
    const currentGap = slurDirection === 'up'
      ? Math.max(topGap, 0)
      : Math.max(bottomGap, 0)
    if (currentGap > gap) {
      gap = currentGap
    }
  }
  return slurDirectionSign * gap
}
