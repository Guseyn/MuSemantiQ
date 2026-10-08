'use strict'

export default function (durationsAccumulatorsForEachVoice) {
  let minDuration = NaN
  for (let staveIndex = 0; staveIndex < durationsAccumulatorsForEachVoice.length; staveIndex++) {
    for (let voiceIndex = 0; voiceIndex < durationsAccumulatorsForEachVoice[staveIndex].length; voiceIndex++) {
      const currentDuration = durationsAccumulatorsForEachVoice[staveIndex][voiceIndex]
      if ((isNaN(minDuration) || minDuration > currentDuration) && currentDuration !== 0) {
        minDuration = currentDuration
      }
    }
  }
  return minDuration
}
