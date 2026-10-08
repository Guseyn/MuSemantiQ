'use strict'

import calculateTimeInSlurSplinePointsBySomeXPointThere from '#msq/drawer/elements/shared/calculateTimeInSlurSplinePointsBySomeXPointThere.js'

const calculateYDeltasToAddToFirstAndSecondCentralControlPointsInSlurSoItCannotIntersectItsSingleUnits = (slurSplinePoints, slurDirection, twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection, styles) => {
  const slurStartX = slurSplinePoints[1]
  const slurEndX = slurSplinePoints[22]
  const p0 = { x: slurSplinePoints[8], y: slurSplinePoints[9] }
  const p1 = { x: slurSplinePoints[11], y: slurSplinePoints[12] }
  const p2 = { x: slurSplinePoints[13], y: slurSplinePoints[14] }
  const p3 = { x: slurSplinePoints[15], y: slurSplinePoints[16] }
  const firstIntersectionPointTime = calculateTimeInSlurSplinePointsBySomeXPointThere(
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.x,
    slurStartX,
    slurEndX
  )
  const secondIntersectionPointTime = calculateTimeInSlurSplinePointsBySomeXPointThere(
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.x,
    slurStartX,
    slurEndX
  )

  let firstYDelta
  let secondYDelta
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  const yEdgeOfFirstHalfOfSlurThatItCanReach = twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.y +
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.yGapWithEdgeOfSingleUnit +
    styles.minSpaceBetweenSingleUnitExtremePointAndSlur * slurDirectionSign
  const yEdgeOfSecondHalfOfSlurThatItCanReach = twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.y +
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.yGapWithEdgeOfSingleUnit +
    styles.minSpaceBetweenSingleUnitExtremePointAndSlur * slurDirectionSign

  let t1 = firstIntersectionPointTime
  let t2 = secondIntersectionPointTime
  const limitOfTimeFromLeftSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints = 0.2
  const limitOfTimeFromRightSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints = 0.8
  if (t1 < limitOfTimeFromLeftSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints) {
    t1 = limitOfTimeFromLeftSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints
  }
  if (t2 > limitOfTimeFromRightSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints) {
    t2 = limitOfTimeFromRightSideInOrderToAvoidBigSlurStretchingBecauseOfPhantomPoints
  }

  const m11 = Math.pow(1 - t1, 3) * p0.y
  const m12 = 3 * Math.pow(1 - t1, 2) * t1
  const m13 = 3 * (1 - t1) * Math.pow(t1, 2)
  const m14 = Math.pow(t1, 3) * p3.y

  const m21 = Math.pow(1 - t2, 3) * p0.y
  const m22 = 3 * Math.pow(1 - t2, 2) * t2
  const m23 = 3 * (1 - t2) * Math.pow(t2, 2)
  const m24 = Math.pow(t2, 3) * p3.y

  // System of two linear equations with unknow firstYDelta and secondYDelta
  // based on: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y
  // (m1 + m2 * p1.y + m3 * p2.y + m4)
  // 1) m11 + m12 * (p1.y + firstYDelta) + m13 * (p2.y + secondYDelta) + m14 = yEdgeOfFirstHalfOfSlurThatItCanReach
  // 2) m21 + m22 * (p1.y + firstYDelta) + m23 * (p2.y + secondYDelta) + m24 = yEdgeOfSecondHalfOfSlurThatItCanReach

  if (
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.yGapWithEdgeOfSingleUnit === 0 &&
    twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.yGapWithEdgeOfSingleUnit === 0
  ) {
    firstYDelta = styles.minSpaceBetweenSingleUnitExtremePointAndSlur * slurDirectionSign
    secondYDelta = styles.minSpaceBetweenSingleUnitExtremePointAndSlur * slurDirectionSign
  } else {
    if (twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.yGapWithEdgeOfSingleUnit === 0) {
      secondYDelta = 0
      firstYDelta = (yEdgeOfFirstHalfOfSlurThatItCanReach - m11 - m13 * p2.y - m14) / m12 - p1.y
    } else {
      secondYDelta = (yEdgeOfSecondHalfOfSlurThatItCanReach - (m21 + m22 * p1.y + m22 * yEdgeOfFirstHalfOfSlurThatItCanReach / m12 - m22 * m11 / m12 - m22 * m13 * p2.y / m12 - m22 * m14 / m12 - m22 * p1.y + m23 * p2.y + m24)) / (-m22 * m13 / m12 + m23)
    }
    if (twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.yGapWithEdgeOfSingleUnit === 0) {
      firstYDelta = 0
      secondYDelta = (yEdgeOfSecondHalfOfSlurThatItCanReach - m21 - m22 * p1.y - m24) / m23 - p2.y
    } else {
      firstYDelta = (yEdgeOfFirstHalfOfSlurThatItCanReach - m11 - m13 * (p2.y + secondYDelta) - m14) / m12 - p1.y
    }
  }
  // Let's check if found deltas are correct
  // console.log(m11 + m12 * (p1.y + firstYDelta) + m13 * (p2.y + secondYDelta) + m14, yEdgeOfFirstHalfOfSlurThatItCanReach)
  // console.log(m21 + m22 * (p1.y + firstYDelta) + m23 * (p2.y + secondYDelta) + m24, yEdgeOfSecondHalfOfSlurThatItCanReach)

  // We don't want to add deltas in opposite direction with slur direction,
  // because otherwise it would create curves on slur edges,
  // which controlled by phantom points that affected by slur direction
  if (slurDirection === 'up') {
    if (firstYDelta > 0) {
      firstYDelta = 0
      secondYDelta = (yEdgeOfSecondHalfOfSlurThatItCanReach - m21 - m22 * p1.y - m24) / m23 - p2.y
    }
    if (secondYDelta > 0) {
      secondYDelta = 0
      firstYDelta = (yEdgeOfFirstHalfOfSlurThatItCanReach - m11 - m13 * p2.y - m14) / m12 - p1.y
    }
    if (firstYDelta > 0 || secondYDelta > 0) {
      firstYDelta = 0
      secondYDelta = 0
    }
  } else {
    if (firstYDelta < 0) {
      firstYDelta = 0
      secondYDelta = (yEdgeOfSecondHalfOfSlurThatItCanReach - m21 - m22 * p1.y - m24) / m23 - p2.y
    }
    if (secondYDelta < 0) {
      secondYDelta = 0
      firstYDelta = (yEdgeOfFirstHalfOfSlurThatItCanReach - m11 - m13 * p2.y - m14) / m12 - p1.y
    }
    if (firstYDelta < 0 || secondYDelta < 0) {
      firstYDelta = 0
      secondYDelta = 0
    }
  }

  return {
    firstYDelta: firstYDelta || 0,
    secondYDelta: secondYDelta || 0
  }
}

export default function (slurSplinePoints, twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection, slurDirection, styles) {
  const slurSplinePointsCopy = slurSplinePoints.slice()
  if (twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.bothIntersectionPointsAreDefined) {
    const yDeltas = calculateYDeltasToAddToFirstAndSecondCentralControlPointsInSlurSoItCannotIntersectItsSingleUnits(slurSplinePointsCopy, slurDirection, twoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection, styles)
    slurSplinePointsCopy[12] += yDeltas.firstYDelta
    slurSplinePointsCopy[14] += yDeltas.secondYDelta
  }
  return slurSplinePointsCopy
}
