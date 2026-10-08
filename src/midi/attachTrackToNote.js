'use strict'

import findInstrumentForCurrentStaveInMidiFormat from '#msq/midi/findInstrumentForCurrentStaveInMidiFormat.js'
import instrumentTitleInMidiFormatByInstrumentOriginalName from '#msq/midi/instrumentTitleInMidiFormatByInstrumentOriginalName.js'
import isChannelOccupied from '#msq/midi/isChannelOccupied.js'
import doesNoteHaveSomeArticulations from '#msq/midi/doesNoteHaveSomeArticulations.js'

const PIZZICATO_ARTICULATIONS = [ 'leftHandPizzicato', 'snapPizzicato', 'naturalHarmonic' ]

const canInstrumentBeReassigned = (note) => {
  return !doesNoteHaveSomeArticulations(note, PIZZICATO_ARTICULATIONS) && !note.isGhost
}

export default function (midi, note, midiSettings, instrumentTitleParamsForCurrentMeasure, tracksForEachInstrumentOnEachStaveInEachVoice, instrumentsMappedWithChannels, currentInstrumentsForEachStaveOnEachVoice) {
  const staveVoiceKey = `${note.staveIndexConsideringStavePosition}-${note.voiceIndex}`
  const defaultInstrumentInMidiFormat = 0
  const instrumentMidiNumberByParams = findInstrumentForCurrentStaveInMidiFormat(instrumentTitleParamsForCurrentMeasure, note)
  const instrumentMidiNumber = instrumentMidiNumberByParams ?? currentInstrumentsForEachStaveOnEachVoice[staveVoiceKey] ?? instrumentTitleInMidiFormatByInstrumentOriginalName[midiSettings.defaultInstrument] ?? defaultInstrumentInMidiFormat
  const instrumentStaveVoiceKey = `${instrumentMidiNumber}-${note.staveIndexConsideringStavePosition}-${note.voiceIndex}`
  if (canInstrumentBeReassigned(note) && (currentInstrumentsForEachStaveOnEachVoice[staveVoiceKey] === undefined && instrumentMidiNumber !== undefined)) {
    currentInstrumentsForEachStaveOnEachVoice[staveVoiceKey] = instrumentMidiNumber
  }
  if (!tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey]) {
    tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey] = midi.addTrack()
    tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey].instrument.number = instrumentMidiNumber
    const trackInstrumentMidiNumber = tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey].instrument.number
    tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey].name = `track-${instrumentStaveVoiceKey}`
    const trackChannelNumber = instrumentsMappedWithChannels[trackInstrumentMidiNumber]
    if (trackChannelNumber !== undefined) {
      tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey].channel = trackChannelNumber 
    } else {
      for (let channelIndex = 0; channelIndex < 16; channelIndex++) {
        if ((channelIndex === 9) || (channelIndex === 10)) {
          continue
        }
        if (!isChannelOccupied(instrumentsMappedWithChannels, channelIndex)) {
          instrumentsMappedWithChannels[trackInstrumentMidiNumber] = channelIndex
          tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey].channel = channelIndex
          break
        }
      }
    }
    note.track = tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey]
  } else {
    note.track = tracksForEachInstrumentOnEachStaveInEachVoice[instrumentStaveVoiceKey]
  }
}
