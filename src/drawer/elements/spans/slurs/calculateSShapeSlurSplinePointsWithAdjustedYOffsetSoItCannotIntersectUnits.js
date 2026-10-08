'use strict'

import stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching from '#msq/drawer/elements/spans/slurs/stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching.js'
import calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection from '#msq/drawer/elements/spans/slurs/calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.js'

export default function (slurSplinePoints, intersectionPointsOfSlurWithItsSingleUnits, yOffset, isSlurFirstPart, isSlurLastPart, slurDirection, extendedFromLeftSide, extendedToRightSide, leftYCorrection, rightYCorrection, styles) {
  const slurSplinePointsCopy = slurSplinePoints.slice()
  if (!isSlurFirstPart) {
    slurSplinePointsCopy[2] += yOffset
    slurSplinePointsCopy[5] += yOffset
    slurSplinePointsCopy[7] += yOffset
    slurSplinePointsCopy[9] += yOffset
    if (!isSlurLastPart) {
      slurSplinePointsCopy[12] += yOffset
    }
  }
  if (!isSlurLastPart) {
    if (!isSlurFirstPart) {
      slurSplinePointsCopy[14] += yOffset
    }
    slurSplinePointsCopy[16] += yOffset
    slurSplinePointsCopy[19] += yOffset
    slurSplinePointsCopy[21] += yOffset
    slurSplinePointsCopy[23] += yOffset
  }
  if (isSlurFirstPart || isSlurLastPart) {
    const calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection = calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection(
      slurSplinePointsCopy,
      intersectionPointsOfSlurWithItsSingleUnits,
      extendedFromLeftSide,
      extendedToRightSide,
      slurDirection
    )
    const slurSpline = stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching(slurSplinePointsCopy, calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection, slurDirection, styles)
    slurSplinePointsCopy[12] = slurSpline[12]
    slurSplinePointsCopy[14] = slurSpline[14]
  }
  leftYCorrection = (leftYCorrection || 0) * styles.intervalBetweenStaveLines
  rightYCorrection = (rightYCorrection || 0) * styles.intervalBetweenStaveLines
  if (isSlurFirstPart) {
    slurSplinePointsCopy[2] += leftYCorrection
    slurSplinePointsCopy[5] += leftYCorrection
    slurSplinePointsCopy[7] += leftYCorrection
    slurSplinePointsCopy[9] += leftYCorrection
    slurSplinePointsCopy[12] += leftYCorrection
  }
  if (isSlurLastPart) {
    slurSplinePointsCopy[14] += rightYCorrection
    slurSplinePointsCopy[16] += rightYCorrection
    slurSplinePointsCopy[19] += rightYCorrection
    slurSplinePointsCopy[21] += rightYCorrection
    slurSplinePointsCopy[23] += rightYCorrection
  }
  return slurSplinePointsCopy
}
