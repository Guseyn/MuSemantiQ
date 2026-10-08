'use strict'

const MIDI_PITCHES_MAPPED_WITH_LOWER_GLISSANDO_NOTE = {
  'C': 'B',
  'C#': 'C',
  'D': 'C#',
  'D#': 'D',
  'E': 'D#',
  'F': 'E',
  'F#': 'F',
  'G': 'F#',
  'G#': 'G',
  'A': 'G#',
  'A#': 'A',
  'B': 'A#'
}

import NORMALIZED_PITCHES from '#msq/midi/normalizedPitches.js'
const NUMBER_OF_NORMALIZED_PITCHES = NORMALIZED_PITCHES.length

export default function (note) {
  const nextLowerGlissandoNote = Object.assign({}, note)  
  nextLowerGlissandoNote.noteName = MIDI_PITCHES_MAPPED_WITH_LOWER_GLISSANDO_NOTE[note.midiPitch].toLowerCase()
  
  const pitchAdjustmentForNextLowerGlissandoNote = -1

  const pitchFactorForNextLowerGlissandoNote = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    pitchAdjustmentForNextLowerGlissandoNote
  ) % NORMALIZED_PITCHES.length
  const absolutePitchFactorForNextLowerGlissandoNote = (pitchFactorForNextLowerGlissandoNote >= 0) ? pitchFactorForNextLowerGlissandoNote : (NORMALIZED_PITCHES.length - Math.abs(pitchFactorForNextLowerGlissandoNote))

  nextLowerGlissandoNote.midiPitch = NORMALIZED_PITCHES[
    absolutePitchFactorForNextLowerGlissandoNote
  ]

  const pitchOffset = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    pitchAdjustmentForNextLowerGlissandoNote
  ) / NUMBER_OF_NORMALIZED_PITCHES
  const octaveAdjustmentByPitchOffset = Math.floor(pitchOffset)

  nextLowerGlissandoNote.midiOctave += octaveAdjustmentByPitchOffset

  return nextLowerGlissandoNote
}
