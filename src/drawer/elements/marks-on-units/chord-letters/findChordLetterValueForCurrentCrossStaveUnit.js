'use strict'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit) {
  let chordLetterValue
  for (let singleUnitParamIndex = 0; singleUnitParamIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex]
    if (currentSingleUnitParams.relatedChordLetter) {
      chordLetterValue = currentSingleUnitParams.relatedChordLetter
      chordLetterValue.measureIndexInGeneral = currentSingleUnitParams.measureIndexInGeneral
      chordLetterValue.staveIndex = currentSingleUnitParams.staveIndex
      chordLetterValue.voiceIndex = currentSingleUnitParams.voiceIndex
      chordLetterValue.singleUnitIndex = currentSingleUnitParams.singleUnitIndex
      break
    }
  }
  return chordLetterValue
}
