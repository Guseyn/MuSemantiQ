'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import createPathWithOutline from '#msq/drawer/elements/basic/createPathWithOutline.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const { noteLetterArticulationFontOptions, noteLetterArticulationOffsetY, noteLetters } = styles
  const { direction, textValue, fontColor } = currentArticulationParams
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
  const noteLetterArticulation = createGroup(
    'noteLetter',
    [
      noteLetters[textValue]
        ? createPathWithOutline(
          noteLetters[textValue].points,
          null,
          fontColor,
          noteLetterArticulationFontOptions.outlinePadding,
          noteLetterArticulationFontOptions.outlineColor,
          noteLetterArticulationFontOptions.outlineRadius,
          0,
          startYPosition
        )
        : createText(
          textValue,
          noteLetterArticulationFontOptions
        )(styles, 0, startYPosition)
    ]
  )
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      noteLetterArticulation,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      noteLetterArticulation,
      leftEdge,
      rightEdge
    )
  }
  if (direction === 'up') {
    moveElementAbovePointWithInterval(
      noteLetterArticulation,
      startYPosition,
      noteLetterArticulationOffsetY
    )
  } else {
    moveElementBelowPointWithInterval(
      noteLetterArticulation,
      startYPosition,
      noteLetterArticulationOffsetY
    )
  }
  return noteLetterArticulation
}
