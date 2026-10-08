'use strict'

import calculateNotePositionNumber from '#msq/drawer/elements/notes-on-a-page/octaves/calculateNotePositionNumber.js'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, clefNamesAuraByStaveIndexes) {
  for (let singleUnitParamsIndex = 0; singleUnitParamsIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamsIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamsIndex]
    for (let noteIndex = 0; noteIndex < currentSingleUnitParams.notes.length; noteIndex++) {
      const noteParams = currentSingleUnitParams.notes[noteIndex]
      noteParams.positionNumber = calculateNotePositionNumber(noteParams, clefNamesAuraByStaveIndexes)
    }
    for (let keyIndex = 0; keyIndex < currentSingleUnitParams.keysParams.length; keyIndex++) {
      const keyParams = currentSingleUnitParams.keysParams[keyIndex]
      keyParams.positionNumber = calculateNotePositionNumber(keyParams, clefNamesAuraByStaveIndexes)
    }
  }
}
