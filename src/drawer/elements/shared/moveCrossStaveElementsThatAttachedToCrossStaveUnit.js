'use strict'

import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import updateSingleUnitPartsCoordinates from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinates.js'

export default function (
  midMeasureClefsForCrossStaveUnit,
  midMeasureKeySignaturesForCrossStaveUnit,
  breathMarksBeforeCrossStaveUnit,
  onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnit,
  arpeggiatedWavesForCrossStaveUnit,
  keysForCrossStaveUnit,
  crossStaveUnit,
  xDistanceToMove = 0,
  yDistanceToMove = 0
) {
  moveElement(midMeasureClefsForCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(midMeasureKeySignaturesForCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(breathMarksBeforeCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(arpeggiatedWavesForCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(keysForCrossStaveUnit, xDistanceToMove, yDistanceToMove)
  moveElement(crossStaveUnit, xDistanceToMove, yDistanceToMove)
  const singleUnitsByStaveIndexes = crossStaveUnit.singleUnitsByStaveIndexes
  for (let staveIndex = 0; staveIndex < singleUnitsByStaveIndexes.length; staveIndex++) {
    for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsByStaveIndexes[staveIndex].length; singleUnitIndex++) {
      const currentSingleUnit = singleUnitsByStaveIndexes[staveIndex][singleUnitIndex]
      updateSingleUnitPartsCoordinates(currentSingleUnit, xDistanceToMove, yDistanceToMove)
    }
  }
}
