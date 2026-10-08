'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawClefShape from '#msq/drawer/elements/the-page/clefs/drawClefShape.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function () {
  return (styles, leftOffset, topOffset) => {
    const { stavePieceWidthForClef, topOffsetMarginForSopranoClef } = styles
    const numberOfLines = 5
    const altoShapeWithCoordinates = drawClefShape('alto')(styles, 0, topOffset + topOffsetMarginForSopranoClef)
    const xCorrection = (leftOffset + leftOffset + stavePieceWidthForClef) / 2 - (altoShapeWithCoordinates.right + altoShapeWithCoordinates.left) / 2
    moveElement(altoShapeWithCoordinates, xCorrection)
    const stavePieceWithCoordinates = drawStavePiece(numberOfLines, stavePieceWidthForClef)(styles, leftOffset, topOffset)
    return createGroup(
      'sopranoClef',
      [
        stavePieceWithCoordinates,
        altoShapeWithCoordinates
      ]
    )
  }
}
