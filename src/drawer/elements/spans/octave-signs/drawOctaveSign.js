'use strict'

import drawOctaveSignText from '#msq/drawer/elements/spans/octave-signs/drawOctaveSignText.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'

export default function (singleUnit, articulationIndex, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const { octaveSignYOffset, octaveSignXCorrection, twoOctavesSignXCorrection } = styles
  const xCorrectionForOctaveSign = {
    '8': octaveSignXCorrection,
    '15': twoOctavesSignXCorrection
  }
  const { direction, textValue, subTextValue } = currentArticulationParams
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(singleUnit, direction)
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const startYPosition = direction === 'up'
    ? Math.min(singleUnit.top, topOfCurrentStave)
    : Math.max(singleUnit.bottom, bottomOfCurrentStave)
  let octaveSignText = drawOctaveSignText(textValue, subTextValue, direction)(styles, 0, startYPosition)
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      octaveSignText,
      singleUnit.stemLeft,
      singleUnit.stemRight
    )
  } else {
    moveElementInTheCenterBetweenPoints(
      octaveSignText,
      leftEdge,
      rightEdge
    )
  }
  moveElement(
    octaveSignText,
    xCorrectionForOctaveSign[textValue]
  )
  if (direction === 'up') {
    moveElementAbovePointWithInterval(
      octaveSignText,
      startYPosition,
      octaveSignYOffset
    )
  } else {
    moveElementBelowPointWithInterval(
      octaveSignText,
      startYPosition,
      octaveSignYOffset
    )
  }
  return octaveSignText
}
