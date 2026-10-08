'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (notePositionNumber, duration) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, ghostWholeNoteHead, ghostHalfNoteHead, ghostBlackNoteHead, doubleVerticalLinesForDoubleWholeNoteHeadShape, doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions, verticalLineForQuadrupleWholeNoteShape, verticalLineForQuadrupleWholeNoteStrokeOptions, fontColor } = styles
    const topOffsetForNoteHead = topOffset + notePositionNumber * intervalBetweenStaveLines
    const elementsForNoteHead = []
    if (duration === 4) {
      const spaceBetweenLinesAndCrossInTheMiddle = verticalLineForQuadrupleWholeNoteStrokeOptions.width / 2
      const leftLine = createPath(
        verticalLineForQuadrupleWholeNoteShape,
        verticalLineForQuadrupleWholeNoteStrokeOptions,
        fontColor,
        leftOffset,
        topOffsetForNoteHead
      )
      const crossInTheMiddle = createPath(
        ghostWholeNoteHead.points,
        null,
        true,
        doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions.width / 2 + leftLine.right + spaceBetweenLinesAndCrossInTheMiddle,
        topOffsetForNoteHead + ghostWholeNoteHead.yCorrection
      )
      const rightLine = createPath(
        verticalLineForQuadrupleWholeNoteShape,
        verticalLineForQuadrupleWholeNoteStrokeOptions,
        false,
        crossInTheMiddle.left - leftLine.right + crossInTheMiddle.right,
        topOffsetForNoteHead
      )
      elementsForNoteHead.push(
        leftLine,
        crossInTheMiddle,
        rightLine
      )
    } else if (duration === 2) {
      const spaceBetweenLinesAndCrossInTheMiddle = doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions.width / 2
      const leftLines = createPath(
        doubleVerticalLinesForDoubleWholeNoteHeadShape,
        doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions,
        false,
        leftOffset,
        topOffsetForNoteHead
      )
      const crossInTheMiddle = createPath(
        ghostWholeNoteHead.points,
        null,
        fontColor,
        doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions.width / 2 + leftLines.right + spaceBetweenLinesAndCrossInTheMiddle,
        topOffsetForNoteHead + ghostWholeNoteHead.yCorrection
      )
      const rightLines = createPath(
        doubleVerticalLinesForDoubleWholeNoteHeadShape,
        doubleVerticalLinesForDoubleWholeNoteHeadStrokeOptions,
        false,
        crossInTheMiddle.left - leftLines.right + crossInTheMiddle.right,
        topOffsetForNoteHead
      )
      elementsForNoteHead.push(
        leftLines,
        crossInTheMiddle,
        rightLines
      )
    } else if (duration === 1) {
      elementsForNoteHead.push(
        createPath(
          ghostWholeNoteHead.points,
          null,
          fontColor,
          leftOffset,
          topOffsetForNoteHead + ghostWholeNoteHead.yCorrection
        )
      )
    } else if (duration === 1 / 2) {
      elementsForNoteHead.push(
        createPath(
          ghostHalfNoteHead.points,
          null,
          fontColor,
          leftOffset,
          topOffsetForNoteHead + ghostHalfNoteHead.yCorrection
        )
      )
    } else {
      elementsForNoteHead.push(
        createPath(
          ghostBlackNoteHead.points,
          null,
          fontColor,
          leftOffset,
          topOffsetForNoteHead + ghostBlackNoteHead.yCorrection
        )
      )
    }
    return createGroup(
      'noteHead',
      elementsForNoteHead
    )
  }
}
