'use strict'

import instrumentTitleInMidiFormatByInstrumentOriginalName from '#msq/midi/instrumentTitleInMidiFormatByInstrumentOriginalName.js'
import doesNoteHaveSomeArticulations from '#msq/midi/doesNoteHaveSomeArticulations.js'

const PIZZICATO_STRINGS_MIDI_INSTRUMENT_NUMBER = 45
const GHOST_SOUND_INSTRUMENT_NUMBER = 113
const NATURAL_HARMONIC_MIDI_INSTRUMENT_NUMBER = 32
const PIZZICATO_ARTICULATIONS = [ 'leftHandPizzicato', 'snapPizzicato' ]

export default function (instrumentTitlesParams, note) {
  if (doesNoteHaveSomeArticulations(note, PIZZICATO_ARTICULATIONS)) {
    return PIZZICATO_STRINGS_MIDI_INSTRUMENT_NUMBER
  }
  if (note.isGhost) {
    return GHOST_SOUND_INSTRUMENT_NUMBER
  }
  if (doesNoteHaveSomeArticulations(note, 'naturalHarmonic')) {
    return NATURAL_HARMONIC_MIDI_INSTRUMENT_NUMBER
  }
  if (instrumentTitlesParams) {
    const staveIndex = note.staveIndexConsideringStavePosition
    for (let instrumentTitleIndex = 0; instrumentTitleIndex < instrumentTitlesParams.length; instrumentTitleIndex++) {
      const instrumentTitleParams = instrumentTitlesParams[instrumentTitleIndex]
      if (instrumentTitleParams.staveNumber === staveIndex) {
        return instrumentTitleInMidiFormatByInstrumentOriginalName[instrumentTitleParams.value.toLowerCase()] ||
          instrumentTitleInMidiFormatByInstrumentOriginalName[instrumentTitleParams.value.toLowerCase().split(' ')[0]]
      }
      if ((staveIndex >= instrumentTitleParams.staveStartNumber) && (staveIndex <= instrumentTitleParams.staveEndNumber)) {
        return instrumentTitleInMidiFormatByInstrumentOriginalName[instrumentTitleParams.value.toLowerCase()] ||
          instrumentTitleInMidiFormatByInstrumentOriginalName[instrumentTitleParams.value.toLowerCase().split(' ')[0]]
      }
    }
  }
}
