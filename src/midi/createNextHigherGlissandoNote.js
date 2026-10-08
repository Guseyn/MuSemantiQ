'use strict'

const MIDI_PITCHES_MAPPED_WITH_HIGHER_GLISSANDO_NOTE = {
  'C': 'C#',
  'C#': 'D',
  'D': 'D#',
  'D#': 'E',
  'E': 'F',
  'F': 'F#',
  'F#': 'G',
  'G': 'G#',
  'G#': 'A',
  'A': 'A#',
  'A#': 'B',
  'B': 'C'
}

import NORMALIZED_PITCHES from '#msq/midi/normalizedPitches.js'
const NUMBER_OF_NORMALIZED_PITCHES = NORMALIZED_PITCHES.length

export default function (note) {
  const nextHigherGlissandoNote = Object.assign({}, note)  
  nextHigherGlissandoNote.noteName = MIDI_PITCHES_MAPPED_WITH_HIGHER_GLISSANDO_NOTE[note.midiPitch].toLowerCase()
  
  const pitchAdjustmentForNextHigherGlissandoNote = 1

  const pitchFactorForNextHigherGlissandoNote = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    pitchAdjustmentForNextHigherGlissandoNote
  ) % NORMALIZED_PITCHES.length
  const absolutePitchFactorForNextHigherGlissandoNote = (pitchFactorForNextHigherGlissandoNote >= 0) ? pitchFactorForNextHigherGlissandoNote : (NORMALIZED_PITCHES.length - Math.abs(pitchFactorForNextHigherGlissandoNote))

  nextHigherGlissandoNote.midiPitch = NORMALIZED_PITCHES[
    absolutePitchFactorForNextHigherGlissandoNote
  ]

  const pitchOffset = (
    NORMALIZED_PITCHES.indexOf(note.midiPitch) +
    pitchAdjustmentForNextHigherGlissandoNote
  ) / NUMBER_OF_NORMALIZED_PITCHES
  const octaveAdjustmentByPitchOffset = Math.floor(pitchOffset)

  nextHigherGlissandoNote.midiOctave += octaveAdjustmentByPitchOffset

  return nextHigherGlissandoNote
}
