'use strict'

export default function (note, globalCurrentGraceTimeOffset, graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames, graceTimeOffestForEachGraceUnitInVoiceOnEachStaveSplittedInTimeFrames, staveVoiceKey) {
  const adjustment = globalCurrentGraceTimeOffset
  if (note.isGrace) {
    return adjustment - graceTimeOffestForEachVoiceOnEachStaveSplittedInTimeFrames[note.time][staveVoiceKey] + graceTimeOffestForEachGraceUnitInVoiceOnEachStaveSplittedInTimeFrames[note.time][`${staveVoiceKey}-${note.graceCount}`]
  }
  return adjustment
}
