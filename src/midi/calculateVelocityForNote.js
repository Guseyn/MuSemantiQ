'use strict'

import sortByGraceCount from '#msq/midi/sortByGraceCount.js'

const VELOCITY_FACTOR = 127
const DEFAULT_VELOCITY = 100 / VELOCITY_FACTOR

export default function (note, dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, orderedTimeFramesFromDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveIndex, staveVoiceKey) {
  if (note.isRest) {
    return 1 / 127
  }
  let velocity = DEFAULT_VELOCITY
  let dynamicIsFound = false
  for (let timeIndex = orderedTimeFramesFromDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames.length - 1; timeIndex >= 0; timeIndex--) {
    const dynamicTime = orderedTimeFramesFromDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[timeIndex]
    if (dynamicTime <= note.time) {
      let normalizedDynamicGraceCount
      let normalizedNoteGraceCount

      const staveIndexWithFirstVoiceIndexInDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFramesForCurrentDynamicTime = Object.keys(dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[dynamicTime]).filter(key => key.startsWith(`${staveIndex}-`)).find(key => dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[dynamicTime][key] !== undefined)
      const dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[dynamicTime][staveVoiceKey] ||
        dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[dynamicTime][staveIndexWithFirstVoiceIndexInDynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFramesForCurrentDynamicTime]

      if (dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice) {
        sortByGraceCount(dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice)
        for (let dynamicTimeIndex = 0; dynamicTimeIndex < dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice.length; dynamicTimeIndex++) {
          if (dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice[dynamicTimeIndex] !== undefined) {

            if (note.isGrace && (dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice[dynamicTimeIndex].graceCount !== undefined)) {
              const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[dynamicTime][staveVoiceKey])
              normalizedDynamicGraceCount = normalizer + dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice[dynamicTimeIndex].graceCount
              normalizedNoteGraceCount = normalizer + note.graceCount
            }

            if (!note.isGrace || (note.isGrace && (((dynamicTime === note.time) && (normalizedDynamicGraceCount <= normalizedNoteGraceCount)) || (dynamicTime < note.time)))) {
              velocity = dynamicAuraForCurrentDynamicTimeForCurrentStaveAndVoice[dynamicTimeIndex].velocity / VELOCITY_FACTOR
              dynamicIsFound = true
              break
            }
          }
          if (dynamicIsFound) {
            break
          }
        }
      }
    }
    if (dynamicIsFound) {
      break
    }
  }
  return velocity
}
