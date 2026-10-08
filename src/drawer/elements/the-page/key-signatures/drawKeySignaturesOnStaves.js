'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import drawKeySignature from '#msq/drawer/elements/the-page/key-signatures/drawKeySignature.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (numberOfStaveLines, clefsNames, keySignatureName, keySignatureNameForEachLineId, measureIndexInGeneralOfRefId, staveIndexOfRefId, voiceIndexOfRefId, singleUnitIndexOfRefId) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaves, intervalBetweenStaveLines } = styles
    const keySignaturesOnStaves = []
    for (let staveIndex = 0; staveIndex < clefsNames.length; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const clefName = clefsNames[staveIndex]
      if (!clefName) {
        const tmpKeySignature = drawKeySignature(numberOfStaveLines, 'treble', keySignatureName)(styles, leftOffset, topOffsetForCurrentStave)
        const tmpKeySignatureWidth = tmpKeySignature.right - tmpKeySignature.left
        keySignaturesOnStaves.push(
          drawStavePiece(numberOfStaveLines, tmpKeySignatureWidth)(styles, leftOffset, topOffsetForCurrentStave)
        )
      } else {
        const keySignature = drawKeySignature(numberOfStaveLines, clefName, keySignatureName)(styles, leftOffset, topOffsetForCurrentStave)
        keySignaturesOnStaves.push(
          keySignature
        )
        if (measureIndexInGeneralOfRefId !== undefined) {
          addPropertiesToElement(
            keySignature,
            {
              'ref-ids': `key-signature-${measureIndexInGeneralOfRefId + 1}`
            }
          )
        }
        if (keySignatureNameForEachLineId !== undefined) {
          addPropertiesToElement(
            keySignature,
            {
              'ref-ids': `key-signature-for-each-line-${keySignatureNameForEachLineId}`
            }
          )
        }
        if (
          (measureIndexInGeneralOfRefId !== undefined) &&
          (staveIndexOfRefId !== undefined) &&
          (voiceIndexOfRefId !== undefined) &&
          (singleUnitIndexOfRefId !== undefined)
        ) {
          addPropertiesToElement(
            keySignature,
            {
              'ref-ids': `key-signature-before-${measureIndexInGeneralOfRefId + 1}-${staveIndexOfRefId + 1}-${voiceIndexOfRefId + 1}-${singleUnitIndexOfRefId + 1}`
            }
          )
        }
      }
    }
    return createGroup(
      'keySignaturesOnStaves',
      keySignaturesOnStaves
    )
  }
}
