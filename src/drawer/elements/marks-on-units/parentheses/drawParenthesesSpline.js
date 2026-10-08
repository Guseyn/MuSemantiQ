'use strict'

import calculateSlurSplinePoints from '#msq/drawer/elements/shared/calculateSlurSplinePoints.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'

const calculateParenthesesJunctionPhantomPoint = (point, xSideSign, ySideSign, epsilon = 0.0001) => {
  return {
    x: point.x + xSideSign * epsilon,
    y: point.y + ySideSign * epsilon
  }
}

const calculateParenthesesRoundCoefficientByYRangeOfSlur = (yRangeOfParentheses, styles, minValue = 0.9, maxValue = 1.0) => {
  const { correlationIntervalOfYRangeForParenthesesRoundCoefficient } = styles
  const stepForParenthesesRoundCoefficient = 0.01
  return Math.max(maxValue - Math.ceil(yRangeOfParentheses / correlationIntervalOfYRangeForParenthesesRoundCoefficient) * stepForParenthesesRoundCoefficient, minValue)
}

const calculateAdditionalPathPointsForParenthesesToMakeItBulk = (calculateSlurSplinePoints, xSideSign, styles) => {
  const p0 = { x: calculateSlurSplinePoints[1], y: calculateSlurSplinePoints[2] }
  const p1 = { x: calculateSlurSplinePoints[11], y: calculateSlurSplinePoints[12] }
  const p2 = { x: calculateSlurSplinePoints[13], y: calculateSlurSplinePoints[14] }
  return [
    'C',
    p2.x + xSideSign * styles.parenthesesBulkCoefficient, p2.y,
    p1.x + xSideSign * styles.parenthesesBulkCoefficient, p1.y,
    p0.x, p0.y
  ]
}

export default function (topPoint, bottomPoint, side, styles) {
  const { parenthesesStrokeOptions } = styles
  const yLengthOfBracket = bottomPoint.y - topPoint.y
  const xSideSign = side === 'left' ? -1 : +1
  const topPhantomPoint = calculateParenthesesJunctionPhantomPoint(topPoint, xSideSign, +1)
  const bottomPhantomPoint = calculateParenthesesJunctionPhantomPoint(bottomPoint, xSideSign, -1)
  const roundCoefficient = calculateParenthesesRoundCoefficientByYRangeOfSlur(yLengthOfBracket, styles)
  const parenthesesSplinePoints = calculateSlurSplinePoints(
    topPoint,
    topPhantomPoint,
    bottomPhantomPoint,
    bottomPoint,
    roundCoefficient
  )
  const additionalPathPointsForParenthesesToMakeItBulk = calculateAdditionalPathPointsForParenthesesToMakeItBulk(
    parenthesesSplinePoints,
    xSideSign,
    styles
  )
  return createPath(
    [
      ...parenthesesSplinePoints,
      ...additionalPathPointsForParenthesesToMakeItBulk
    ],
    parenthesesStrokeOptions,
    true,
    0
  )
}
