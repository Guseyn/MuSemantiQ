'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measureIndex, directionOfMeasureNumber, numberOfStaves, numberOfStaveLines) {
  return (styles, leftOffset, topOffsetOfFirstStaveLine) => {
    const { fontOptionsForMeasureNumberText, measureNumberTextPadding, measureNumberTextVerticalOffset, intervalBetweenStaveLines } = styles
    const topOffsetOfFirstStaveTop = topOffsetOfFirstStaveLine
    const topOffsetOfFirstStaveBottom = topOffsetOfFirstStaveLine + (numberOfStaveLines - 1) * (intervalBetweenStaveLines)
    const measureIndexTextValue = (measureIndex + 1) + ''
    const measureNumberText = createText(measureIndexTextValue, fontOptionsForMeasureNumberText)(styles, leftOffset + measureNumberTextPadding, directionOfMeasureNumber === 'up' ? topOffsetOfFirstStaveTop : topOffsetOfFirstStaveBottom)
    const directionOfMeasureNumberSign = directionOfMeasureNumber === 'up' ? -1 : +1
    const yDistanceToMoveMeasureNumberText = directionOfMeasureNumber === 'up'
      ? (topOffsetOfFirstStaveTop - measureNumberText.top + measureNumberTextVerticalOffset)
      : (topOffsetOfFirstStaveBottom - measureNumberText.top + measureNumberTextVerticalOffset)
    moveElement(measureNumberText, 0, directionOfMeasureNumberSign * yDistanceToMoveMeasureNumberText)
    const stavePieceWidth = measureNumberText.right - leftOffset + measureNumberTextPadding
    const stavesPieceWithCoordinates = drawStavesPiece(numberOfStaves, numberOfStaveLines, stavePieceWidth, numberOfStaves)(styles, leftOffset, topOffsetOfFirstStaveLine)
    addPropertiesToElement(
      measureNumberText,
      {
        'ref-ids': 'measure-numbers'
      }
    )
    const measureNumber = createGroup(
      'measureNumber',
      [
        stavesPieceWithCoordinates,
        measureNumberText
      ]
    )
    return measureNumber
  }
}
