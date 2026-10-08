'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (staveStartNumber, staveEndNumber, numberOfAllStaves, numberOfStaveLines) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, intervalBetweenStaves, bracketLineWidth, bracketTop, bracketBottom, bracketXCorrection, fontColor, staveLineHeight } = styles
    const topOffsetForStartStave = calculateTopOffsetForCurrentStave(topOffset, staveStartNumber, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
    const numberOfStavesIncludedInBracket = staveEndNumber - staveStartNumber + 1
    const bottomOffset = topOffsetForStartStave + (numberOfStavesIncludedInBracket - 1) * intervalBetweenStaves + ((numberOfStaveLines - 1) * numberOfStavesIncludedInBracket) * intervalBetweenStaveLines
    const bracketLineWithCoordinates = createPath(
      [
        'M',
        0, topOffsetForStartStave - staveLineHeight,
        'L',
        bracketLineWidth, topOffsetForStartStave - staveLineHeight,
        'L',
        bracketLineWidth, bottomOffset + staveLineHeight,
        'L',
        0, bottomOffset + staveLineHeight,
        'Z'
      ],
      null,
      fontColor,
      leftOffset,
      0
    )
    const bracketTopShape = createPath(
      bracketTop.points,
      null,
      fontColor,
      leftOffset,
      topOffsetForStartStave - staveLineHeight
    )
    const bracketBottomShape = createPath(
      bracketBottom.points,
      null,
      fontColor,
      leftOffset,
      bottomOffset + staveLineHeight
    )
    moveElementAbovePointWithInterval(
      bracketTopShape,
      topOffsetForStartStave - staveLineHeight,
      0
    )
    moveElementBelowPointWithInterval(
      bracketBottomShape,
      bottomOffset + staveLineHeight,
      0
    )
    const bracketConnection = createGroup(
      'bracketConnection',
      [ bracketLineWithCoordinates, bracketTopShape, bracketBottomShape ]
    )
    bracketConnection.right -= bracketXCorrection
    return bracketConnection
  }
}
