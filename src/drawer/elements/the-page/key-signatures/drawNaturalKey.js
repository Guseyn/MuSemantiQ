'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawNaturalKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawNaturalKeyShape.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfStaveLines, positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { stavePaddingForAccidentals } = styles
    const naturalKeyShapeWithCoordinates = drawNaturalKeyShape(positionNumber)(styles, leftOffset + stavePaddingForAccidentals, topOffset)
    const naturalKeyShapeWithCoordinatesWidth = naturalKeyShapeWithCoordinates.right - naturalKeyShapeWithCoordinates.left
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePaddingForAccidentals + naturalKeyShapeWithCoordinatesWidth + stavePaddingForAccidentals)(styles, leftOffset, topOffset)
    return createGroup(
      'naturalKey',
      [
        stavePieceWithCoordinates,
        naturalKeyShapeWithCoordinates
      ]
    )
  }
}
