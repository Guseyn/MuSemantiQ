'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawClefShape from '#msq/drawer/elements/the-page/clefs/drawClefShape.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function () {
  return (styles, leftOffset, topOffset) => {
    const { stavePieceWidthForClef, topOffsetMarginForMezzoSopranoClef } = styles
    const numberOfStaveLines = 5
    const altoShapeWithCoordinates = drawClefShape('alto')(styles, 0, topOffset + topOffsetMarginForMezzoSopranoClef)
    const xCorrection = (leftOffset + leftOffset + stavePieceWidthForClef) / 2 - (altoShapeWithCoordinates.right + altoShapeWithCoordinates.left) / 2
    moveElement(altoShapeWithCoordinates, xCorrection)
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePieceWidthForClef)(styles, leftOffset, topOffset)
    return createGroup(
      'mezzoSopranoClef',
      [
        stavePieceWithCoordinates,
        altoShapeWithCoordinates
      ]
    )
  }
}
