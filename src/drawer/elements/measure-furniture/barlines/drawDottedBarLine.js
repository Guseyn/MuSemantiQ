'use strict'

import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (numberOfStaves, maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, noSpaceNeeded = false) {
  return (styles, leftOffset, topOffsetOfFirstStaveLine) => {
    const { fontColor, stavePieceWidthForDottedBarLine, intervalBetweenDotsInDottedBarLine, dotLengthInDottedBarLine, dottedBarLineWidth } = styles
    const stavePieceWidth = (noSpaceNeeded ? 0 : stavePieceWidthForDottedBarLine) + dottedBarLineWidth
    const stavesPieceWithCoordinates = drawStavesPiece(maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, stavePieceWidth, numberOfStaves)(styles, leftOffset, topOffsetOfFirstStaveLine)
    let topOffsetDistance = topOffsetOfFirstStaveLine
    let isFirstDot = true
    const dotLinesWithCoordinates = []
    while (topOffsetDistance + intervalBetweenDotsInDottedBarLine + dotLengthInDottedBarLine <= stavesPieceWithCoordinates.bottom) {
      dotLinesWithCoordinates.push(
        createPolyline(
          [
            stavesPieceWithCoordinates.right, (isFirstDot ? topOffsetDistance : topOffsetDistance + intervalBetweenDotsInDottedBarLine),
            stavesPieceWithCoordinates.right - dottedBarLineWidth, (isFirstDot ? topOffsetDistance : topOffsetDistance + intervalBetweenDotsInDottedBarLine),
            stavesPieceWithCoordinates.right - dottedBarLineWidth, (isFirstDot ? topOffsetDistance + dotLengthInDottedBarLine : topOffsetDistance + intervalBetweenDotsInDottedBarLine + dotLengthInDottedBarLine),
            stavesPieceWithCoordinates.right, (isFirstDot ? topOffsetDistance + dotLengthInDottedBarLine : topOffsetDistance + intervalBetweenDotsInDottedBarLine + dotLengthInDottedBarLine)
          ],
          null, fontColor, 0, 0
        )
      )
      topOffsetDistance = isFirstDot ? topOffsetDistance + dotLengthInDottedBarLine : topOffsetDistance + intervalBetweenDotsInDottedBarLine + dotLengthInDottedBarLine
      isFirstDot = false
    }
    if (topOffsetDistance + intervalBetweenDotsInDottedBarLine < stavesPieceWithCoordinates.bottom) {
      dotLinesWithCoordinates.push(
        createPolyline(
          [
            stavesPieceWithCoordinates.right, topOffsetDistance + intervalBetweenDotsInDottedBarLine,
            stavesPieceWithCoordinates.right - dottedBarLineWidth, topOffsetDistance + intervalBetweenDotsInDottedBarLine,
            stavesPieceWithCoordinates.right - dottedBarLineWidth, stavesPieceWithCoordinates.bottom,
            stavesPieceWithCoordinates.right, stavesPieceWithCoordinates.bottom
          ],
          null, fontColor, 0, 0
        )
      )
    }
    return createElementWithAdditionalInformation(
      createGroup(
        'dottedBarLine',
        [
          stavesPieceWithCoordinates,
          ...dotLinesWithCoordinates
        ]
      ),
      {
        xCenter: (dotLinesWithCoordinates[0].left + dotLinesWithCoordinates[0].right) / 2
      }
    )
  }
}
