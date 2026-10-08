'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfStaves, numberOfStaveLines) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaves, intervalBetweenStaveLines, repeatDots, repeatDotsPadding, fontColor } = styles
    const allDrawnRepeatDotsOnAllStaves = []
    const xPositionOfDots = leftOffset + repeatDotsPadding
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const repeatDotsOnCurrentStave = createPath(
        repeatDots.points,
        null,
        fontColor,
        xPositionOfDots,
        topOffsetForCurrentStave + repeatDots.yCorrection
      )
      allDrawnRepeatDotsOnAllStaves.push(repeatDotsOnCurrentStave)
    }
    const groupedDrawnDots = createGroup(
      'repeatDots',
      allDrawnRepeatDotsOnAllStaves
    )
    const repeatDotsStaveWidth = groupedDrawnDots.right + repeatDotsPadding - leftOffset
    const stavesPieceWithCoordinates = drawStavesPiece(numberOfStaves, numberOfStaveLines, repeatDotsStaveWidth, numberOfStaves)(styles, leftOffset, topOffset)
    return createGroup(
      'repeatDotsWithStaveLines',
      [
        groupedDrawnDots,
        stavesPieceWithCoordinates
      ]
    )
  }
}
