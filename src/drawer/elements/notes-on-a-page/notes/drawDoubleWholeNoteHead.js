'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (notePositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, wholeNoteHead, doubleVerticalLinesForDoubleWholeNoteHeadShape, doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions, fontColor } = styles
    const topOffsetForNoteHead = topOffset + notePositionNumber * intervalBetweenStaveLines
    const spaceBetweenLinesAndCircleInTheMiddle = doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions.width / 2
    const leftLines = createPath(
      doubleVerticalLinesForDoubleWholeNoteHeadShape,
      doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions,
      true,
      leftOffset,
      topOffsetForNoteHead
    )
    const circleInTheMiddle = createPath(
      wholeNoteHead.points,
      null,
      fontColor,
      doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions.width / 2 + leftLines.right + spaceBetweenLinesAndCircleInTheMiddle,
      topOffsetForNoteHead + wholeNoteHead.yCorrection
    )
    const rightLines = createPath(
      doubleVerticalLinesForDoubleWholeNoteHeadShape,
      doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions,
      true,
      circleInTheMiddle.left - leftLines.right + circleInTheMiddle.right,
      topOffsetForNoteHead
    )
    return createGroup(
      'noteHead',
      [
        leftLines,
        circleInTheMiddle,
        rightLines
      ]
    )
  }
}
