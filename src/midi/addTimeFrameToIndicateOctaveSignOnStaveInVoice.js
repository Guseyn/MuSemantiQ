'use strict'

import calculateOctaveAdjustmentForUnitParamsByOctaveSignMark from '#msq/midi/calculateOctaveAdjustmentForUnitParamsByOctaveSignMark.js'

export default function (octaveSignMark, octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, indicatorsOfOctaveSignEndingsByStaveAndVoice, unitIsGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, time, staveIndexesOccupiedByUnit, voiceIndex, staveVoiceKey) {
  if (octaveSignMark && !octaveSignMark.finish) {
    const octaveSignAdjustment = calculateOctaveAdjustmentForUnitParamsByOctaveSignMark(octaveSignMark)
    if (octaveSignAdjustment !== 0) {
      staveIndexesOccupiedByUnit.forEach(staveIndex => {
        const occupiedStaveVoiceKey = `${staveIndex}-${voiceIndex}`
        octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
        octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] = octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] || []
        octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey].push({
          octaveSignAdjustment,
          graceCount: unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] : undefined
        })
      })
    }
    if (indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey]) {
      delete indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey]
    }
  } else {
    if (indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey]) {
      octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
      indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey].forEach(occupiedStaveVoiceKey => {
        octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] = octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] || []
        octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey].push({
          octaveSignAdjustment: 0,
          graceCount: unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][occupiedStaveVoiceKey] : undefined
        })
      })
      delete indicatorsOfOctaveSignEndingsByStaveAndVoice[staveVoiceKey]
    }
  }
}
