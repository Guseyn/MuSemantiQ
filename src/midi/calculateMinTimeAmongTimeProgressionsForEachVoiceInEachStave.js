'use strict'

const VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE = 0.000001
const MEASURE_FERAMATA_DURATION_IN_SECONDS = 2.5

export default function (
  timeProgressionsForEachVoiceInEachStave,
  timeOfTheLastSoundsThatStartPlayingInThisMeasure,
  measureEndsWithFermata,
  fermataDurationFromMidiSettings
) {
  let minTimeAmongTimeProgressionsForEachVoiceInEachStave = undefined
  for (let staveIndex = 0; staveIndex < timeProgressionsForEachVoiceInEachStave.length; staveIndex++) {
    for (let voiceIndex = 0; voiceIndex < timeProgressionsForEachVoiceInEachStave[staveIndex].length; voiceIndex++) {
      if (timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] < timeOfTheLastSoundsThatStartPlayingInThisMeasure) {
        timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] = undefined
        continue
      }
      if (measureEndsWithFermata) {
        timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] += fermataDurationFromMidiSettings !== undefined
          ? fermataDurationFromMidiSettings !== 0
            ? fermataDurationFromMidiSettings
            : VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE
          : MEASURE_FERAMATA_DURATION_IN_SECONDS
      } 
      if (!measureEndsWithFermata) {
        timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] += VERY_SMALL_TIME_TO_SEPARATE_MEASURES_IN_DIFFERENT_TIME_FRAMES_FOR_SURE
      }
      if (minTimeAmongTimeProgressionsForEachVoiceInEachStave === undefined || (timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex] < minTimeAmongTimeProgressionsForEachVoiceInEachStave)) {
        minTimeAmongTimeProgressionsForEachVoiceInEachStave = timeProgressionsForEachVoiceInEachStave[staveIndex][voiceIndex]
      }
    }
  }
  return minTimeAmongTimeProgressionsForEachVoiceInEachStave
}
