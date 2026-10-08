'use strict'

import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (numberOfStaves, numberOfStaveLines) {
  return (styles, leftOffset, topOffsetOfFirstStaveLine) => {
    const { fontColor, barLineWidth } = styles
    const stavePieceWidth = barLineWidth
    const stavesPieceWithCoordinates = drawStavesPiece(numberOfStaves, numberOfStaveLines, stavePieceWidth, numberOfStaves)(styles, leftOffset, topOffsetOfFirstStaveLine)
    const lineWithCoordinates = createPolyline(
      [
        stavesPieceWithCoordinates.left, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.left + barLineWidth, stavesPieceWithCoordinates.top,
        stavesPieceWithCoordinates.left + barLineWidth, stavesPieceWithCoordinates.bottom,
        stavesPieceWithCoordinates.left, stavesPieceWithCoordinates.bottom
      ],
      null, fontColor, 0, 0
    )
    return createElementWithAdditionalInformation(
      createGroup(
        'startBarLine',
        [
          stavesPieceWithCoordinates,
          lineWithCoordinates
        ]
      ),
      {
        xCenter: (lineWithCoordinates.left + lineWithCoordinates.right) / 2
      }
    )
  }
}
