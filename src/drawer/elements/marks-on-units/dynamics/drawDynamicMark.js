'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const components = []
  const { dynamicTextFontOptions, dynamicYOffset, dynamicLetters, fontColor } = styles
  const tunedDynamicTextFontOptions = Object.assign({}, dynamicTextFontOptions)
  const { direction, textValue } = currentArticulationParams
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(singleUnit, direction)
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const startYPosition = direction === 'up'
    ? Math.min(singleUnit.top, topOfCurrentStave)
    : Math.max(singleUnit.bottom, bottomOfCurrentStave)
  const dynamicText = dynamicLetters[textValue]
    ? createPath(
      dynamicLetters[textValue].points,
      null,
      fontColor,
      0,
      startYPosition
    )
    : createText(
      textValue || '??', tunedDynamicTextFontOptions
    )(styles, 0, startYPosition)
  components.push(
    dynamicText
  )
  let groupedDynamicText = createGroup(
    'dynamicText',
    components
  )
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      groupedDynamicText,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      groupedDynamicText,
      leftEdge,
      rightEdge
    )
  }
  if (!groupedDynamicText.isEmpty) {
    if (direction === 'up') {
      moveElementAbovePointWithInterval(
        groupedDynamicText,
        startYPosition,
        dynamicYOffset
      )
    } else {
      moveElementBelowPointWithInterval(
        groupedDynamicText,
        startYPosition,
        dynamicYOffset
      )
    }
  }
  return groupedDynamicText
}
