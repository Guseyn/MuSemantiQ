'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const { tenuto, fontColor } = styles
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
  const tenutoSymbol = createPath(
    tenuto.points,
    null,
    fontColor,
    0,
    startYPosition
  )
  if (direction === 'up') {
    moveElementAbovePointWithInterval(
      tenutoSymbol,
      startYPosition,
      tenuto.yOffset
    )
  } else {
    moveElementBelowPointWithInterval(
      tenutoSymbol,
      startYPosition,
      tenuto.yOffset
    )
  }
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      tenutoSymbol,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      tenutoSymbol,
      leftEdge,
      rightEdge
    )
  }
  return tenutoSymbol
}
