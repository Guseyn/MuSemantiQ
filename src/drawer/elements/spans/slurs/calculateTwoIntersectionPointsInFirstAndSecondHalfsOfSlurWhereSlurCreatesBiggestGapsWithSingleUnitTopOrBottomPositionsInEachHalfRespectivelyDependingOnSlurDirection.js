'use strict'

export default function (slurSplinePoints, intersectionPointsOfSlurWithItsSingleUnits, extendedFromLeftSide, extendedToRightSide, slurDirection) {
  const startIntersectionIndex = extendedFromLeftSide ? 0 : 1
  const endIntersectionIndex = extendedToRightSide ? intersectionPointsOfSlurWithItsSingleUnits.length : intersectionPointsOfSlurWithItsSingleUnits.length - 1
  const slurStartX = slurSplinePoints[1]
  const slurEndX = slurSplinePoints[22]
  const slurCenterX = (slurStartX + slurEndX) / 2
  const firstIntersectionResultPoint = {
    defined: false,
    x: undefined,
    y: undefined,
    yGapWithEdgeOfSingleUnit: undefined
  }
  const secondIntersectionResultPoint = {
    defined: false,
    x: undefined,
    y: undefined,
    yGapWithEdgeOfSingleUnit: undefined
  }
  for (let intersectionIndex = startIntersectionIndex; intersectionIndex < endIntersectionIndex; intersectionIndex++) {
    const intersectionPoint = intersectionPointsOfSlurWithItsSingleUnits[intersectionIndex]
    const intersectedSingleUnit = intersectionPoint.singleUnit
    const topGap = intersectionPoint.y - intersectedSingleUnit.top
    const bottomGap = intersectedSingleUnit.bottom - intersectionPoint.y
    const currentGap = slurDirection === 'up'
      ? Math.max(topGap, 0)
      : Math.max(bottomGap, 0)
    if (intersectionPoint.x <= slurCenterX) {
      if (!firstIntersectionResultPoint.defined || (firstIntersectionResultPoint.yGapWithEdgeOfSingleUnit < currentGap)) {
        firstIntersectionResultPoint.defined = true
        firstIntersectionResultPoint.yGapWithEdgeOfSingleUnit = currentGap
        firstIntersectionResultPoint.x = intersectionPoint.x
        firstIntersectionResultPoint.y = intersectionPoint.y
      }
    } else {
      if (!secondIntersectionResultPoint.defined || (secondIntersectionResultPoint.yGapWithEdgeOfSingleUnit <= currentGap)) {
        secondIntersectionResultPoint.defined = true
        secondIntersectionResultPoint.yGapWithEdgeOfSingleUnit = currentGap
        secondIntersectionResultPoint.x = intersectionPoint.x
        secondIntersectionResultPoint.y = intersectionPoint.y
      }
    }
  }
  if (!(firstIntersectionResultPoint.defined && secondIntersectionResultPoint.defined)) {
    const epsilon = 0.01
    if (firstIntersectionResultPoint.defined) {
      secondIntersectionResultPoint.defined = true
      secondIntersectionResultPoint.yGapWithEdgeOfSingleUnit = firstIntersectionResultPoint.yGapWithEdgeOfSingleUnit
      secondIntersectionResultPoint.x = firstIntersectionResultPoint.x + epsilon
      secondIntersectionResultPoint.y = firstIntersectionResultPoint.y
    } else if (secondIntersectionResultPoint.defined) {
      firstIntersectionResultPoint.defined = true
      firstIntersectionResultPoint.yGapWithEdgeOfSingleUnit = secondIntersectionResultPoint.yGapWithEdgeOfSingleUnit
      firstIntersectionResultPoint.x = secondIntersectionResultPoint.x - epsilon
      firstIntersectionResultPoint.y = secondIntersectionResultPoint.y
    }
  }
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  if (firstIntersectionResultPoint.defined) {
    firstIntersectionResultPoint.yGapWithEdgeOfSingleUnit *= slurDirectionSign
  }
  if (secondIntersectionResultPoint.defined) {
    secondIntersectionResultPoint.yGapWithEdgeOfSingleUnit *= slurDirectionSign
  }
  return {
    bothIntersectionPointsAreDefined: (firstIntersectionResultPoint.defined && secondIntersectionResultPoint.defined),
    first: firstIntersectionResultPoint,
    second: secondIntersectionResultPoint
  }
}
