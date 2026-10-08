'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawClefShape from '#msq/drawer/elements/the-page/clefs/drawClefShape.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (trebleStyleKey) {
  return (styles, leftOffset, topOffset) => {
    const { stavePieceWidthForClef } = styles
    const numberOfStaveLines = 5
    const trebleShapeWithCoordinates = drawClefShape(trebleStyleKey)(styles, 0, topOffset)
    moveElementInTheCenterBetweenPoints(trebleShapeWithCoordinates, leftOffset, leftOffset + stavePieceWidthForClef)
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePieceWidthForClef)(styles, leftOffset, topOffset)
    return createGroup(
      'trebleClef',
      [
        stavePieceWithCoordinates,
        trebleShapeWithCoordinates
      ]
    )
  }
}
