'use strict'

export default function (crossStaveUnitCount, isCurrentCrossStaveUnitGrace, measureIndexInGeneral, voicesParamsForAllStaves, durationsAccumulatorsForEachVoice, countersForEachVoice, minDurationAmongAccumulatorsForEachVoice, finishedVoices, numberOfUnfinishedVoices) {
  for (let staveIndex = 0; staveIndex < voicesParamsForAllStaves.length; staveIndex++) {
    for (let voiceIndex = 0; voiceIndex < voicesParamsForAllStaves[staveIndex].length; voiceIndex++) {
      const itIsAnyCaseExceptTheOneWhenWeGotGraceCrossStaveUnitSinceMinDurationAmongAccumulatorsForEachVoiceDoesNotConsiderWhetherCurrentCrossStaveUnitIsGraceWeCannotReleaseAnyDurationsFromAccumulatorsForEachVoice = !isNaN(minDurationAmongAccumulatorsForEachVoice) &&
        !isCurrentCrossStaveUnitGrace &&
        ((durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] - minDurationAmongAccumulatorsForEachVoice) >= 0)
      if (
        itIsAnyCaseExceptTheOneWhenWeGotGraceCrossStaveUnitSinceMinDurationAmongAccumulatorsForEachVoiceDoesNotConsiderWhetherCurrentCrossStaveUnitIsGraceWeCannotReleaseAnyDurationsFromAccumulatorsForEachVoice
      ) {
        durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] -= minDurationAmongAccumulatorsForEachVoice
        if (durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] < 1e-10) {
          durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] = 0
        }
      }
      if (!finishedVoices[`${staveIndex}-${voiceIndex}`]) {
        if (countersForEachVoice[staveIndex][voiceIndex] === voicesParamsForAllStaves[staveIndex][voiceIndex].length) {
          numberOfUnfinishedVoices.value -= 1
          finishedVoices[`${staveIndex}-${voiceIndex}`] = true
        }
      }
    }
  }
}
