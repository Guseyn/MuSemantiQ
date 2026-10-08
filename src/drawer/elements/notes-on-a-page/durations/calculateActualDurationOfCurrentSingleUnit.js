'use strict'

import calculateActualDurationConsideringDotsAndTremolos from '#msq/drawer/elements/notes-on-a-page/durations/calculateActualDurationConsideringDotsAndTremolos.js'
import calculateActualDurationConsideringDotsAndTupletsAndTremolos from '#msq/drawer/elements/notes-on-a-page/durations/calculateActualDurationConsideringDotsAndTupletsAndTremolos.js'

export default function (selectedSingleUnitParams, affectingTupletValuesByStaveAndVoiceIndexes, similesInformationByStaveAndVoiceIndexes, simileKey, staveIndex, voiceIndex) {
  if (selectedSingleUnitParams.isGrace) {
    if (selectedSingleUnitParams.simileCountDown === 1) {
      delete similesInformationByStaveAndVoiceIndexes[simileKey]
    }
    return 0
  }
  if (selectedSingleUnitParams.isSimile) {
    const duration = similesInformationByStaveAndVoiceIndexes[simileKey].duration
    if (selectedSingleUnitParams.simileCountDown === 1) {
      delete similesInformationByStaveAndVoiceIndexes[simileKey]
    }
    return duration
  }
  if (affectingTupletValuesByStaveAndVoiceIndexes && affectingTupletValuesByStaveAndVoiceIndexes[staveIndex] && affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex]) {
    const durationConsideringDotsAndTupletsAndTremolos = calculateActualDurationConsideringDotsAndTupletsAndTremolos(
      selectedSingleUnitParams.unitDuration,
      selectedSingleUnitParams.numberOfDots || 0,
      affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex],
      selectedSingleUnitParams.tremoloParams
        ? selectedSingleUnitParams.tremoloParams.tremoloDurationFactor
        : 1
    )
    if (isNaN(durationConsideringDotsAndTupletsAndTremolos)) {
      throw new Error(`durationConsideringDotsAndTupletsAndTremolos is ${durationConsideringDotsAndTupletsAndTremolos}`)
    }
    const tupletMarksInCurrentSingleUnit = selectedSingleUnitParams.tupletMarks
    if (tupletMarksInCurrentSingleUnit) {
      for (let tupletMarkIndex = 0; tupletMarkIndex < tupletMarksInCurrentSingleUnit.length; tupletMarkIndex++) {
        if (tupletMarksInCurrentSingleUnit[tupletMarkIndex].finish || selectedSingleUnitParams.isLastSingleUnitInVoiceOnPageLine) {
          if (affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex]) {
            affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex].pop()
            if (affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex].length === 0) {
              delete affectingTupletValuesByStaveAndVoiceIndexes[staveIndex][voiceIndex]
            }
          }
        }
      }
    }
    return durationConsideringDotsAndTupletsAndTremolos
  }
  const durationConsideringDotsAndTremolos = calculateActualDurationConsideringDotsAndTremolos(
    selectedSingleUnitParams.unitDuration,
    selectedSingleUnitParams.numberOfDots || 0,
    selectedSingleUnitParams.tremoloParams
      ? selectedSingleUnitParams.tremoloParams.tremoloDurationFactor
      : 1
  )
  return durationConsideringDotsAndTremolos
}
