'use strict'

import calculateNextSlurDirectionBySingleUnit from '#msq/drawer/elements/spans/slurs/calculateNextSlurDirectionBySingleUnit.js'
import calculateSlurJunctionPointForSingleUnit from '#msq/drawer/elements/spans/slurs/calculateSlurJunctionPointForSingleUnit.js'
import calculateSlurJunctionPhantomPoint from '#msq/drawer/elements/spans/slurs/calculateSlurJunctionPhantomPoint.js'
import calculateSlurSplinePoints from '#msq/drawer/elements/shared/calculateSlurSplinePoints.js'
import calculateIntersectionPointsForOnOnePartOfSShapeSlurWithItsSingleUnits from '#msq/drawer/elements/spans/slurs/calculateIntersectionPointsForOnOnePartOfSShapeSlurWithItsSingleUnits.js'
import calculateYOffsetForSShapeSlurSoThatItCanBeAboveOrUnderAllNotes from '#msq/drawer/elements/spans/slurs/calculateYOffsetForSShapeSlurSoThatItCanBeAboveOrUnderAllNotes.js'
import calculateSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits from '#msq/drawer/elements/spans/slurs/calculateSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits.js'
import glueSlurParts from '#msq/drawer/elements/spans/slurs/glueSlurParts.js'
import calculateSlurRoundCoefficientByXRangeOfSShapeSlur from '#msq/drawer/elements/spans/slurs/calculateSlurRoundCoefficientByXRangeOfSShapeSlur.js'

