'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const { marcato, fontColor } = styles
  const { direction } = currentArticulationParams
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(singleUnit, direction)
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const startYPosition = currentArticulationParams.aboveBelowOverUnderStaveLines
    ? direction === 'up'
      ? Math.min(singleUnit.top, topOfCurrentStave)
      : Math.max(singleUnit.bottom, bottomOfCurrentStave)
    : direction === 'up'
      ? singleUnit.top
      : singleUnit.bottom
  const marcatoSymbol = createPath(
    direction === 'up' ? marcato.upPoints : marcato.downPoints,
    null,
    fontColor,
    0,
    startYPosition
  )
  if (direction === 'up') {
    moveElementAbovePointWithInterval(
      marcatoSymbol,
      startYPosition,
      marcato.yOffset
    )
  } else {
    moveElementBelowPointWithInterval(
      marcatoSymbol,
      startYPosition,
      marcato.yOffset
    )
  }
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      marcatoSymbol,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      marcatoSymbol,
      leftEdge,
      rightEdge
    )
  }
  return marcatoSymbol
}
