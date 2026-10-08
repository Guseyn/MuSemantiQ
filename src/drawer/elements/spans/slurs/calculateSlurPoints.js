'use strict'

import calculateSlurSplinePoints from '#msq/drawer/elements/shared/calculateSlurSplinePoints.js'
import calculateSlurJunctionPhantomPoint from '#msq/drawer/elements/spans/slurs/calculateSlurJunctionPhantomPoint.js'
import calculateSlurRoundCoefficientByXRangeOfSlur from '#msq/drawer/elements/shared/calculateSlurRoundCoefficientByXRangeOfSlur.js'
import calculateIntersectionPointsOfSlurWithItsSingleUnits from '#msq/drawer/elements/spans/slurs/calculateIntersectionPointsOfSlurWithItsSingleUnits.js'
import calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection from '#msq/drawer/elements/spans/slurs/calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.js'
import stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching from '#msq/drawer/elements/spans/slurs/stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching.js'
import calculateAdditionalPathPointsForSlurToMakeItBulk from '#msq/drawer/elements/spans/slurs/calculateAdditionalPathPointsForSlurToMakeItBulk.js'
import calculateYOffsetForSlurSoThatItCanBeAboveOrUnderAllNotes from '#msq/drawer/elements/spans/slurs/calculateYOffsetForSlurSoThatItCanBeAboveOrUnderAllNotes.js'
import calculateSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits from '#msq/drawer/elements/spans/slurs/calculateSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits.js'

// const circle = require('./../basic/circle')

