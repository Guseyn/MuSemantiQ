'use strict'

import sortByGraceCount from '#msq/midi/sortByGraceCount.js'
import sortByGraceCountAndMidMeasureClef from '#msq/midi/sortByGraceCountAndMidMeasureClef.js'

const DEFAULT_OCTAVE_NUMBER_BY_CLEFS = {
  'treble': 4,
  'bass': 2,
  'alto': 3,
  'baritone': 4,
  'mezzoSoprano': 3,
  'soprano': 4,
  'tenor': 3,
  'octaveEightUp': 5,
  'octaveEightDown': 3,
  'octaveFifteenUp': 6,
  'octaveFifteenDown': 2
}

const NUMBER_OF_NORMALIZED_PITCHES = 12

export default function (note, pitchForNote, clefAurasForEachStaveSplittedInTimeFrames, orderedTimeFramesFromClefAurasForEachStaveSplittedInTimeFrames, octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, orderedTimeFramesFromOctaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey) {
  let clefForNote = 'treble'

  let clefForNoteIsFound = false
  for (let timeIndex = orderedTimeFramesFromClefAurasForEachStaveSplittedInTimeFrames.length - 1; timeIndex >= 0; timeIndex--) {
    const clefTime = orderedTimeFramesFromClefAurasForEachStaveSplittedInTimeFrames[timeIndex]
    if (clefTime <= note.time) {
      let normalizedClefGraceCount
      let normalizedNoteGraceCount

      if (clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition]) {
        sortByGraceCountAndMidMeasureClef(clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition])
        for (let clefTimeIndex = 0; clefTimeIndex < clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition].length; clefTimeIndex++) {
          if (clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition][clefTimeIndex]) {

            if (note.isGrace && (clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition][clefTimeIndex].graceCount !== undefined)) {
              const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[clefTime][staveVoiceKey])
              normalizedClefGraceCount = normalizer + clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition][clefTimeIndex].graceCount
              normalizedNoteGraceCount = normalizer + note.graceCount
            }

            if (!clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition][clefTimeIndex].isMidMeasureClef || !note.isGrace || (note.isGrace && (((clefTime === note.time) && (normalizedClefGraceCount <= normalizedNoteGraceCount)) || (clefTime < note.time)))) {
              clefForNote = clefAurasForEachStaveSplittedInTimeFrames[clefTime][note.staveIndexConsideringStavePosition][clefTimeIndex].clef
              clefForNoteIsFound = true
              break
            }
          }
          if (clefForNoteIsFound) {
            break
          }
        }
      }
    }
    if (clefForNoteIsFound) {
      break
    }
  }

  let octaveSignAdjustmentIsFound = false
  let octaveSignAdjustmentForNote = 0
  const stavePositionVoiceKey = `${note.staveIndexConsideringStavePosition}-${note.voiceIndex}`
  for (let timeIndex = orderedTimeFramesFromOctaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames.length - 1; timeIndex >= 0; timeIndex--) {
    const octaveSignTime = orderedTimeFramesFromOctaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[timeIndex]
    if (octaveSignTime <= note.time) {
      let normalizedOctaveSignGraceCount
      let normalizedNoteGraceCount

      if (octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey]) {
        sortByGraceCount(octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey])
        for (let octaveSignTimeIndex = 0; octaveSignTimeIndex < octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey].length; octaveSignTimeIndex++) {
          if (octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey][octaveSignTimeIndex] !== undefined) {

            if (note.isGrace && (octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey][octaveSignTimeIndex].graceCount !== undefined)) {
              const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[octaveSignTime][staveVoiceKey])
              normalizedOctaveSignGraceCount = normalizer + octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey][octaveSignTimeIndex].graceCount
              normalizedNoteGraceCount = normalizer + note.graceCount
            }

            if (!note.isGrace || (note.isGrace && (((octaveSignTime === note.time) && (normalizedOctaveSignGraceCount <= normalizedNoteGraceCount)) || (octaveSignTime < note.time)))) {
              octaveSignAdjustmentForNote = octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey][octaveSignTimeIndex].octaveSignAdjustment
              if (octaveSignAdjustmentForNote === 0 && (octaveSignAuraForEachVoiceOnEachStaveSplittedInTimeFrames[octaveSignTime][stavePositionVoiceKey].length > 1)) {
                continue
              }
              octaveSignAdjustmentIsFound = true
              break
            }
          }
          if (octaveSignAdjustmentIsFound) {
            break
          }
        }
      }
    }
    if (octaveSignAdjustmentIsFound) {
      break
    }
  }

  const pitchOffset = pitchForNote / NUMBER_OF_NORMALIZED_PITCHES
  const octaveAdjustmentByPitchOffset = Math.floor(pitchOffset)

  return (note.octaveNumber * 1 || DEFAULT_OCTAVE_NUMBER_BY_CLEFS[clefForNote]) + octaveSignAdjustmentForNote + note.octaveSignAdjustment + octaveAdjustmentByPitchOffset
}
