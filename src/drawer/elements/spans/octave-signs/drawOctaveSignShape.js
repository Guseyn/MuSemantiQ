'use strict'

import drawOctaveSignText from '#msq/drawer/elements/spans/octave-signs/drawOctaveSignText.js'
import createLine from '#msq/drawer/elements/basic/createLine.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (octaveSignParams, styles) {
  const { intervalBetweenStaveLines, octaveSignYOffset, octaveSignXCorrection, twoOctavesSignXCorrection, octaveSignHorizontalLineStrokeOptions, octaveSignVerticalLineStrokeOptions, octaveSignHorizontalLineLeftOffset, octaveSignHorizontalLineRightOffset } = styles
  const components = []
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(octaveSignParams.leftSingleUnit, octaveSignParams.direction)
  const leftEdge = octaveSignParams.leftSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = octaveSignParams.leftSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  let octaveSignText = drawOctaveSignText(octaveSignParams.octaveNumber, octaveSignParams.octavePostfix, octaveSignParams.direction)(styles, 0, octaveSignParams.y)
  const xCorrectionForOctaveSign = {
    '8': octaveSignXCorrection,
    '15': twoOctavesSignXCorrection
  }
  if (shouldBeAboveOrUnderStemLine) {
    moveElementInTheCenterBetweenPoints(
      octaveSignText,
      octaveSignParams.leftSingleUnit.stemLeft,
      octaveSignParams.leftSingleUnit.stemRight
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
    xCorrectionForOctaveSign[octaveSignParams.octaveNumber]
  )
  if (octaveSignParams.direction === 'up') {
    moveElementAbovePointWithInterval(
      octaveSignText,
      octaveSignParams.y,
      octaveSignYOffset
    )
  } else {
    moveElementBelowPointWithInterval(
      octaveSignText,
      octaveSignParams.y,
      octaveSignYOffset
    )
  }
  components.push(octaveSignText)
  const yCenterOfOctaveSignText = (octaveSignText.top + octaveSignText.bottom) / 2
  components.push(
    createLine(
      octaveSignText.right + octaveSignHorizontalLineLeftOffset,
      yCenterOfOctaveSignText,
      octaveSignParams.rightSingleUnit.right + octaveSignHorizontalLineRightOffset,
      yCenterOfOctaveSignText,
      octaveSignHorizontalLineStrokeOptions
    ),
    createLine(
      octaveSignParams.rightSingleUnit.right + octaveSignHorizontalLineRightOffset,
      yCenterOfOctaveSignText,
      octaveSignParams.rightSingleUnit.right + octaveSignHorizontalLineRightOffset,
      octaveSignParams.direction === 'up'
        ? octaveSignText.bottom
        : octaveSignText.top,
      octaveSignVerticalLineStrokeOptions
    )
  )
  const octaveSign = createGroup(
    'octaveSign',
    components
  )
  addPropertiesToElement(
    octaveSign,
    {
      'ref-ids': octaveSignParams.key
    }
  )
  moveElement(
    octaveSign,
    0,
    (octaveSignParams.yCorrection || 0) * intervalBetweenStaveLines
  )
  octaveSignParams.chords.forEach(chord => {
    chord.top = Math.min(chord.top, octaveSign.top)
    chord.bottom = Math.max(chord.bottom, octaveSign.bottom)
  })
  return octaveSign
}
