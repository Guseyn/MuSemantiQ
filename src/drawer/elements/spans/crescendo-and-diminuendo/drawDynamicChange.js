'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (dynamicChangeParams, styles) {
  const components = []
  const { intervalBetweenStaveLines, dynamicTextFontOptions, dynamicChangeYOffset, dynamicChangeSignOffsetFromDynamicText, dynamicChangeSignDefaultHeight, dynamicChangeLinesStrokeOptions, dynamicLetters, fontColor } = styles
  const tunedDynamicTextFontOptions = Object.assign({}, dynamicTextFontOptions)
  if (dynamicChangeParams.valueBefore) {
    const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(
      dynamicChangeParams.leftSingleUnit, dynamicChangeParams.direction
    )
    const leftEdge = dynamicChangeParams.leftSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
    const rightEdge = dynamicChangeParams.leftSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
    const dynamicText = dynamicLetters[dynamicChangeParams.valueBefore]
      ? createPath(
        dynamicLetters[dynamicChangeParams.valueBefore].points,
        null,
        fontColor,
        0,
        dynamicChangeParams.startYPosition
      )
      : createText(
        dynamicChangeParams.valueBefore || '??', tunedDynamicTextFontOptions
      )(styles, 0, dynamicChangeParams.startYPosition)
    if (shouldBeAboveOrUnderStemLine) {
      moveElementInTheCenterBetweenPoints(
        dynamicText,
        dynamicChangeParams.leftSingleUnit.stemLeft,
        dynamicChangeParams.leftSingleUnit.stemRight
      )
    } else {
      moveElementInTheCenterBetweenPoints(
        dynamicText,
        leftEdge,
        rightEdge
      )
    }
    addPropertiesToElement(
      dynamicText,
      {
        'ref-ids': dynamicChangeParams.key.replace('crescendo-or-diminuendo', 'crescendo-or-diminuendo-value-before')
      }
    )
    components.push(dynamicText)
  }
  if (dynamicChangeParams.valueAfter) {
    const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(
      dynamicChangeParams.rightSingleUnit, dynamicChangeParams.direction
    )
    const leftEdge = dynamicChangeParams.rightSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
    const rightEdge = dynamicChangeParams.rightSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
    const dynamicText = dynamicLetters[dynamicChangeParams.valueAfter]
      ? createPath(
        dynamicLetters[dynamicChangeParams.valueAfter].points,
        null,
        fontColor,
        0,
        dynamicChangeParams.startYPosition
      )
      : createText(
        dynamicChangeParams.valueAfter || '??', tunedDynamicTextFontOptions
      )(styles, 0, dynamicChangeParams.startYPosition)
    if (shouldBeAboveOrUnderStemLine) {
      moveElementInTheCenterBetweenPoints(
        dynamicText,
        dynamicChangeParams.rightSingleUnit.stemLeft,
        dynamicChangeParams.rightSingleUnit.stemRight
      )
    } else {
      moveElementInTheCenterBetweenPoints(
        dynamicText,
        leftEdge,
        rightEdge
      )
    }
    if (dynamicChangeParams.valueBefore) {
      const textBefore = components[0]
      const yDistanceToMove = (textBefore.bottom + textBefore.top) / 2 - (dynamicText.bottom + dynamicText.top) / 2
      moveElement(
        dynamicText,
        0,
        yDistanceToMove
      )
    }
    addPropertiesToElement(
      dynamicText,
      {
        'ref-ids': dynamicChangeParams.key.replace('crescendo-or-diminuendo', 'crescendo-or-diminuendo-value-after')
      }
    )
    components.push(dynamicText)
  }
  const dynamicChangePoints = []
  if (dynamicChangeParams.type === 'crescendo') {
    if (dynamicChangeParams.valueBefore) {
      const dynamicBeforeText = components[0]
      dynamicChangePoints.push(
        dynamicBeforeText.right + dynamicChangeSignOffsetFromDynamicText,
        (dynamicBeforeText.top + dynamicBeforeText.bottom) / 2
      )
    } else {
      if (dynamicChangeParams.valueAfter) {
        const dynamicAfterText = components[0]
        const dynamicAfterTextYCenter = (dynamicAfterText.top + dynamicAfterText.bottom) / 2
        dynamicChangePoints.push(
          dynamicChangeParams.leftSingleUnit.left,
          dynamicAfterTextYCenter
        )
      } else {
        dynamicChangePoints.push(
          dynamicChangeParams.leftSingleUnit.left,
          dynamicChangeParams.startYPosition
        )
      }
    }
    if (dynamicChangeParams.valueAfter) {
      const dynamicAfterText = components[1] || components[0]
      const dynamicAfterTextYCenter = (dynamicAfterText.top + dynamicAfterText.bottom) / 2
      dynamicChangePoints.push(
        dynamicAfterText.left - dynamicChangeSignOffsetFromDynamicText,
        dynamicAfterTextYCenter - dynamicChangeSignDefaultHeight / 2,
        dynamicAfterText.left - dynamicChangeSignOffsetFromDynamicText,
        dynamicAfterTextYCenter + dynamicChangeSignDefaultHeight / 2
      )
    } else {
      dynamicChangePoints.push(
        dynamicChangeParams.rightSingleUnit.right,
        dynamicChangePoints[1] + dynamicChangeSignDefaultHeight / 2,
        dynamicChangeParams.rightSingleUnit.right,
        dynamicChangePoints[1] - dynamicChangeSignDefaultHeight / 2
      )
    }
    components.push(
      createPath(
        [
          'M',
          dynamicChangePoints[0], dynamicChangePoints[1],
          'L',
          dynamicChangePoints[2], dynamicChangePoints[3],
          'M',
          dynamicChangePoints[0], dynamicChangePoints[1],
          'L',
          dynamicChangePoints[4], dynamicChangePoints[5]
        ],
        dynamicChangeLinesStrokeOptions
      )
    )
  } else if (dynamicChangeParams.type === 'diminuendo') {
    if (dynamicChangeParams.valueBefore) {
      const dynamicBeforeText = components[0]
      const dynamicBeforeTextYCenter = (dynamicBeforeText.top + dynamicBeforeText.bottom) / 2
      dynamicChangePoints.push(
        dynamicBeforeText.right + dynamicChangeSignOffsetFromDynamicText,
        dynamicBeforeTextYCenter - dynamicChangeSignDefaultHeight / 2,
        dynamicBeforeText.right + dynamicChangeSignOffsetFromDynamicText,
        dynamicBeforeTextYCenter + dynamicChangeSignDefaultHeight / 2
      )
    } else {
      if (dynamicChangeParams.valueAfter) {
        const dynamicAfterText = components[0]
        const dynamicAfterTextYCenter = (dynamicAfterText.top + dynamicAfterText.bottom) / 2
        dynamicChangePoints.push(
          dynamicChangeParams.leftSingleUnit.left,
          dynamicAfterTextYCenter - dynamicChangeSignDefaultHeight / 2,
          dynamicChangeParams.leftSingleUnit.left,
          dynamicAfterTextYCenter + dynamicChangeSignDefaultHeight / 2,
        )
      } else {
        dynamicChangePoints.push(
          dynamicChangeParams.leftSingleUnit.left,
          (dynamicChangeParams.startYPosition - dynamicChangeSignDefaultHeight / 2),
          dynamicChangeParams.leftSingleUnit.left,
          (dynamicChangeParams.startYPosition + dynamicChangeSignDefaultHeight / 2)
        )
      }
    }
    if (dynamicChangeParams.valueAfter) {
      const dynamicAfterText = components[1] || components[0]
      dynamicChangePoints.push(
        dynamicAfterText.left - dynamicChangeSignOffsetFromDynamicText,
        (dynamicAfterText.top + dynamicAfterText.bottom) / 2
      )
    } else {
      dynamicChangePoints.push(
        dynamicChangeParams.rightSingleUnit.right,
        (dynamicChangePoints[1] + dynamicChangePoints[3]) / 2
      )
    }
    components.push(
      createPath(
        [
          'M',
          dynamicChangePoints[0], dynamicChangePoints[1],
          'L',
          dynamicChangePoints[4], dynamicChangePoints[5],
          'M',
          dynamicChangePoints[2], dynamicChangePoints[3],
          'L',
          dynamicChangePoints[4], dynamicChangePoints[5]
        ],
        dynamicChangeLinesStrokeOptions
      )
    )
  }
  let dynamicChange = createElementWithAdditionalInformation(
    createGroup(
      'dynamicChange',
      components
    ),
    { chords: dynamicChangeParams.chords }
  )
  addPropertiesToElement(
    dynamicChange,
    {
      'ref-ids': dynamicChangeParams.key
    }
  )
  if (!dynamicChange.isEmpty) {
    if (dynamicChangeParams.direction === 'up') {
      moveElementAbovePointWithInterval(
        dynamicChange,
        dynamicChangeParams.startYPosition,
        dynamicChangeYOffset
      )
    } else {
      moveElementBelowPointWithInterval(
        dynamicChange,
        dynamicChangeParams.startYPosition,
        dynamicChangeYOffset
      )
    }
    moveElement(
      dynamicChange,
      0,
      (dynamicChangeParams.yCorrection || 0) * intervalBetweenStaveLines
    )
  }
  return dynamicChange
}
