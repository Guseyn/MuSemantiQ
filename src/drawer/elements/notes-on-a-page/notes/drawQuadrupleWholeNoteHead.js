'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (notePositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, wholeNoteHead, verticalLineForQuadrupleWholeNoteShape, verticalLineForQuadrupleWholeNoteStrokeOptions, fontColor } = styles
    const topOffsetForNoteHead = topOffset + notePositionNumber * intervalBetweenStaveLines
    const spaceBetweenLinesAndCircleInTheMiddle = verticalLineForQuadrupleWholeNoteStrokeOptions.width / 2
    const leftVerticalLine = createPath(
      verticalLineForQuadrupleWholeNoteShape,
      verticalLineForQuadrupleWholeNoteStrokeOptions,
      true,
      leftOffset,
      topOffsetForNoteHead
    )
    const circleInTheMiddle = createPath(
      wholeNoteHead.points,
      null,
      fontColor,
      verticalLineForQuadrupleWholeNoteStrokeOptions.width / 2 + leftVerticalLine.right + spaceBetweenLinesAndCircleInTheMiddle,
      topOffsetForNoteHead + wholeNoteHead.yCorrection
    )
    const rightVerticalLine = createPath(
      verticalLineForQuadrupleWholeNoteShape,
      verticalLineForQuadrupleWholeNoteStrokeOptions,
      true,
      circleInTheMiddle.left - leftVerticalLine.right + circleInTheMiddle.right,
      topOffsetForNoteHead
    )
    return createGroup(
      'noteHead',
      [
        leftVerticalLine,
        circleInTheMiddle,
        rightVerticalLine
      ]
    )
  }
}
