'use strict'

export default function (intersectionPointsOfSlurWithItsSingleUnits, allSlurSingleUnits, extendedFromLeftSide, extendedToRightSide, slurDirection, isSlurFirstPart, isSlurLastPart) {
  let gap = 0
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  const startIndex = extendedFromLeftSide
    ? 0
    : isSlurFirstPart
      ? 1
      : 0
  const endIndex = extendedToRightSide
    ? intersectionPointsOfSlurWithItsSingleUnits.length
    : isSlurLastPart
      ? intersectionPointsOfSlurWithItsSingleUnits.length - 1
      : intersectionPointsOfSlurWithItsSingleUnits.length
  for (let index = startIndex; index < endIndex; index++) {
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
