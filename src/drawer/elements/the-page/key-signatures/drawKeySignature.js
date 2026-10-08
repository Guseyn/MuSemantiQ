'use strict'

import drawFlatKey from '#msq/drawer/elements/the-page/key-signatures/drawFlatKey.js'
import drawSharpKey from '#msq/drawer/elements/the-page/key-signatures/drawSharpKey.js'
import drawNaturalKey from '#msq/drawer/elements/the-page/key-signatures/drawNaturalKey.js'
import keySignaturesStructures from '#msq/drawer/elements/the-page/key-signatures/keySignaturesStructures.js'
import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfStaveLines, clefName, keySignatureName) {
  if (clefName === 'octaveEightUp' || clefName === 'octaveEightDown' || clefName === 'octaveFifteenUp' || clefName === 'octaveFifteenDown') {
    clefName = 'treble'
  }
  return (styles, leftOffset, topOffset) => {
    const { leftOffsetMarginForNonEmptyKeySignature, spaceWidthAfterKeySignature } = styles
    const metaForKeys = keySignaturesStructures[clefName] ? keySignaturesStructures[clefName][keySignatureName] : null
    const keysWithCoordinates = []
    let nextLeftOffset
    if (metaForKeys != null) {
      nextLeftOffset = leftOffset + (metaForKeys.length === 0 ? 0 : leftOffsetMarginForNonEmptyKeySignature)
      metaForKeys.forEach(metaForKey => {
        let keyWithCoordinates
        if (metaForKey.key === 'sharp') {
          keyWithCoordinates = drawSharpKey(numberOfStaveLines, metaForKey.positionNumber)(styles, nextLeftOffset, topOffset)
        } else if (metaForKey.key === 'flat') {
          keyWithCoordinates = drawFlatKey(numberOfStaveLines, metaForKey.positionNumber)(styles, nextLeftOffset, topOffset)
        } else if (metaForKey.key === 'natural') {
          keyWithCoordinates = drawNaturalKey(numberOfStaveLines, metaForKey.positionNumber)(styles, nextLeftOffset, topOffset)
        }
        keysWithCoordinates.push(keyWithCoordinates)
        nextLeftOffset = keyWithCoordinates.right
      })
    }
    if (keysWithCoordinates.length === 0) {
      return createGroup(
        'keySignature',
        [
          drawStavePiece(numberOfStaveLines, 0)(styles, leftOffset, topOffset)
        ]
      )
    }
    return createGroup(
      'keySignature',
      [
        drawStavePiece(numberOfStaveLines, leftOffsetMarginForNonEmptyKeySignature)(styles, leftOffset, topOffset),
        ...keysWithCoordinates,
        drawStavePiece(numberOfStaveLines, spaceWidthAfterKeySignature)(styles, nextLeftOffset, topOffset)
      ]
    )
  }
}
