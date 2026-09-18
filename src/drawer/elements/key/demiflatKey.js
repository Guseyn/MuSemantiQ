/* c8 ignore start -- unreachable today; see the note below */
'use strict'

/*
Not reached today, and kept anyway.

A key signature is drawn by keySignature.js, which imports flatKey, sharpKey and
naturalKey only — and keySignaturesStructures.js never emits anything else, so no
key signature the language can write contains a demiflat. The accidental on a
*note* takes a different road: keysForCurrentCrossStaveUnit.js imports
demiflatKeyShape.js directly, which is why the shape beside this file is fully
covered while this wrapper is not.

It completes the family — every accidental the drawer knows has both a shape and
a key form — and it is what a key signature built from such accidentals would
need on the day the language gains one. Until then it is marked so that it
neither counts against coverage nor disappears from the report.
*/
/* c8 ignore start */

import stavePiece from '#msq/drawer/elements/stave/stavePiece.js'
import demiflatKeyShape from '#msq/drawer/elements/key/demiflatKeyShape.js'
import group from '#msq/drawer/elements/basic/group.js'

export default function (numberOfStaveLines, positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { stavePaddingForAccidentals } = styles
    const demiflatKeyShapeWithCoordinates = demiflatKeyShape(positionNumber)(styles, leftOffset + stavePaddingForAccidentals, topOffset)
    const demiflatKeyShapeWithCoordinatesWidth = demiflatKeyShapeWithCoordinates.right - demiflatKeyShapeWithCoordinates.left
    const stavePieceWithCoordinates = stavePiece(numberOfStaveLines, stavePaddingForAccidentals + demiflatKeyShapeWithCoordinatesWidth + stavePaddingForAccidentals)(styles, leftOffset, topOffset)
    return group(
      'demiflatKey',
      [
        stavePieceWithCoordinates,
        demiflatKeyShapeWithCoordinates
      ]
    )
  }
}
/* c8 ignore stop */
