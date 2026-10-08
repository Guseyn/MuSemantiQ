'use strict'

import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (numberOfStaves, maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, noSpaceNeeded = false) {
  return (styles, leftOffset, topOffsetOfFirstStaveLine) => {
    const { fontColor, intervalBetweenBarLines, barLineWidth } = styles
    const stavePieceWidth = barLineWidth + intervalBetweenBarLines + barLineWidth
    const stavesPieceWithCoordinates = drawStavesPiece(maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, stavePieceWidth, numberOfStaves)(styles, leftOffset, topOffsetOfFirstStaveLine)
    const firstLineWithCoordinates = createPolyline(
      [
        stavesPieceWithCoordinates.right - intervalBetweenBarLines - barLineWidth, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.right - intervalBetweenBarLines - barLineWidth - barLineWidth, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.right - intervalBetweenBarLines - barLineWidth - barLineWidth, stavesPieceWithCoordinates.bottom,
        stavesPieceWithCoordinates.right - intervalBetweenBarLines - barLineWidth, stavesPieceWithCoordinates.bottom
      ],
      null, fontColor, 0, 0
    )
    const secondLineWithCoordinates = createPolyline(
      [
        stavesPieceWithCoordinates.right, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.right - barLineWidth, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.right - barLineWidth, stavesPieceWithCoordinates.bottom,
        stavesPieceWithCoordinates.right, stavesPieceWithCoordinates.bottom
      ],
      null, fontColor, 0, 0
    )
    return createElementWithAdditionalInformation(
      createGroup(
        'doubleBarLine',
        [
          stavesPieceWithCoordinates,
          firstLineWithCoordinates,
          secondLineWithCoordinates
        ]
      ),
      {
        xCenter: (firstLineWithCoordinates.left + secondLineWithCoordinates.right) / 2
      }
    )
  }
}
