'use strict'

import sortByGraceCount from '#msq/midi/sortByGraceCount.js'

const PITCHES_BY_NOTE_NAMES = {
  'c': 0,
  'd': 2,
  'e': 4,
  'f': 5,
  'g': 7,
  'a': 9,
  'b': 11
}

export default function (note, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey) {
  let pitchAdjustmentForNote = 0

  let pitchAdjustmentByKeySignatureForNoteIsFound = false
  let pitchAdjustmentByKeySignatureBeforeForNoteIsFound = false
  let pitchAdjustmentsTimeByKeySignatureBeforeForNote
  let normalizedPitchAdjustmentGraceCountByKeySignatureBeforeForNote
  for (let timeIndex = orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames.length - 1; timeIndex >= 0; timeIndex--) {
    const pitchAdjustmentsTime = orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[timeIndex]
    if (pitchAdjustmentsTime <= note.time) {
      let normalizedPitchAdjustmentGraceCount
      let normalizedNoteGraceCount

      sortByGraceCount(pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime])
      for (let pitchAdjustmentsTimeIndex = 0; pitchAdjustmentsTimeIndex < pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime].length; pitchAdjustmentsTimeIndex++) {

        if (note.isGrace && (pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].graceCount !== undefined)) {
          const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[pitchAdjustmentsTime][staveVoiceKey])
          normalizedPitchAdjustmentGraceCount = normalizer + pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].graceCount
          normalizedNoteGraceCount = normalizer + note.graceCount
        }

        if (!note.isGrace || (note.isGrace && (((pitchAdjustmentsTime === note.time) && (normalizedPitchAdjustmentGraceCount <= normalizedNoteGraceCount)) || (pitchAdjustmentsTime < note.time)))) {
          for (let pitchAdjustmentIndex = 0; pitchAdjustmentIndex < pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].pitchAdjustments.length; pitchAdjustmentIndex++) {
            if (pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].pitchAdjustments[pitchAdjustmentIndex].pitch === PITCHES_BY_NOTE_NAMES[note.noteName]) {
              pitchAdjustmentForNote = pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].pitchAdjustments[pitchAdjustmentIndex].midiPitchAdjustment
              pitchAdjustmentByKeySignatureForNoteIsFound = true
              if (pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames[pitchAdjustmentsTime][pitchAdjustmentsTimeIndex].byKeySignatureBefore) {
                pitchAdjustmentByKeySignatureBeforeForNoteIsFound = true
                pitchAdjustmentsTimeByKeySignatureBeforeForNote = pitchAdjustmentsTime
                if (note.isGrace) {
                  normalizedPitchAdjustmentGraceCountByKeySignatureBeforeForNote = normalizedPitchAdjustmentGraceCount
                }
              }
              break
            }
          }
        }
        if (pitchAdjustmentByKeySignatureForNoteIsFound) {
          break
        }
      }
      // we need to consider only last key signature adjustments
      break
    }
  }

  let pitchAdjustmentByKeyIsFound = false
  for (let timeIndex = orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames.length - 1; timeIndex >= 0; timeIndex--) {
    const pitchAdjustmentsTime = orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[timeIndex]
    if ((pitchAdjustmentsTime <= note.time) && ((pitchAdjustmentByKeySignatureBeforeForNoteIsFound && (pitchAdjustmentsTime >= pitchAdjustmentsTimeByKeySignatureBeforeForNote)) || !pitchAdjustmentByKeySignatureBeforeForNoteIsFound)) {
      const measureStaveIndex = `${note.measureIndex}-${note.staveIndexConsideringStavePosition}`
      let normalizedPitchAdjustmentGraceCount
      let normalizedNoteGraceCount

      if (pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex]) {
        sortByGraceCount(pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex])
        for (let pitchAdjustmentsTimeIndex = 0; pitchAdjustmentsTimeIndex < pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex].length; pitchAdjustmentsTimeIndex++) {
          if (pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex]) {

            if (note.isGrace && (pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].graceCount !== undefined)) {
              const normalizer = (graceMaxCountForCurrentTime - graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[pitchAdjustmentsTime][staveVoiceKey])
              normalizedPitchAdjustmentGraceCount = normalizer + pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].graceCount
              normalizedNoteGraceCount = normalizer + note.graceCount
            }

            if (!note.isGrace || (note.isGrace && (((pitchAdjustmentsTime === note.time) && (normalizedPitchAdjustmentGraceCount <= normalizedNoteGraceCount) && ((pitchAdjustmentByKeySignatureBeforeForNoteIsFound && (normalizedPitchAdjustmentGraceCount >= normalizedPitchAdjustmentGraceCountByKeySignatureBeforeForNote)) || !pitchAdjustmentByKeySignatureBeforeForNoteIsFound)) || (pitchAdjustmentsTime < note.time)))) {
              for (let pitchAdjustmentIndex = 0; pitchAdjustmentIndex < pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].pitchAdjustments.length; pitchAdjustmentIndex++) {
                if (
                  (pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].pitchAdjustments[pitchAdjustmentIndex].pitch === PITCHES_BY_NOTE_NAMES[note.noteName]) &&
                  (pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].pitchAdjustments[pitchAdjustmentIndex].octaveNumber === note.octaveNumber)
                ) {
                  pitchAdjustmentForNote = pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames[pitchAdjustmentsTime][measureStaveIndex][pitchAdjustmentsTimeIndex].pitchAdjustments[pitchAdjustmentIndex].midiPitchAdjustment
                  pitchAdjustmentByKeyIsFound = true
                  break
                } 
              }
            }
          }
          if (pitchAdjustmentByKeyIsFound) {
            break
          }
        }
      }
    }
    if (pitchAdjustmentByKeyIsFound) {
      break
    }
  }

  return pitchAdjustmentForNote
}
