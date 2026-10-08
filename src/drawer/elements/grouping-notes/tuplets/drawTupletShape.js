'use strict'

import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementInTheCenterBetweenPointsAboveAndBelow from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPointsAboveAndBelow.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (lastLeftTupletPoint, voicesBody, belongsToComplexTuplet, extendedFromLeftSide, extendedToRightSide, styles) {
  const tupletElements = []
  const tupletDirectionSign = lastLeftTupletPoint.tupletDirection === 'up' ? +1 : -1
  const leftSingeUnitOfTuplet = lastLeftTupletPoint.singleUnits[0]
  const rightSingleUnitOfTuplet = lastLeftTupletPoint.singleUnits[lastLeftTupletPoint.singleUnits.length - 1]
  const tupletLeftXPoint = leftSingeUnitOfTuplet.stemless
    ? leftSingeUnitOfTuplet.bodyLeft
    : (leftSingeUnitOfTuplet.stemDirection === lastLeftTupletPoint.tupletDirection)
      ? leftSingeUnitOfTuplet.stemRight
      : leftSingeUnitOfTuplet.bodyLeft
  const tupletRightXPoint = rightSingleUnitOfTuplet.stemless
    ? rightSingleUnitOfTuplet.bodyRight
    : (rightSingleUnitOfTuplet.stemDirection === lastLeftTupletPoint.tupletDirection)
      ? rightSingleUnitOfTuplet.stemLeft
      : rightSingleUnitOfTuplet.bodyRight
  const centerOfTupletLine = {
    x: (
      (extendedToRightSide ? (voicesBody.right - styles.tupletMarginFromMeasureRightPoint) : tupletRightXPoint) +
      (extendedFromLeftSide ? (lastLeftTupletPoint.voicesBodyThatTupletStartsBefore.left + styles.tupletMarginFromMeasureLeftPoint) : tupletLeftXPoint)
    ) / 2,
    y: lastLeftTupletPoint.y
  }
  let lastLeftOffsetOfTupletText = centerOfTupletLine.x
  const tupletValueTextSymbols = []
  lastLeftTupletPoint.tupletValue.split('').forEach(char => {
    const symbol = createPath(
      styles.tupletLetters[char].points,
      null,
      styles.fontColor,
      lastLeftOffsetOfTupletText,
      styles.tupletLetters[char].yCorrection || 0
    )
    tupletValueTextSymbols.push(symbol)
    lastLeftOffsetOfTupletText = symbol.right
  })
  const tupletValueText = createGroup(
    'tupletValueText',
    tupletValueTextSymbols
  )
  addPropertiesToElement(
    tupletValueText,
    {
      'ref-ids': lastLeftTupletPoint.tupletKey.replace('tuplet', 'tuplet-value')
    }
  )
  moveElementInTheCenterBetweenPoints(
    tupletValueText,
    centerOfTupletLine.x,
    centerOfTupletLine.x
  )
  moveElementInTheCenterBetweenPointsAboveAndBelow(
    tupletValueText,
    centerOfTupletLine.y,
    centerOfTupletLine.y
  )
  tupletElements.push(tupletValueText)
  let lastLeftTupletPointContainsSingleUnitsThatForcesBrackets = extendedFromLeftSide || extendedToRightSide
  for (let singleUnitIndex = 0; singleUnitIndex < lastLeftTupletPoint.singleUnits.length; singleUnitIndex++) {
    if (lastLeftTupletPoint.singleUnits[singleUnitIndex].unitDuration >= 1 / 4) {
      lastLeftTupletPointContainsSingleUnitsThatForcesBrackets = true
      break
    }
    if (lastLeftTupletPoint.tupletDirection !== lastLeftTupletPoint.singleUnits[singleUnitIndex].stemDirection) {
      lastLeftTupletPointContainsSingleUnitsThatForcesBrackets = true
      break
    }
    if (!lastLeftTupletPoint.singleUnits[singleUnitIndex].beamedWithNext && (singleUnitIndex !== lastLeftTupletPoint.singleUnits.length - 1)) {
      lastLeftTupletPointContainsSingleUnitsThatForcesBrackets = true
      break
    }
    if (lastLeftTupletPoint.singleUnits[singleUnitIndex].beamedWithNext && (singleUnitIndex === lastLeftTupletPoint.singleUnits.length - 1)) {
      lastLeftTupletPointContainsSingleUnitsThatForcesBrackets = true
      break
    }
  }
  if (lastLeftTupletPoint.level > 0 || lastLeftTupletPointContainsSingleUnitsThatForcesBrackets || lastLeftTupletPoint.mustBeWithBrackets) {
    const leftPointOfFirstPartOfTupletLine = {
      x: tupletLeftXPoint - styles.tupletSidePadding,
      y: lastLeftTupletPoint.y
    }
    if (extendedFromLeftSide) {
      leftPointOfFirstPartOfTupletLine.x = lastLeftTupletPoint.voicesBodyThatTupletStartsBefore.left + styles.tupletMarginFromMeasureLeftPoint
    }
    const rightPointOfFirstPartOfTupletLine = {
      x: tupletValueText.left - styles.tupletValueTextSideMargin,
      y: lastLeftTupletPoint.y
    }
    if (rightPointOfFirstPartOfTupletLine.x < leftPointOfFirstPartOfTupletLine.x) {
      const xTmp = leftPointOfFirstPartOfTupletLine.x
      leftPointOfFirstPartOfTupletLine.x = rightPointOfFirstPartOfTupletLine.x
      rightPointOfFirstPartOfTupletLine.x = xTmp - (styles.tupletValueTextSideMargin / 2)
    }
    const leftPointOfSecondPartOfTupletLine = {
      x: tupletValueText.right + styles.tupletValueTextSideMargin,
      y: lastLeftTupletPoint.y
    }
    const rightPointOfSecondPartOfTupletLine = {
      x: tupletRightXPoint + styles.tupletSidePadding,
      y: lastLeftTupletPoint.y
    }
    if (extendedToRightSide) {
      rightPointOfSecondPartOfTupletLine.x = voicesBody.right - styles.tupletMarginFromMeasureRightPoint
    }
    if (rightPointOfSecondPartOfTupletLine.x < leftPointOfSecondPartOfTupletLine.x) {
      const xTmp = leftPointOfSecondPartOfTupletLine.x
      leftPointOfSecondPartOfTupletLine.x = rightPointOfSecondPartOfTupletLine.x + (styles.tupletValueTextSideMargin / 2)
      rightPointOfSecondPartOfTupletLine.x = xTmp
    }
    const leftTupletColumnBottomPoint = {
      x: leftPointOfFirstPartOfTupletLine.x,
      y: leftPointOfFirstPartOfTupletLine.y + tupletDirectionSign * styles.tupletColumnsHeight
    }
    if (extendedFromLeftSide) {
      leftTupletColumnBottomPoint.y = leftPointOfFirstPartOfTupletLine.y
    }
    const rightTupletColumnBottomPoint = {
      x: rightPointOfSecondPartOfTupletLine.x,
      y: leftPointOfFirstPartOfTupletLine.y + tupletDirectionSign * styles.tupletColumnsHeight
    }
    if (extendedToRightSide) {
      rightTupletColumnBottomPoint.y = leftPointOfFirstPartOfTupletLine.y
    }
    const leftTupletBracket = createPath(
      [
        'M',
        leftTupletColumnBottomPoint.x, leftTupletColumnBottomPoint.y,
        'L',
        leftPointOfFirstPartOfTupletLine.x, leftPointOfFirstPartOfTupletLine.y,
        'L',
        rightPointOfFirstPartOfTupletLine.x, rightPointOfFirstPartOfTupletLine.y
      ],
      styles.tupletStrokeOptions,
      false
    )
    const rightTupletBracket = createPath(
      [
        'M',
        leftPointOfSecondPartOfTupletLine.x, leftPointOfSecondPartOfTupletLine.y,
        'L',
        rightPointOfSecondPartOfTupletLine.x, rightPointOfSecondPartOfTupletLine.y,
        'L',
        rightTupletColumnBottomPoint.x, rightTupletColumnBottomPoint.y
      ],
      styles.tupletStrokeOptions,
      false
    )
    addPropertiesToElement(
      leftTupletBracket,
      {
        'ref-ids': lastLeftTupletPoint.tupletKey.replace('tuplet', 'tuplet-brackets')
      }
    )
    addPropertiesToElement(
      rightTupletBracket,
      {
        'ref-ids': lastLeftTupletPoint.tupletKey.replace('tuplet', 'tuplet-brackets')
      }
    )
    tupletElements.push(
      leftTupletBracket,
      rightTupletBracket
    )
  }
  const drawnTupletElements = createGroup(
    'tuplet',
    tupletElements
  )
  addPropertiesToElement(
    drawnTupletElements,
    {
      'ref-ids': lastLeftTupletPoint.tupletKey
    }
  )
  moveElement(
    drawnTupletElements,
    0,
    lastLeftTupletPoint.tupletYCorrection
  )

  for (let singleUnitIndex = 0; singleUnitIndex < lastLeftTupletPoint.singleUnits.length; singleUnitIndex++) {
    lastLeftTupletPoint.singleUnits[singleUnitIndex].top = Math.min(lastLeftTupletPoint.singleUnits[singleUnitIndex].top, drawnTupletElements.top)
    lastLeftTupletPoint.singleUnits[singleUnitIndex].bottom = Math.max(lastLeftTupletPoint.singleUnits[singleUnitIndex].bottom, drawnTupletElements.bottom)
  }
  rightSingleUnitOfTuplet.top = Math.min(rightSingleUnitOfTuplet.top, drawnTupletElements.top)
  rightSingleUnitOfTuplet.bottom = Math.max(rightSingleUnitOfTuplet.bottom, drawnTupletElements.bottom)

  return drawnTupletElements
}
