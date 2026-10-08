'use strict'

import calculateSlurSplinePoints from '#msq/drawer/elements/shared/calculateSlurSplinePoints.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import calculateSlurRoundCoefficientByXRangeOfSlur from '#msq/drawer/elements/shared/calculateSlurRoundCoefficientByXRangeOfSlur.js'
import calculateTimeInSlurSplinePointsBySomeXPointThere from '#msq/drawer/elements/shared/calculateTimeInSlurSplinePointsBySomeXPointThere.js'

const calculateTieJunctionPhantomPoint = (point, sideSign, tieDirectionSign, epsilon = 0.0001) => {
  return {
    x: point.x + sideSign * epsilon,
    y: point.y + tieDirectionSign * epsilon
  }
}

const calculateAdditionalPathPointsForTieToMakeItBulk = (tieSplinePoints, tieDirection, isGrace, styles) => {
  const p0 = { x: tieSplinePoints[1], y: tieSplinePoints[2] }
  const p1 = { x: tieSplinePoints[11], y: tieSplinePoints[12] }
  const p2 = { x: tieSplinePoints[13], y: tieSplinePoints[14] }
  const tieDirectionSign = tieDirection === 'up' ? -1 : +1
  return [
    'C',
    p2.x, p2.y + tieDirectionSign * styles.slurBulkCoefficient * (isGrace ? styles.graceElementsScaleFactor : 1),
    p1.x, p1.y + tieDirectionSign * styles.slurBulkCoefficient * (isGrace ? styles.graceElementsScaleFactor : 1),
    p0.x, p0.y
  ]
}

const calculateExtremePointOfTie = (tieSplinePoints) => {
  const middleConstant = 0.5
  const tieStartX = tieSplinePoints[1]
  const tieEndX = tieSplinePoints[22]
  const p0 = { x: tieSplinePoints[1], y: tieSplinePoints[2] }
  const p1 = { x: tieSplinePoints[11], y: tieSplinePoints[12] }
  const p2 = { x: tieSplinePoints[13], y: tieSplinePoints[14] }
  const p3 = { x: tieSplinePoints[15], y: tieSplinePoints[16] }
  const sx = (tieStartX + tieEndX) * middleConstant
  const t = calculateTimeInSlurSplinePointsBySomeXPointThere(sx, tieStartX, tieEndX)
  return {
    x: sx,
    y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y
  }
}

export default function (startX, startY, endX, endY, tieDirection, leftSingleUnit, rightSingleUnit, roundCoefficientFactor, styles) {
  const { tieStrokeOptions } = styles
  const tieDirectionSign = tieDirection === 'up' ? -1 : 1
  const xLengthOfTie = endX - startX
  const tieLeftPoint = { x: startX, y: startY }
  const tieRightPoint = { x: endX, y: endY }
  const tieLeftPhantomPoint = calculateTieJunctionPhantomPoint(tieLeftPoint, +1, tieDirectionSign)
  const tieRightPhantomPoint = calculateTieJunctionPhantomPoint(tieRightPoint, -1, tieDirectionSign)

  const calculatedTieSplinePoints = calculateSlurSplinePoints(
    tieLeftPoint,
    tieLeftPhantomPoint,
    tieRightPhantomPoint,
    tieRightPoint,
    calculateSlurRoundCoefficientByXRangeOfSlur(xLengthOfTie, roundCoefficientFactor, styles)
  )
  const additionalPathPointsForTieToMakeItBulk = calculateAdditionalPathPointsForTieToMakeItBulk(
    calculatedTieSplinePoints,
    tieDirectionSign,
    ((leftSingleUnit && leftSingleUnit.isGrace) || (rightSingleUnit && rightSingleUnit.isGrace)),
    styles
  )
  const extremePointOfTie = calculateExtremePointOfTie(calculatedTieSplinePoints)
  if (leftSingleUnit) {
    leftSingleUnit.top = Math.min(leftSingleUnit.top, extremePointOfTie.y)
    leftSingleUnit.bottom = Math.max(leftSingleUnit.bottom, extremePointOfTie.y)
  }
  if (rightSingleUnit) {
    rightSingleUnit.top = Math.min(rightSingleUnit.top, extremePointOfTie.y)
    rightSingleUnit.bottom = Math.max(rightSingleUnit.bottom, extremePointOfTie.y)
  }
  return createPath(
    [
      ...calculatedTieSplinePoints,
      ...additionalPathPointsForTieToMakeItBulk
    ],
    tieStrokeOptions,
    true,
    0
  )
}
