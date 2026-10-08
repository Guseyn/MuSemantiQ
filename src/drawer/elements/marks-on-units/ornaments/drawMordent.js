'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import drawArticulationKeysInVerticalLine from '#msq/drawer/elements/marks-on-units/ornaments/drawArticulationKeysInVerticalLine.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const components = []
  const { mordent, mordentInverted, fontColor } = styles
  const { keyAbove, keyBelow, inverted } = currentArticulationParams
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(singleUnit)
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const startYPosition = Math.min(singleUnit.top, topOfCurrentStave)
  let mordentSymbol
  if (inverted) {
    mordentSymbol = createPath(
      mordentInverted.points,
      null,
      fontColor,
      0,
      startYPosition
    )
  } else {
    mordentSymbol = createPath(
      mordent.points,
      null,
      fontColor,
      0,
      startYPosition
    )
  }
  components.push(
    mordentSymbol
  )
  if (keyAbove) {
    components.push(
      drawArticulationKeysInVerticalLine(singleUnit, articulationIndex, keyAbove, mordentSymbol, 'above', styles)
    )
  }
  if (keyBelow) {
    components.push(
      drawArticulationKeysInVerticalLine(singleUnit, articulationIndex, keyBelow, mordentSymbol, 'below', styles)
    )
  }
  let groupedMordent = createGroup(
    'upMordent',
    components
  )
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      groupedMordent,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      groupedMordent,
      leftEdge,
      rightEdge
    )
  }
  moveElementAbovePointWithInterval(
    groupedMordent,
    startYPosition,
    mordent.yOffset
  )
  return groupedMordent
}
