'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import drawTimeSignature from '#msq/drawer/elements/the-page/time-signatures/drawTimeSignature.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (numberOfStaves, numberOfStaveLines, numerator, denominator, cMode, isClefBefore, isKeySignatureBefore, isFirstMeasureOnPageLine, measureIndexInGeneral, timeSignatureForEachLineId) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaves, intervalBetweenStaveLines } = styles
    const timeSignaturesOnStaves = []
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const timeSignature = drawTimeSignature(numberOfStaveLines, numerator, denominator, cMode, isClefBefore, isKeySignatureBefore)(styles, leftOffset, topOffsetForCurrentStave)
      if (measureIndexInGeneral !== undefined) {
        addPropertiesToElement(
          timeSignature,
          {
            'ref-ids': `time-signature-${measureIndexInGeneral + 1}`
          }
        )
      }
      if (isFirstMeasureOnPageLine && timeSignatureForEachLineId !== undefined) {
        addPropertiesToElement(
          timeSignature,
          {
            'ref-ids': `time-signature-for-each-line-${timeSignatureForEachLineId}`
          }
        )
      }
      timeSignaturesOnStaves.push(timeSignature)
    }
    return createGroup(
      'timeSignaturesOnStaves',
      timeSignaturesOnStaves
    )
  }
}
