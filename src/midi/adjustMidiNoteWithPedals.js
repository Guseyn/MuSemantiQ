'use strict'

import findAllConnectedTracks from '#msq/midi/findAllConnectedTracks.js'

const MIDI_CC_FACTOR = 127

export default function (repertoireNote, midiNote, tracksForEachInstrumentOnEachStaveInEachVoice, midiNoteShouldBeAdjustedWithPedalSustain, midiNoteShouldBeAdjustedWithPedalRelease) {
  if (repertoireNote.noteIndex !== 0) {
    return
  }
  if (!repertoireNote.pedalMark) {
    return
  }
  const allConnectedTracksWithNote = findAllConnectedTracks(repertoireNote, tracksForEachInstrumentOnEachStaveInEachVoice)

  for (let trackIndex = 0; trackIndex < allConnectedTracksWithNote.length; trackIndex++) {
    if (
      repertoireNote.pedalMark.start &&
      repertoireNote.pedalMark.textValue !== 'U.C.' &&
      repertoireNote.pedalMark.textValue !== 'T.C.' &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      !repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
    }
    if (
      repertoireNote.pedalMark.start &&
      repertoireNote.pedalMark.textValue !== 'U.C.' &&
      repertoireNote.pedalMark.textValue !== 'T.C.' &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
    }
    if (
      (repertoireNote.pedalMark.finish || repertoireNote.pedalMark.release) &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      !repertoireNote.pedalMark.start &&
      !repertoireNote.pedalMark.afterChord &&
      !repertoireNote.pedalMark.tillEndOfMeasure &&
      !repertoireNote.pedalMark.atTheEndOfTheMeasure
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
    }
    if (
      (repertoireNote.pedalMark.finish || repertoireNote.pedalMark.release) &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      !repertoireNote.pedalMark.start &&
      (
        repertoireNote.pedalMark.afterChord ||
        repertoireNote.pedalMark.tillEndOfMeasure ||
        repertoireNote.pedalMark.atTheEndOfTheMeasure
      )
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
    }
    if (
      (repertoireNote.pedalMark.variablePeak) &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      !repertoireNote.pedalMark.beforeChord &&
      !repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
    }
    if (
      (repertoireNote.pedalMark.variablePeak) &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration + midiNote.duration / 2
      })
    }
    if (
      (repertoireNote.pedalMark.variablePeak) &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      repertoireNote.pedalMark.beforeChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time - midiNote.duration / 2
      })
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 64,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'U.C.') &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      !repertoireNote.pedalMark.beforeChord &&
      !repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'U.C.') &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'U.C.') &&
      midiNoteShouldBeAdjustedWithPedalSustain &&
      repertoireNote.pedalMark.beforeChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 127 / MIDI_CC_FACTOR,
        time: midiNote.time - midiNote.duration / 2
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'T.C.') &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      !repertoireNote.pedalMark.beforeChord &&
      !repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'T.C.') &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      repertoireNote.pedalMark.afterChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time + midiNote.duration
      })
    }
    if (
      (repertoireNote.pedalMark.textValue === 'T.C.') &&
      midiNoteShouldBeAdjustedWithPedalRelease &&
      repertoireNote.pedalMark.beforeChord
    ) {
      allConnectedTracksWithNote[trackIndex].addCC({
        number: 67,
        value: 0 / MIDI_CC_FACTOR,
        time: midiNote.time - midiNote.duration / 2
      })
    }
  }
}
