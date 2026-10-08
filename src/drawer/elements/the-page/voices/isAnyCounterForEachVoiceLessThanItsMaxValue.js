'use strict'

export default function (countersForEachVoice, voicesParams) {
  for (let staveIndex = 0; staveIndex < voicesParams.length; staveIndex++) {
    for (let voiceIndex = 0; voiceIndex < voicesParams[staveIndex].length; voiceIndex++) {
      if (voicesParams[staveIndex][voiceIndex].length - countersForEachVoice[staveIndex][voiceIndex] > 0) {
        return true
      }
    }
  }
  return false
}