export default function (markedSlur, slurLeftPoint, slurRightPoint, slurDirection, voicesBody, extendedFromLeftSide, extendedToRightSide, styles) {
  const { intervalBetweenStaveLines, leftMarginForConnectionsThatStartBefore } = styles

  const slurDirectionSign = slurDirection === 'up' ? -1 : +1

  if (extendedFromLeftSide) {
    slurLeftPoint.x = markedSlur.voicesBodyThatSlurStartsBefore.left + leftMarginForConnectionsThatStartBefore
    slurLeftPoint.y += slurDirectionSign * styles.slurYOffsetForItsSidesWhenItBreakingForNextLine
  }
  slurLeftPoint.y += (markedSlur.leftYCorrection || 0) * intervalBetweenStaveLines
  if (extendedToRightSide) {
    slurRightPoint.x = voicesBody.right
    slurRightPoint.y += slurDirectionSign * styles.slurYOffsetForItsSidesWhenItBreakingForNextLine
  }
  slurRightPoint.y += (markedSlur.rightYCorrection || 0) * intervalBetweenStaveLines
  const slurRoundCoefficient = calculateSlurRoundCoefficientByXRangeOfSlur(slurRightPoint.x - slurLeftPoint.x, markedSlur.roundCoefficientFactor, styles)
  const slurLeftPhantomPoint = calculateSlurJunctionPhantomPoint(slurLeftPoint, 'left', slurDirection, styles)
  const slurRightPhantomPoint = calculateSlurJunctionPhantomPoint(slurRightPoint, 'right', slurDirection, styles)
  const calculatedSlurSplinePoints = calculateSlurSplinePoints(
    slurLeftPoint,
    slurLeftPhantomPoint,
    slurRightPhantomPoint,
    slurRightPoint,
    slurRoundCoefficient
  )

  const calculatedIntersectionPointsOfSlurWithItsSingleUnits = calculateIntersectionPointsOfSlurWithItsSingleUnits(
    markedSlur.allSingleUnitsOnTheWay,
    calculatedSlurSplinePoints,
    slurDirection,
    styles
  )

  /* const circles = []
  for (let index = 0; index < calculatedIntersectionPointsOfSlurWithItsSingleUnits.length; index++) {
    circles.push(
      circle(3, 'red', calculatedIntersectionPointsOfSlurWithItsSingleUnits[index].x, calculatedIntersectionPointsOfSlurWithItsSingleUnits[index].y),
      circle(3, 'blue', calculatedIntersectionPointsOfSlurWithItsSingleUnits[index].singleUnit.left, calculatedIntersectionPointsOfSlurWithItsSingleUnits[index].singleUnit.top),
    )
  }
  voicesBody.elements.push(
    ...circles
  ) */

  const calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection = calculateTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection(
    calculatedSlurSplinePoints,
    calculatedIntersectionPointsOfSlurWithItsSingleUnits,
    extendedFromLeftSide,
    extendedToRightSide,
    slurDirection
  )

  /* voicesBody.elements.push(
    circle(3, 'orange', calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.x, calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.first.y),
    circle(3, 'orange', calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.x, calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection.second.y),
  ) */

  const strechedSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching = stretchSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching(
    calculatedSlurSplinePoints,
    calculatedTwoIntersectionPointsInFirstAndSecondHalfsOfSlurWhereSlurCreatesBiggestGapsWithSingleUnitTopOrBottomPositionsInEachHalfRespectivelyDependingOnSlurDirection,
    slurDirection,
    styles
  )

  const intersectionPointsOfStretchedSlurWithItsSingleUnits = calculateIntersectionPointsOfSlurWithItsSingleUnits(
    markedSlur.allSingleUnitsOnTheWay,
    strechedSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching,
    slurDirection,
    styles
  )

  const weGotRightPlacementOrLeftAndRightPointYCorrectionsForSlurWhichMeansThatWeShouldNotAdjustYOffsetOfSlurSinceUserWantsCertainPositionOfRightPointOfSlur = markedSlur.rightPlacement || (markedSlur.leftYCorrection !== undefined) || (markedSlur.rightYCorrection !== undefined)

  const yOffsetForStretchedSlurSoThatItCanBeAboveOrUnderAllNotes = weGotRightPlacementOrLeftAndRightPointYCorrectionsForSlurWhichMeansThatWeShouldNotAdjustYOffsetOfSlurSinceUserWantsCertainPositionOfRightPointOfSlur
    ? 0
    : calculateYOffsetForSlurSoThatItCanBeAboveOrUnderAllNotes(
      intersectionPointsOfStretchedSlurWithItsSingleUnits,
      markedSlur.allSingleUnitsOnTheWay,
      slurDirection,
      styles
    )

  const strechedSlurSplineWithYOffsetSoItCannotIntersectItsSingleUnits = weGotRightPlacementOrLeftAndRightPointYCorrectionsForSlurWhichMeansThatWeShouldNotAdjustYOffsetOfSlurSinceUserWantsCertainPositionOfRightPointOfSlur
    ? strechedSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching
    : calculateSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits(
      strechedSlurSplineSoItCannotIntersectItsSingleUnitsExceptMaybeSomeUnitAtTheStartAndAtTheEndToAvoidBigStretching,
      yOffsetForStretchedSlurSoThatItCanBeAboveOrUnderAllNotes
    )

  const additionalPathPointsForSlurToMakeItBulk = calculateAdditionalPathPointsForSlurToMakeItBulk(
    strechedSlurSplineWithYOffsetSoItCannotIntersectItsSingleUnits,
    slurDirection,
    markedSlur.isGrace,
    styles
  )

  for (let slurUnitIndex = 0; slurUnitIndex < markedSlur.allSingleUnitsOnTheWay.length; slurUnitIndex++) {
    if (slurDirection === 'up') {
      markedSlur.allSingleUnitsOnTheWay[slurUnitIndex].top = Math.min(
        markedSlur.allSingleUnitsOnTheWay[slurUnitIndex].top,
        intersectionPointsOfStretchedSlurWithItsSingleUnits[slurUnitIndex].y - yOffsetForStretchedSlurSoThatItCanBeAboveOrUnderAllNotes - styles.distanceBetweenSlurLayers
      )
    } else if (slurDirection === 'down') {
      markedSlur.allSingleUnitsOnTheWay[slurUnitIndex].bottom = Math.max(
        markedSlur.allSingleUnitsOnTheWay[slurUnitIndex].bottom,
        intersectionPointsOfStretchedSlurWithItsSingleUnits[slurUnitIndex].y + yOffsetForStretchedSlurSoThatItCanBeAboveOrUnderAllNotes + styles.distanceBetweenSlurLayers
      )
    }
  }

  return [
    ...strechedSlurSplineWithYOffsetSoItCannotIntersectItsSingleUnits,
    ...additionalPathPointsForSlurToMakeItBulk
  ]
}
