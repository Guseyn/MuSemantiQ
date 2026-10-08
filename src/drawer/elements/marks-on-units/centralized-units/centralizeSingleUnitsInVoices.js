'use strict'

import moveCrossStaveElementsThatAttachedToCrossStaveUnit from '#msq/drawer/elements/shared/moveCrossStaveElementsThatAttachedToCrossStaveUnit.js'
import updateSingleUnitPartsCoordinates from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinates.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveVoicesBodyHorizontally from '#msq/drawer/elements/shared/moveVoicesBodyHorizontally.js'

export default function (voices, stavesPiece, containsAtLeastOneVoiceWithMoreThanOneUnit) {
  const {
    voicesBody,
    singleUnitsInVoices,
    crossStaveUnits,
    keysForCrossStaveUnits,
    arpeggiatedWavesForCrossStaveUnits,
    onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits,
    breathMarksBeforeCrossStaveUnits,
    midMeasureClefsForCrossStaveUnits,
    midMeasureKeySignaturesForCrossStaveUnits,
    containsCollidedVoices,
    containsDrawnCrossStaveElementsBesideCrossStaveUnits,
    containsFullMeasureUnitsThatShouldBeCentralized
  } = voices
  const xCenterOfDrawnStavePiece = (stavesPiece.left + stavesPiece.right) / 2
  const xCenterOfVoices = (voices.left + voices.right) / 2
  const xCenterOfTheOnlyCrossStaveUnit = (crossStaveUnits[0].left + crossStaveUnits[0].right) / 2
  const voicesBodyWithOnlyOneCrossStaveUnit = !containsAtLeastOneVoiceWithMoreThanOneUnit
  if (
    (containsCollidedVoices || containsDrawnCrossStaveElementsBesideCrossStaveUnits) &&
      voicesBodyWithOnlyOneCrossStaveUnit &&
      containsFullMeasureUnitsThatShouldBeCentralized
  ) {
    const xDistanceToMove = xCenterOfDrawnStavePiece - xCenterOfTheOnlyCrossStaveUnit
    moveCrossStaveElementsThatAttachedToCrossStaveUnit(
      midMeasureClefsForCrossStaveUnits[0],
      midMeasureKeySignaturesForCrossStaveUnits[0],
      breathMarksBeforeCrossStaveUnits[0],
      onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits[0],
      arpeggiatedWavesForCrossStaveUnits[0],
      keysForCrossStaveUnits[0],
      crossStaveUnits[0],
      xDistanceToMove
    )
  } else {
    const singleUnitsToCentralize = []
    for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
      if (singleUnitsInVoices[staveIndex]) {
        for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
          if (singleUnitsInVoices[staveIndex][voiceIndex]) {
            const singleUnitPotentiallyToMove = singleUnitsInVoices[staveIndex][voiceIndex][0]
            if (
              containsCollidedVoices
              /*
                ||
                (
                  containsDrawnCrossStaveElementsBesideCrossStaveUnits &&
                  !singleUnitPotentiallyToMove.isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave
                )
              */
            ) {
              singleUnitPotentiallyToMove.isFullMeasureAndShouldBeCentralizedBecauseOfThat = false
              voices.containsFullMeasureUnitsThatShouldBeCentralized = false
            }
            if (singleUnitPotentiallyToMove.isFullMeasureAndShouldBeCentralizedBecauseOfThat) {
              singleUnitsToCentralize.push(
                singleUnitPotentiallyToMove
              )
            }
          }
        }
      }
    }
    if (singleUnitsToCentralize.length > 0) {
      const xDistanceToMove = xCenterOfDrawnStavePiece - xCenterOfVoices
      moveVoicesBodyHorizontally(voicesBody, singleUnitsInVoices, xDistanceToMove, false)
      for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsToCentralize.length; singleUnitIndex++) {
        const xCenterOfSingleUnit = (singleUnitsToCentralize[singleUnitIndex].left + singleUnitsToCentralize[singleUnitIndex].right) / 2
        const xDistanceToMove = xCenterOfDrawnStavePiece - xCenterOfSingleUnit
        moveElement(singleUnitsToCentralize[singleUnitIndex], xDistanceToMove)
        updateSingleUnitPartsCoordinates(singleUnitsToCentralize[singleUnitIndex], xDistanceToMove)
      }
    }
  }
}