export default function (markedSlur, slurLeftPoint, slurRightPoint, slurDirection, voicesBody, extendedFromLeftSide, extendedToRightSide, styles) {
  const { leftMarginForConnectionsThatStartBefore, sShapeSlurYOffsetForItsSidesWhenItBreakingForNextLine, sShapeSlurPartMiddleJunctionPointXOffset, sShapeSlurPartMiddleJunctionPointYOffset } = styles
  const allSlurSingleUnitsOfSlur = markedSlur.allSingleUnitsOnTheWay
  const slurMarkKey = markedSlur.slurMarkKey
  const slurParts = []
  const slurPartsDirections = []
  const allSlurSingleUnitsDevidedInParts = [[]]
  let currentPartIndexForAllSlurSingleUnitsOfSlurDevidedInParts = 0
  for (let singleUnitIndex = 0; singleUnitIndex < allSlurSingleUnitsOfSlur.length; singleUnitIndex++) {
    const currentSingleUnit = allSlurSingleUnitsOfSlur[singleUnitIndex]
    if (
      (singleUnitIndex !== 0) &&
      (singleUnitIndex !== (allSlurSingleUnitsOfSlur.length - 1)) &&
      currentSingleUnit.slurMarks &&
      currentSingleUnit.slurMarks.some(slurMark => (slurMark.key === slurMarkKey))
    ) {
      currentPartIndexForAllSlurSingleUnitsOfSlurDevidedInParts += 1
      allSlurSingleUnitsDevidedInParts[currentPartIndexForAllSlurSingleUnitsOfSlurDevidedInParts] = [currentSingleUnit]
    } else {
      allSlurSingleUnitsDevidedInParts[currentPartIndexForAllSlurSingleUnitsOfSlurDevidedInParts].push(currentSingleUnit)
    }
  }
  let currentSlurDirection = slurDirection
  let rightPointFromPrevSlurPart
  for (let partIndex = 0; partIndex < allSlurSingleUnitsDevidedInParts.length; partIndex++) {
    const isSlurFirstPart = partIndex === 0
    const isSlurLastPart = partIndex === allSlurSingleUnitsDevidedInParts.length - 1
    const allSlurSingleUnitsInCurrentPart = allSlurSingleUnitsDevidedInParts[partIndex]
    if (partIndex > 0) {
      currentSlurDirection = calculateNextSlurDirectionBySingleUnit(currentSlurDirection, slurMarkKey, allSlurSingleUnitsInCurrentPart[0])
    }
    slurPartsDirections[partIndex] = currentSlurDirection

    const currentSlurDirectionSign = currentSlurDirection === 'up' ? +1 : -1

    let currentSlurPartLeftPoint
    if (isSlurFirstPart) {
      currentSlurPartLeftPoint = {
        x: slurLeftPoint.x,
        y: slurLeftPoint.y
      }
      if (extendedFromLeftSide) {
        currentSlurPartLeftPoint.x = markedSlur.voicesBodyThatSlurStartsBefore.left + leftMarginForConnectionsThatStartBefore
        currentSlurPartLeftPoint.y += currentSlurDirectionSign * sShapeSlurYOffsetForItsSidesWhenItBreakingForNextLine
      }
    } else {
      currentSlurPartLeftPoint = {
        x: (rightPointFromPrevSlurPart.lastSlurJunctionPointOfCurrentSlurPart.x + rightPointFromPrevSlurPart.firstSlurJunctionPointInNextSlurPart.x) / 2,
        y: (rightPointFromPrevSlurPart.lastSlurJunctionPointOfCurrentSlurPart.y + rightPointFromPrevSlurPart.firstSlurJunctionPointInNextSlurPart.y) / 2 + (rightPointFromPrevSlurPart.initiallyIsHigherThanNextLeftPoint ? +1 : -1) * (rightPointFromPrevSlurPart.initialYDistanceBetweenCurrentRightPointAndNextLeftPoint) / 4
      }
    }

    let currentSlurPartRightPoint
    if (isSlurLastPart) {
      const lastSingleUnitInSlur = allSlurSingleUnitsDevidedInParts[partIndex][allSlurSingleUnitsDevidedInParts[partIndex].length - 1]
      const slurMarkWithKeyWithDirectionThatFinishes = lastSingleUnitInSlur.slurMarks && (
        lastSingleUnitInSlur.slurMarks.find(slurMark => slurMark.key === slurMarkKey && slurMark.direction) ||
        lastSingleUnitInSlur.slurMarks.find(slurMark => slurMark.key === slurMarkKey && slurMark.direction && slurMark.finish)
      )
      if (slurMarkWithKeyWithDirectionThatFinishes) {
        currentSlurDirection = slurMarkWithKeyWithDirectionThatFinishes.direction
      }
      currentSlurPartRightPoint = calculateSlurJunctionPointForSingleUnit(allSlurSingleUnitsInCurrentPart[allSlurSingleUnitsDevidedInParts[partIndex].length - 1], currentSlurDirection, 'right', markedSlur.rightPlacement, styles)
      if (extendedToRightSide) {
        currentSlurPartRightPoint.x = voicesBody.right
        currentSlurPartRightPoint.y += currentSlurDirectionSign * sShapeSlurYOffsetForItsSidesWhenItBreakingForNextLine
      }
    } else {
      const firstSingleUnitInSlurPart = allSlurSingleUnitsDevidedInParts[partIndex + 1][0]
      const lastSingleUnitInSlurPart = allSlurSingleUnitsDevidedInParts[partIndex + 1][allSlurSingleUnitsDevidedInParts[partIndex + 1].length - 1]
      const nextSlurDirection = calculateNextSlurDirectionBySingleUnit(currentSlurDirection, slurMarkKey, firstSingleUnitInSlurPart, lastSingleUnitInSlurPart)
      const lastSlurJunctionPointOfCurrentSlurPart = calculateSlurJunctionPointForSingleUnit(allSlurSingleUnitsInCurrentPart[allSlurSingleUnitsInCurrentPart.length - 1], currentSlurDirection, 'middle', null, styles)
      const firstSlurJunctionPointInNextSlurPart = calculateSlurJunctionPointForSingleUnit(firstSingleUnitInSlurPart, nextSlurDirection, 'middle', null, styles)
      const initiallyIsHigherThanNextLeftPoint = lastSlurJunctionPointOfCurrentSlurPart.y < firstSlurJunctionPointInNextSlurPart.y
      const initialYDistanceBetweenCurrentRightPointAndNextLeftPoint = Math.abs(lastSlurJunctionPointOfCurrentSlurPart.y - firstSlurJunctionPointInNextSlurPart.y)
      const initialXDistanceBetweenCurrentRightPointAndNextLeftPoint = Math.abs(lastSlurJunctionPointOfCurrentSlurPart.x - firstSlurJunctionPointInNextSlurPart.x)
      currentSlurPartRightPoint = {
        x: (lastSlurJunctionPointOfCurrentSlurPart.x + firstSlurJunctionPointInNextSlurPart.x) / 2,
        y: (lastSlurJunctionPointOfCurrentSlurPart.y + firstSlurJunctionPointInNextSlurPart.y) / 2 + (initiallyIsHigherThanNextLeftPoint ? -1 : +1) * (initialYDistanceBetweenCurrentRightPointAndNextLeftPoint) / 4
      }
      rightPointFromPrevSlurPart = {
        x: currentSlurPartRightPoint.x,
        y: currentSlurPartRightPoint.y,
        initiallyIsHigherThanNextLeftPoint,
        initialYDistanceBetweenCurrentRightPointAndNextLeftPoint,
        initialXDistanceBetweenCurrentRightPointAndNextLeftPoint,
        lastSlurJunctionPointOfCurrentSlurPart,
        firstSlurJunctionPointInNextSlurPart
      }
    }

    const slurPointForFirstSingleUnitInCurrentSlurPart = calculateSlurJunctionPointForSingleUnit(allSlurSingleUnitsInCurrentPart[0], currentSlurDirection, isSlurFirstPart ? 'left' : 'middle', null, styles)
    if (isSlurFirstPart && extendedFromLeftSide) {
      slurPointForFirstSingleUnitInCurrentSlurPart.x = markedSlur.voicesBodyThatSlurStartsBefore.left + leftMarginForConnectionsThatStartBefore
      slurPointForFirstSingleUnitInCurrentSlurPart.y += currentSlurDirectionSign * sShapeSlurYOffsetForItsSidesWhenItBreakingForNextLine
    } else if (!isSlurFirstPart) {
      slurPointForFirstSingleUnitInCurrentSlurPart.x -= Math.abs(currentSlurPartLeftPoint.x - slurPointForFirstSingleUnitInCurrentSlurPart.x) / 4
    }
    const slurPointForLastSingleUnitInCurrentSlurPart = calculateSlurJunctionPointForSingleUnit(allSlurSingleUnitsInCurrentPart[allSlurSingleUnitsInCurrentPart.length - 1], currentSlurDirection, isSlurLastPart ? 'right' : 'middle', isSlurLastPart ? markedSlur.rightPlacement : null, styles)
    if (isSlurLastPart && extendedToRightSide) {
      slurPointForLastSingleUnitInCurrentSlurPart.x = voicesBody.right
      slurPointForLastSingleUnitInCurrentSlurPart.y += currentSlurDirectionSign * sShapeSlurYOffsetForItsSidesWhenItBreakingForNextLine
    } else if (!isSlurLastPart) {
      slurPointForLastSingleUnitInCurrentSlurPart.x += Math.abs(currentSlurPartRightPoint.x - slurPointForLastSingleUnitInCurrentSlurPart.x) / 4
    }

    const currentSlurPartFirstMiddlePoint = {
      x: isSlurFirstPart ? slurPointForFirstSingleUnitInCurrentSlurPart.x : (slurPointForFirstSingleUnitInCurrentSlurPart.x - sShapeSlurPartMiddleJunctionPointXOffset),
      y: isSlurFirstPart ? slurPointForFirstSingleUnitInCurrentSlurPart.y : (slurPointForFirstSingleUnitInCurrentSlurPart.y + (currentSlurDirection === 'up' ? -1 : +1) * sShapeSlurPartMiddleJunctionPointYOffset)
    }
    const currentSlurPartSecondMiddlePoint = {
      x: isSlurLastPart ? slurPointForLastSingleUnitInCurrentSlurPart.x : (slurPointForLastSingleUnitInCurrentSlurPart.x + sShapeSlurPartMiddleJunctionPointXOffset),
      y: isSlurLastPart ? slurPointForLastSingleUnitInCurrentSlurPart.y : (slurPointForLastSingleUnitInCurrentSlurPart.y + (currentSlurDirection === 'up' ? -1 : +1) * sShapeSlurPartMiddleJunctionPointYOffset)
    }

    const currentSlurPartFirstMiddlePhantomPoint = calculateSlurJunctionPhantomPoint(currentSlurPartFirstMiddlePoint, isSlurFirstPart ? 'left' : 'middle', currentSlurDirection, styles)
    const currentSlurPartSecondMiddlePhantomPoint = calculateSlurJunctionPhantomPoint(currentSlurPartSecondMiddlePoint, isSlurLastPart ? 'right' : 'middle', currentSlurDirection, styles)

    const xDistanceBetweenFirstAndLastPointsInCurrentSlurPart = currentSlurPartRightPoint.x - currentSlurPartLeftPoint.x
    const slurRoundCoefficient = calculateSlurRoundCoefficientByXRangeOfSShapeSlur(xDistanceBetweenFirstAndLastPointsInCurrentSlurPart, markedSlur.roundCoefficientFactor, styles)

    const currentSlurPartSplinePoints = calculateSlurSplinePoints(
      currentSlurPartLeftPoint,
      currentSlurPartFirstMiddlePhantomPoint,
      currentSlurPartSecondMiddlePhantomPoint,
      currentSlurPartRightPoint,
      slurRoundCoefficient
    )

    const calucalatedIntersectionPointsForCurrentPartOfSlur = calculateIntersectionPointsForOnOnePartOfSShapeSlurWithItsSingleUnits(
      allSlurSingleUnitsInCurrentPart,
      currentSlurPartSplinePoints,
      currentSlurDirection,
      styles
    )

    const yOffsetForCurrentSlurPartSoThatItCanBeAboveOrUnderAllNotes = calculateYOffsetForSShapeSlurSoThatItCanBeAboveOrUnderAllNotes(
      calucalatedIntersectionPointsForCurrentPartOfSlur,
      allSlurSingleUnitsInCurrentPart,
      extendedFromLeftSide,
      extendedToRightSide,
      currentSlurDirection,
      isSlurFirstPart,
      isSlurLastPart
    )

    const calcualtedSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits = calculateSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits(
      currentSlurPartSplinePoints,
      calucalatedIntersectionPointsForCurrentPartOfSlur,
      yOffsetForCurrentSlurPartSoThatItCanBeAboveOrUnderAllNotes,
      isSlurFirstPart,
      isSlurLastPart,
      currentSlurDirection,
      extendedFromLeftSide,
      extendedToRightSide,
      markedSlur.leftYCorrection,
      markedSlur.rightYCorrection,
      styles
    )

    const intersectionPointsOfStretchedSlurWithItsSingleUnits = calculateIntersectionPointsForOnOnePartOfSShapeSlurWithItsSingleUnits(
      allSlurSingleUnitsInCurrentPart,
      calcualtedSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits,
      currentSlurDirection,
      styles
    )

    for (let slurUnitIndex = 0; slurUnitIndex < allSlurSingleUnitsInCurrentPart.length; slurUnitIndex++) {
      if (currentSlurDirection === 'up') {
        allSlurSingleUnitsInCurrentPart[slurUnitIndex].top = Math.min(
          allSlurSingleUnitsInCurrentPart[slurUnitIndex].top,
          intersectionPointsOfStretchedSlurWithItsSingleUnits[slurUnitIndex].y - styles.distanceBetweenSlurLayers
        )
      } else if (currentSlurDirection === 'down') {
        allSlurSingleUnitsInCurrentPart[slurUnitIndex].bottom = Math.max(
          allSlurSingleUnitsInCurrentPart[slurUnitIndex].bottom,
          intersectionPointsOfStretchedSlurWithItsSingleUnits[slurUnitIndex].y + styles.distanceBetweenSlurLayers
        )
      }
    }

    slurParts.push(calcualtedSShapeSlurSplinePointsWithAdjustedYOffsetSoItCannotIntersectUnits)
  }
  const gatheredTogetherAllSShapeSlurPointsByItsParts = glueSlurParts(slurParts, slurPartsDirections, styles).flat()
  return gatheredTogetherAllSShapeSlurPointsByItsParts
}
