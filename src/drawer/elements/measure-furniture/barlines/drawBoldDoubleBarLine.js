'use strict'

import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (numberOfStaves, maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, noSpaceNeeded = false) {
  return (styles, leftOffset, topOffsetOfFirstStaveLine) => {
    const { fontColor, intervalBetweenBarLineAndBoldLine, boldBarLineWidth, barLineWidth } = styles
    const stavePieceWidth = barLineWidth + intervalBetweenBarLineAndBoldLine + boldBarLineWidth
    const staveLinesPiecesWithCoordinates = drawStavesPiece(maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, stavePieceWidth, numberOfStaves)(styles, leftOffset, topOffsetOfFirstStaveLine)
    const firstLineWithCoordinates = createPolyline(
      [
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth - intervalBetweenBarLineAndBoldLine, staveLinesPiecesWithCoordinates.top,
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth - intervalBetweenBarLineAndBoldLine - barLineWidth, staveLinesPiecesWithCoordinates.top,
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth - intervalBetweenBarLineAndBoldLine - barLineWidth, staveLinesPiecesWithCoordinates.bottom,
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth - intervalBetweenBarLineAndBoldLine, staveLinesPiecesWithCoordinates.bottom
      ],
      null,
      fontColor, 0, 0
    )
    const secondLineWithCoordinates = createPolyline(
      [
        staveLinesPiecesWithCoordinates.right, staveLinesPiecesWithCoordinates.top,
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth, staveLinesPiecesWithCoordinates.top,
        staveLinesPiecesWithCoordinates.right - boldBarLineWidth, staveLinesPiecesWithCoordinates.bottom,
        staveLinesPiecesWithCoordinates.right, staveLinesPiecesWithCoordinates.bottom
      ],
      null, fontColor, 0, 0
    )
    return createElementWithAdditionalInformation(
      createGroup(
        'boldDoubleBarLine',
        [
          staveLinesPiecesWithCoordinates,
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
