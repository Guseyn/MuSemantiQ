'use strict'

import calculatePitchAdjustmentForNoteTimeFrame from '#msq/midi/calculatePitchAdjustmentForNoteTimeFrame.js'

const MIDI_PITCHES_MAPPED_WITH_TOP_ALTERNATE_PITCH_ADJUSTMENTS = {
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

const MIDI_PITCHES_MAPPED_WITH_TOP_ALTERNATE_PITCH = {
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
import PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME from '#msq/midi/pitchAdjustmentsBySimpleKeyName.js'

export default function (note, trillOfNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey) {
  const trillTopAlternateNote = Object.assign({}, note)  
  trillTopAlternateNote.noteName = MIDI_PITCHES_MAPPED_WITH_TOP_ALTERNATE_PITCH[note.midiPitch].toLowerCase()
  
  const pitchAdjustmentForTopAlternateNote = MIDI_PITCHES_MAPPED_WITH_TOP_ALTERNATE_PITCH_ADJUSTMENTS[note.midiPitch]
  const pitchAdjustmentByTrillKeyAbove = (PITCH_ADJUSTEMENTS_BY_SIMPLE_KEY_NAME[trillOfNote.keyAbove] || 0)
  const pitchAdjustmentForTopAlternateNoteTimeFrame = calculatePitchAdjustmentForNoteTimeFrame(trillTopAlternateNote, pitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForAllStavesSplittedInTimeFrames, pitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, orderedTimeFramesFromPitchAdjustmentsAuraForEachStaveThatLastOneMeasureSplittedInTimeFrames, graceMaxCountForCurrentTime, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, staveVoiceKey)
  const allPitchAdjustmentsForTopTrillAlternateNote = pitchAdjustmentForTopAlternateNote + pitchAdjustmentByTrillKeyAbove + pitchAdjustmentForTopAlternateNoteTimeFrame

  const pitchFactorForTopAlternateNote = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    allPitchAdjustmentsForTopTrillAlternateNote
  ) % NORMALIZED_PITCHES.length
  const absolutePitchFactorForTopAlternateNote = (pitchFactorForTopAlternateNote >= 0) ? pitchFactorForTopAlternateNote : (NORMALIZED_PITCHES.length - Math.abs(pitchFactorForTopAlternateNote))

  trillTopAlternateNote.midiPitch = NORMALIZED_PITCHES[
    absolutePitchFactorForTopAlternateNote
  ]

  if (
    (note.midiPitch === 'B') &&
    (allPitchAdjustmentsForTopTrillAlternateNote > 0)
  ) {
    trillTopAlternateNote.midiOctave = note.midiOctave + 1
  }
  if (
    (note.midiPitch === 'C') &&
    (allPitchAdjustmentsForTopTrillAlternateNote < 0)
  ) {
    trillTopAlternateNote.midiOctave = note.midiOctave - 1
  }
  return trillTopAlternateNote
}
