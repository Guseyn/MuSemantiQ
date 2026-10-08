/* c8 ignore start -- unreachable today; see the note below */
'use strict'

/*
Not reached today, and kept anyway.

A key signature is drawn by drawKeySignature.js, which imports drawFlatKey, drawSharpKey and
drawNaturalKey only — and keySignaturesStructures.js never emits anything else, so no
key signature the language can write contains a demisharp. The accidental on a
*note* takes a different road: drawKeysForCurrentCrossStaveUnit.js imports
drawDemisharpKeyShape.js directly, which is why the shape beside this file is fully
covered while this wrapper is not.

It completes the family — every accidental the drawer knows has both a shape and
a key form — and it is what a key signature built from such accidentals would
need on the day the language gains one. Until then it is marked so that it
neither counts against coverage nor disappears from the report.
*/
/* c8 ignore start */

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawDemisharpKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawDemisharpKeyShape.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfStaveLines, positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { stavePaddingForAccidentals } = styles
    const demisharpKeyShapeWithCoordinates = drawDemisharpKeyShape(positionNumber)(styles, leftOffset + stavePaddingForAccidentals, topOffset)
    const demisharpKeyShapeWithCoordinatesWidth = demisharpKeyShapeWithCoordinates.right - demisharpKeyShapeWithCoordinates.left
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePaddingForAccidentals + demisharpKeyShapeWithCoordinatesWidth + stavePaddingForAccidentals)(styles, leftOffset, topOffset)
    return createGroup(
      'sharpKey',
      [
        stavePieceWithCoordinates,
        demisharpKeyShapeWithCoordinates
      ]
    )
  }
}
/* c8 ignore stop */
