'use strict'

import calculatePitchAdjustmentForNoteTimeFrame from '#msq/midi/calculatePitchAdjustmentForNoteTimeFrame.js'

const MIDI_PITCHES_MAPPED_WITH_ORNAMENT_BOTTOM_ALTERNATE_PITCH_ADJUSTMENTS = {
  'C': -1,
  'C#': -2,
  'D': -2,
  'D#': -3,
  'E': -2,
  'F': -1,
  'F#': -2,
  'G': -2,
  'G#': -3,
  'A': -2,
  'A#': -3,
  'B': -2
}

const MIDI_PITCHES_MAPPED_WITH_ORNAMENT_BOTTOM_ALTERNATE_PITCH = {
  'C': 'B',
  'C#': 'B',
  'D': 'C',
  'D#': 'C',
  'E': 'D',
  'F': 'E',
  'F#': 'E',
  'G': 'F',
  'G#': 'F',
  'A': 'G',
  'A#': 'G',
  'B': 'A'
}

import NORMALIZED_PITCHES from '#msq/midi/normalizedPitches.js'
const NUMBER_OF_NORMALIZED_PITCHES = NORMALIZED_PITCHES.length
import PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME from '#msq/midi/pitchAdjustmentsBySimpleKeyName.js'

export default function (note, ornamentOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey) {
  const ornamentBottomAlternateNote = Object.assign({}, note)  
  ornamentBottomAlternateNote.noteName = MIDI_PITCHES_MAPPED_WITH_ORNAMENT_BOTTOM_ALTERNATE_PITCH[note.midiPitch].toLowerCase()
  
  const pitchAdjustmentForOrnamentBottomAlternateNote = MIDI_PITCHES_MAPPED_WITH_ORNAMENT_BOTTOM_ALTERNATE_PITCH_ADJUSTMENTS[note.midiPitch]
  const pitchAdjustmentByOrnamentKeyBelow = (PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME[ornamentOfNote.keyBelow] || 0)
  const pitchAdjustmentForOrnamentBottomAlternateNoteTimeFrame = calculatePitchAdjustmentForNoteTimeFrame(ornamentBottomAlternateNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
  const allPitchAdjustmentsForOrnamentBottomAlternateNote = pitchAdjustmentForOrnamentBottomAlternateNote + pitchAdjustmentByOrnamentKeyBelow + pitchAdjustmentForOrnamentBottomAlternateNoteTimeFrame

  const pitchFactorForOrnamentBottomAlternateNote = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    allPitchAdjustmentsForOrnamentBottomAlternateNote
  ) % NORMALIZED_PITCHES.length
  const absolutePitchFactorForOrnamentBottomAlternateNote = (pitchFactorForOrnamentBottomAlternateNote >= 0) ? pitchFactorForOrnamentBottomAlternateNote : (NORMALIZED_PITCHES.length - Math.abs(pitchFactorForOrnamentBottomAlternateNote))


  ornamentBottomAlternateNote.midiPitch = NORMALIZED_PITCHES[
    absolutePitchFactorForOrnamentBottomAlternateNote
  ]

  const pitchOffset = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    allPitchAdjustmentsForOrnamentBottomAlternateNote
  ) / NUMBER_OF_NORMALIZED_PITCHES
  const octaveAdjustmentByPitchOffset = Math.floor(pitchOffset)

  ornamentBottomAlternateNote.midiOctave += octaveAdjustmentByPitchOffset

  return ornamentBottomAlternateNote
}
