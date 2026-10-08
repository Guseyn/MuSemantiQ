'use strict'

import calculatePitchAdjustmentForNoteTimeFrame from '#msq/midi/calculatePitchAdjustmentForNoteTimeFrame.js'

const MIDI_PITCHES_MAPPED_WITH_ORNAMENT_TOP_ALTERNATE_PITCH_ADJUSTMENTS = {
  'C': 2,
  'C#': 1,
  'D': 2,
  'D#': 1,
  'E': 1,
  'F': 2,
  'F#': 1,
  'G': 2,
  'G#': 1,
  'A': 2,
  'A#': 1,
  'B': 1
}

const MIDI_PITCHES_MAPPED_WITH_ORNAMENT_TOP_ALTERNATE_PITCH = {
  'C': 'D',
  'C#': 'D',
  'D': 'E',
  'D#': 'E',
  'E': 'F',
  'F': 'G',
  'F#': 'G',
  'G': 'A',
  'G#': 'A',
  'A': 'B',
  'A#': 'B',
  'B': 'C'
}

import NORMALIZED_PITCHES from '#msq/midi/normalizedPitches.js'
const NUMBER_OF_NORMALIZED_PITCHES = NORMALIZED_PITCHES.length
import PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME from '#msq/midi/pitchAdjustmentsBySimpleKeyName.js'

export default function (note, ornamentOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey) {
  const ornamentTopAlternateNote = Object.assign({}, note)  
  ornamentTopAlternateNote.noteName = MIDI_PITCHES_MAPPED_WITH_ORNAMENT_TOP_ALTERNATE_PITCH[note.midiPitch].toLowerCase()
  
  const pitchAdjustmentForOrnamentTopAlternateNote = MIDI_PITCHES_MAPPED_WITH_ORNAMENT_TOP_ALTERNATE_PITCH_ADJUSTMENTS[note.midiPitch]
  const pitchAdjustmentByOrnamentKeyAbove = (PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME[ornamentOfNote.keyAbove] || 0)
  const pitchAdjustmentForOrnamentTopAlternateNoteTimeFrame = calculatePitchAdjustmentForNoteTimeFrame(ornamentTopAlternateNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
  const allPitchAdjustmentsForTopOrnamentAlternateNote = pitchAdjustmentForOrnamentTopAlternateNote + pitchAdjustmentByOrnamentKeyAbove + pitchAdjustmentForOrnamentTopAlternateNoteTimeFrame

  const pitchFactorForOrnamentTopAlternateNote = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    allPitchAdjustmentsForTopOrnamentAlternateNote
  ) % NORMALIZED_PITCHES.length
  const absolutePitchFactorForOrnamentTopAlternateNote = (pitchFactorForOrnamentTopAlternateNote >= 0) ? pitchFactorForOrnamentTopAlternateNote : (NORMALIZED_PITCHES.length - Math.abs(pitchFactorForOrnamentTopAlternateNote))

  ornamentTopAlternateNote.midiPitch = NORMALIZED_PITCHES[
    absolutePitchFactorForOrnamentTopAlternateNote
  ]

  const pitchOffset = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    allPitchAdjustmentsForTopOrnamentAlternateNote
  ) / NUMBER_OF_NORMALIZED_PITCHES
  const octaveAdjustmentByPitchOffset = Math.floor(pitchOffset)

  ornamentTopAlternateNote.midiOctave += octaveAdjustmentByPitchOffset

  return ornamentTopAlternateNote
}
