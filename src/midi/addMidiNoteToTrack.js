'use strict'

import adjustMidiNoteWithArticulations from '#msq/midi/adjustMidiNoteWithArticulations.js'
import adjustMidiNoteWithSlur from '#msq/midi/adjustMidiNoteWithSlur.js'
import adjustMidiNoteWithPedals from '#msq/midi/adjustMidiNoteWithPedals.js'
import adjustArpeggiatedNotes from '#msq/midi/adjustArpeggiatedNotes.js'
import fillTimeStampsMappedWithRefs from '#msq/midi/fillTimeStampsMappedWithRefs.js'

const addMidiNoteToTrackInCommonCase = (note, duration, time, slurMarksMappedWithTracks, tracksForEachInstrumentOnEachStaveInEachVoice, midNoteIsAtTheStartOfOrnament, midNoteIsAtTheEndOfOrnament, timeStampsMappedWithRefsOn, refsOnMappedWithTimeStamps) => {
  const midiNote = {
    pitch: note.midiPitch,
    octave: note.midiOctave,
    velocity: note.midiVelocity,
    duration,
    time
  }
  adjustMidiNoteWithArticulations(
    note,
    midiNote,
    note.track
  )
  adjustMidiNoteWithSlur(
    note,
    midiNote,
    note.track,
    slurMarksMappedWithTracks,
    midNoteIsAtTheStartOfOrnament,
    midNoteIsAtTheEndOfOrnament
  )
  adjustMidiNoteWithPedals(
    note,
    midiNote,
    tracksForEachInstrumentOnEachStaveInEachVoice,
    midNoteIsAtTheStartOfOrnament,
    midNoteIsAtTheEndOfOrnament
  )
  adjustArpeggiatedNotes(
    note,
    midiNote,
    note.track,
    midNoteIsAtTheStartOfOrnament,
    midNoteIsAtTheEndOfOrnament
  )
  note.track.addNote(midiNote)
  fillTimeStampsMappedWithRefs(
    note,
    time,
    time + note.durationInSeconds,
    timeStampsMappedWithRefsOn,
    refsOnMappedWithTimeStamps
  )
  if (note.notesInTieChain) {
    for (let noteIndex = 0; noteIndex < note.notesInTieChain.length; noteIndex++) {
      fillTimeStampsMappedWithRefs(
        note.notesInTieChain[noteIndex],
        time,
        time + note.durationInSeconds,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
  }
}

const MIDI_CC_FACTOR = 127

const TURN_DURATION_FACTOR_FOR_TRILL_NOTES = 2 / 3

export default function (note, noteWithTremoloWithNextOnEachStaveInEachVoice, slurMarksMappedWithTracks, tracksForEachInstrumentOnEachStaveInEachVoice, timeStampsMappedWithRefsOn, refsOnMappedWithTimeStamps) {
  const time = note.time + note.allTimeAdjustments
  note.timeWithAdjustments = time

  if (note.glissandoNotes) {
    note.glissandoNotes[0].timeWithAdjustments = note.glissandoNotes[0].time + note.glissandoNotes[0].allTimeAdjustments
    for (let glissandoNoteIndex = 0; glissandoNoteIndex < note.numberOfGlissandoNotes; glissandoNoteIndex++) {
      addMidiNoteToTrackInCommonCase(
        note.glissandoNotes[glissandoNoteIndex],
        note.durationOfEachGlissandoNoteInSeconds,
        note.glissandoNotes[0].timeWithAdjustments + glissandoNoteIndex * note.durationOfEachGlissandoNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    note.track.addCC({
      number: 64,
      value: 127 / MIDI_CC_FACTOR,
      time: note.glissandoNotes[0].timeWithAdjustments
    })
    note.track.addCC({
      number: 64,
      value: 0 / MIDI_CC_FACTOR,
      time: note.glissandoNotes[0].timeWithAdjustments + note.numberOfGlissandoNotes * note.durationOfEachGlissandoNoteInSeconds
    })
    return
  }

  const noteWithSingleTremolo = note.tremoloParams ? note.tremoloParams.type === 'single' : false
  const noteWithTremoloWithPrevious = note.tremoloParams ? note.tremoloParams.type === 'withPrevious' : false
  const noteWithTremoloWithNext = note.tremoloParams ? note.tremoloParams.type === 'withNext' : false
  if (noteWithSingleTremolo && note.numberOfTremoloNotes > 0) {
    const numberOfTremoloNotes = (note.unitIsTiedFromRightSide)
      ? note.numberOfTremoloNotes - 1
      : note.numberOfTremoloNotes
    const firstTremoloNoteIndex = note.firstTremoloNoteWasTiedAndItsBeenPlayed
      ? 1
      : 0
    for (let index = firstTremoloNoteIndex; index < numberOfTremoloNotes; index++) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTremoloNoteInSeconds,
        note.timeWithAdjustments + index * note.durationOfEachTremoloNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        index === firstTremoloNoteIndex,
        index === (numberOfTremoloNotes - 1),
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
  }
  if (noteWithTremoloWithNext && note.numberOfTremoloNotes > 0) {
    noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`] = note
  }
  if (noteWithTremoloWithPrevious && note.numberOfTremoloNotes > 0) {
    for (let index = 0; index < note.numberOfTremoloNotes; index++) {
      addMidiNoteToTrackInCommonCase(
        noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`],
        noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`].durationOfEachTremoloNoteInSeconds,
        noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`].timeWithAdjustments + (2 * index) * (noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`].durationOfEachTremoloNoteInSeconds),
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTremoloNoteInSeconds,
        noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`].timeWithAdjustments + (2 * index + 1) * (note.durationOfEachTremoloNoteInSeconds),
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    delete noteWithTremoloWithNextOnEachStaveInEachVoice[`${note.staveIndex}-${note.voiceIndex}`]
  }

  if (
    !note.tremoloParams &&
    note.isTrilled &&
    note.numberOfTrillNotes > 0 &&
    !note.shouldEndWithTurn &&
    !note.shouldEndWithJustTrillBottomAlternateNote
  ) {
    const numberOfTrillNotes = (note.unitIsTiedFromRightSide)
      ? note.numberOfTrillNotes - 1
      : note.numberOfTrillNotes
    const firstTrillNoteIndex = note.firstTrillNoteWasTiedAndItsBeenPlayed
      ? 1
      : 0
    for (let index = firstTrillNoteIndex; index < numberOfTrillNotes; index++) {
      if (index % 2 === 0 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
      if (index % 2 === 0 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
    }
  }
  if (
    !note.tremoloParams &&
    note.isTrilled &&
    note.numberOfTrillNotes > 0 &&
    note.shouldEndWithJustTrillBottomAlternateNote
  ) {
    const numberOfTrillNotes = (note.unitIsTiedFromRightSide)
      ? note.numberOfTrillNotes - 1
      : note.numberOfTrillNotes
    const firstTrillNoteIndex = note.firstTrillNoteWasTiedAndItsBeenPlayed
      ? 1
      : 0
    for (let index = firstTrillNoteIndex; index < numberOfTrillNotes; index++) {
      if (
        (index === numberOfTrillNotes - 1) &&
        !note.unitIsTiedFromRightSide
      ) {
        addMidiNoteToTrackInCommonCase(
          note.trillBottomAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (
        (index === numberOfTrillNotes - 1) &&
        note.unitIsTiedFromRightSide
      ) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 0 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
      if (index % 2 === 0 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
    }
  }
  if (
    !note.tremoloParams &&
    note.isTrilled &&
    note.numberOfTrillNotes > 0 &&
    note.shouldEndWithTurn
  ) {
    const numberOfTrillNotes = (note.unitIsTiedFromRightSide)
      ? note.numberOfTrillNotes - 1
      : note.numberOfTrillNotes
    const firstTrillNoteIndex = note.firstTrillNoteWasTiedAndItsBeenPlayed
      ? 1
      : 0
    for (let index = firstTrillNoteIndex; index < numberOfTrillNotes; index++) {
      if (
        (numberOfTrillNotes >= 4) &&
        (index === numberOfTrillNotes - 4)
      ) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          note.timeWithAdjustments + (numberOfTrillNotes - 4) * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (
        (numberOfTrillNotes >= 4) &&
        (index === numberOfTrillNotes - 3)
      ) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          note.timeWithAdjustments + (numberOfTrillNotes - 4) * note.durationOfEachTrillNoteInSeconds + note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (
        (numberOfTrillNotes >= 4) &&
        (index === numberOfTrillNotes - 2)
      ) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          note.timeWithAdjustments + (numberOfTrillNotes - 4) * note.durationOfEachTrillNoteInSeconds + 2 * note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (
        (numberOfTrillNotes >= 4) &&
        (index === numberOfTrillNotes - 1)
      ) {
        addMidiNoteToTrackInCommonCase(
          note.trillBottomAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + (numberOfTrillNotes - 4) * note.durationOfEachTrillNoteInSeconds + 3 * note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + (numberOfTrillNotes - 4) * note.durationOfEachTrillNoteInSeconds + 3 * note.durationOfEachTrillNoteInSeconds * TURN_DURATION_FACTOR_FOR_TRILL_NOTES + note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 0 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
      if (index % 2 === 0 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note.trillTopAlternateNote,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
        continue
      }
      if (index % 2 === 1 && !note.shouldStartWithTrillPrincipalNote) {
        addMidiNoteToTrackInCommonCase(
          note,
          note.durationOfEachTrillNoteInSeconds,
          note.timeWithAdjustments + index * note.durationOfEachTrillNoteInSeconds,
          slurMarksMappedWithTracks,
          tracksForEachInstrumentOnEachStaveInEachVoice,
          index === firstTrillNoteIndex,
          index === (numberOfTrillNotes - 1),
          timeStampsMappedWithRefsOn,
          refsOnMappedWithTimeStamps
        )
      }
    }
  }

  if (
    !note.tremoloParams &&
    !note.isTrilled &&
    note.isTurned
  ) {
    let initialTimeOffset = 0
    if (note.durationOfLongPrincipalNoteBeforeTurnNotes && !note.firstTurnNoteWasTiedAndItsBeenPlayed) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfLongPrincipalNoteBeforeTurnNotes,
        note.timeWithAdjustments,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      initialTimeOffset += note.durationOfLongPrincipalNoteBeforeTurnNotes
    }
    if (
      !note.isTurnedInverted &&
      (
        !note.firstTurnNoteWasTiedAndItsBeenPlayed ||
        (note.firstTurnNoteWasTiedAndItsBeenPlayed && note.durationOfLongPrincipalNoteBeforeTurnNotes)
      )
    ) {
      addMidiNoteToTrackInCommonCase(
        note.turnTopAlternateNote,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      initialTimeOffset += note.durationOfEachTurnNoteInSeconds
    }
    if (!note.isTurnedInverted) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      addMidiNoteToTrackInCommonCase(
        note.turnBottomAlternateNote,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 1 * note.durationOfEachTurnNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (!note.isTurnedInverted && !note.unitIsTiedFromRightSide) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 2 * note.durationOfEachTurnNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (
      note.isTurnedInverted &&
      (
        !note.firstTurnNoteWasTiedAndItsBeenPlayed ||
        (note.firstTurnNoteWasTiedAndItsBeenPlayed && note.durationOfLongPrincipalNoteBeforeTurnNotes)
      )
    ) {
      addMidiNoteToTrackInCommonCase(
        note.turnBottomAlternateNote,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      initialTimeOffset += note.durationOfEachTurnNoteInSeconds
    }
    if (note.isTurnedInverted) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      addMidiNoteToTrackInCommonCase(
        note.turnTopAlternateNote,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 1 * note.durationOfEachTurnNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (note.isTurnedInverted && !note.unitIsTiedFromRightSide) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachTurnNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 2 * note.durationOfEachTurnNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
  }

  if (
    !note.tremoloParams &&
    !note.isTrilled &&
    !note.isTurned &&
    note.isMordent
  ) {
    let initialTimeOffset = 0
    if (
      !note.isMordentInverted &&
      !note.firstMordentNoteWasTiedAndItsBeenPlayed
    ) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachShortMordentNoteInSeconds,
        note.timeWithAdjustments,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      initialTimeOffset += note.durationOfEachShortMordentNoteInSeconds
    }
    if (!note.isMordentInverted) {
      addMidiNoteToTrackInCommonCase(
        note.mordentTopAlternateNote,
        note.durationOfEachShortMordentNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (!note.isMordentInverted && !note.unitIsTiedFromRightSide) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfPrincipalNoteAfterShortMordentNotesInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 1 * note.durationOfEachShortMordentNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (
      note.isMordentInverted &&
      !note.firstMordentNoteWasTiedAndItsBeenPlayed
    ) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfEachShortMordentNoteInSeconds,
        note.timeWithAdjustments,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        true,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
      initialTimeOffset += note.durationOfEachShortMordentNoteInSeconds
    }
    if (note.isMordentInverted) {
      addMidiNoteToTrackInCommonCase(
        note.mordentBottomAlternateNote,
        note.durationOfEachShortMordentNoteInSeconds,
        note.timeWithAdjustments + initialTimeOffset,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        false,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
    if (note.isMordentInverted && !note.unitIsTiedFromRightSide) {
      addMidiNoteToTrackInCommonCase(
        note,
        note.durationOfPrincipalNoteAfterShortMordentNotesInSeconds,
        note.timeWithAdjustments + initialTimeOffset + 1 * note.durationOfEachShortMordentNoteInSeconds,
        slurMarksMappedWithTracks,
        tracksForEachInstrumentOnEachStaveInEachVoice,
        false,
        true,
        timeStampsMappedWithRefsOn,
        refsOnMappedWithTimeStamps
      )
    }
  }

  if (!note.isTremolo && !note.isTrilled && !note.isTurned && !note.isMordent) {
    addMidiNoteToTrackInCommonCase(
      note,
      note.durationInSeconds,
      note.timeWithAdjustments,
      slurMarksMappedWithTracks,
      tracksForEachInstrumentOnEachStaveInEachVoice,
      true,
      true,
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps
    )
  }
}
