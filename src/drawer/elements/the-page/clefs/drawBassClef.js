'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawClefShape from '#msq/drawer/elements/the-page/clefs/drawClefShape.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function () {
  return (styles, leftOffset, topOffset) => {
    const { stavePieceWidthForClef } = styles
    const numberOfStaveLines = 5
    const bassShapeWithCoordinates = drawClefShape('bass')(styles, 0, topOffset)
    const xCorrection = (leftOffset + leftOffset + stavePieceWidthForClef) / 2 - (bassShapeWithCoordinates.right + bassShapeWithCoordinates.left) / 2
    moveElement(bassShapeWithCoordinates, xCorrection)
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePieceWidthForClef)(styles, leftOffset, topOffset)
    return createGroup(
      'bassClef',
      [
        stavePieceWithCoordinates,
        bassShapeWithCoordinates
      ]
    )
  }
}
