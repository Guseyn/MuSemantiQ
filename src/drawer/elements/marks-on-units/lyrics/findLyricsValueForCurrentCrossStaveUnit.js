'use strict'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit) {
  let chordLyricsValue
  for (let singleUnitParamIndex = 0; singleUnitParamIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex]
    if (currentSingleUnitParams.relatedLyrics) {
      chordLyricsValue = currentSingleUnitParams.relatedLyrics
      chordLyricsValue.forEach((lyrics, lyricsIndex) => {
        lyrics.measureIndexInGeneral = currentSingleUnitParams.measureIndexInGeneral
        lyrics.staveIndex = currentSingleUnitParams.staveIndex
        lyrics.voiceIndex = currentSingleUnitParams.voiceIndex
        lyrics.singleUnitIndex = currentSingleUnitParams.singleUnitIndex
        lyrics.lyricsIndex = lyricsIndex
      })
      break
    }
  }
  return chordLyricsValue
}
