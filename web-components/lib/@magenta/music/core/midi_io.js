/**
 * Conversion between MIDI files and `NoteSequence`s.
 *
 * Ported from magenta-js `music/src/core/midi_io.ts` (Apache-2.0),
 * https://github.com/magenta/magenta-js
 *
 * Changes: types stripped, the `compat/global` indirection dropped (`fetch` is
 * a browser global here), and `@tonejs/midi` resolved to this repo's existing
 * vanilla-JS port of it under `worker/midi/lib/@tonejs/`.
 */

import { Midi } from '#msq/lib/@tonejs/Midi.js'

import { NoteSequence } from '#msq/lib/@magenta/music/protobuf.js'

import * as constants from '#msq/lib/@magenta/music/core/constants.js'
import * as sequences from '#msq/lib/@magenta/music/core/sequences.js'

export class MidiConversionError extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Converts a MIDI file encoded as a byte array to a `NoteSequence`.
 *
 * @param midi An `ArrayBuffer` or `Uint8Array` containing the MIDI file.
 * @returns a new `NoteSequence`.
 */
export function midiToSequenceProto(midi) {
  const parsedMidi = new Midi(midi)
  const ns = NoteSequence.create()

  ns.ticksPerQuarter = parsedMidi.header.ppq
  ns.sourceInfo = NoteSequence.SourceInfo.create({
    parser: NoteSequence.SourceInfo.Parser.TONEJS_MIDI_CONVERT,
    encodingType: NoteSequence.SourceInfo.EncodingType.MIDI
  })

  for (const ts of parsedMidi.header.timeSignatures) {
    ns.timeSignatures.push(NoteSequence.TimeSignature.create({
      time: parsedMidi.header.ticksToSeconds(ts.ticks),
      numerator: ts.timeSignature[0],
      denominator: ts.timeSignature[1]
    }))
  }
  if (!ns.timeSignatures.length) {
    // Assume a default time signature of 4/4.
    ns.timeSignatures.push(NoteSequence.TimeSignature.create({
      time: 0,
      numerator: 4,
      denominator: 4
    }))
  }

  // TODO(fjord): Add key signatures.

  for (const tempo of parsedMidi.header.tempos) {
    ns.tempos.push(NoteSequence.Tempo.create({
      time: tempo.time,
      qpm: tempo.bpm
    }))
  }

  // We want a unique instrument number for each combination of track and
  // program number.
  let instrumentNumber = -1
  for (const track of parsedMidi.tracks) {
    // TODO(fjord): support changing programs within a track when
    // Tonejs/Midi does. When that happens, we'll need a map to keep track
    // of which program number within a track corresponds to what instrument
    // number, similar to how pretty_midi works.
    if (track.notes.length > 0) {
      instrumentNumber += 1
    }

    for (const note of track.notes) {
      const startTime = note.time
      const duration = note.duration
      const endTime = startTime + duration

      ns.notes.push(NoteSequence.Note.create({
        instrument: instrumentNumber,
        program: track.instrument.number,
        startTime,
        endTime,
        pitch: note.midi,
        velocity: Math.floor(note.velocity * constants.MIDI_VELOCITIES),
        isDrum: track.instrument.percussion
      }))

      if (endTime > ns.totalTime) {
        ns.totalTime = endTime
      }
    }

    const controlChangeValues = Object.values(track.controlChanges)
    const flattenedControlChangeValues = [].concat.apply([], controlChangeValues)
    for (const controlChange of flattenedControlChangeValues) {
      ns.controlChanges.push(NoteSequence.ControlChange.create({
        time: controlChange.time,
        controlNumber: controlChange.number,
        controlValue: Math.floor(controlChange.value * (constants.MIDI_VELOCITIES - 1)),
        instrument: instrumentNumber,
        program: track.instrument.number,
        isDrum: track.instrument.percussion
      }))
    }

    // TODO: Support pitch bends.
  }

  return ns
}

/**
 * Convert a `NoteSequence` to a MIDI file encoded as a byte array.
 *
 * If quantized, the `NoteSequence` is first unquantized.
 *
 * @param ns The `NoteSequence` to convert to MIDI.
 * @returns a `Uint8Array` containing the MIDI file.
 */
export function sequenceProtoToMidi(ns) {
  if (sequences.isQuantizedSequence(ns)) {
    ns = sequences.unquantizeSequence(ns)
  }

  const midi = new Midi()
  midi.fromJSON({
    header: {
      name: '',
      ppq: ns.ticksPerQuarter || constants.DEFAULT_TICKS_PER_QUARTER,
      tempos: [],
      timeSignatures: [],
      keySignatures: [],
      meta: []
    },
    tracks: []
  })

  // Add tempo changes. We need to add them in chronological order, so that we
  // can calculate their times correctly.
  const tempos = Array.from(ns.tempos || [])
  if (tempos.length === 0) {
    tempos.push({ time: 0, qpm: constants.DEFAULT_QUARTERS_PER_MINUTE })
  }
  tempos.sort((a, b) => a.time - b.time)
  for (const tempo of tempos) {
    midi.header.tempos.push({
      ticks: midi.header.secondsToTicks(tempo.time),
      bpm: tempo.qpm
    })
    midi.header.update()  // Update the tempo times for secondsToTicks to work.
  }

  // Add time signatures.
  if (!ns.timeSignatures || ns.timeSignatures.length === 0) {
    midi.header.timeSignatures.push({ ticks: 0, timeSignature: [4, 4] })
  } else {
    for (const ts of ns.timeSignatures) {
      midi.header.timeSignatures.push({
        ticks: midi.header.secondsToTicks(ts.time),
        timeSignature: [ts.numerator, ts.denominator]
      })
    }
  }
  midi.header.update()

  // TODO: Add key signatures.

  // Add tracks and control changes.
  const tracks = new Map()
  for (const note of ns.notes) {
    const instrument = note.instrument ? note.instrument : 0
    const program = (note.program === undefined) ? constants.DEFAULT_PROGRAM : note.program
    const isDrum = !!note.isDrum
    const key = JSON.stringify([instrument, program, isDrum])
    if (!tracks.has(key)) {
      tracks.set(key, { notes: [], controlChanges: [] })
    }
    tracks.get(key).notes.push(note)
  }
  for (const controlChange of ns.controlChanges) {
    const instrument = controlChange.instrument ? controlChange.instrument : 0
    const program = (controlChange.program === undefined)
      ? constants.DEFAULT_PROGRAM
      : controlChange.program
    const isDrum = !!controlChange.isDrum
    const key = JSON.stringify([instrument, program, isDrum])
    if (!tracks.has(key)) {
      tracks.set(key, { notes: [], controlChanges: [] })
    }
    tracks.get(key).controlChanges.push(controlChange)
  }

  tracks.forEach((trackData, key) => {
    const [program, isDrum] = JSON.parse(key).slice(1)
    const track = midi.addTrack()
    // Cycle through non-drum channels. This is what pretty_midi does and it
    // seems to matter for many MIDI sequencers.
    if (isDrum) {
      track.channel = constants.DRUM_CHANNEL
    } else {
      track.channel = constants.NON_DRUM_CHANNELS[
        (midi.tracks.length - 1) % constants.NON_DRUM_CHANNELS.length]
    }
    track.instrument.number = program
    for (const note of trackData.notes) {
      const velocity = (note.velocity === undefined)
        ? constants.DEFAULT_VELOCITY
        : note.velocity
      track.addNote({
        midi: note.pitch,
        time: note.startTime,
        duration: note.endTime - note.startTime,
        velocity: (velocity + 1) / constants.MIDI_VELOCITIES
      })
    }
    for (const controlChange of trackData.controlChanges) {
      track.addCC({
        number: controlChange.controlNumber,
        value: controlChange.controlValue,
        time: controlChange.time
      })
    }
  })

  // TODO: Support pitch bends.

  return midi.toArray()
}

/**
 * Fetches a MIDI file from a url and returns a Blob with its contents.
 *
 * @param url The url for the MIDI file.
 * @returns a Blob containing the MIDI.
 */
export function urlToBlob(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new MidiConversionError(
            `Could not load MIDI from ${url}: ${response.status} ${response.statusText}`)
        }
        return response.blob()
      })
      .then((blob) => {
        resolve(blob)
      })
      .catch((error) => reject(error))
  })
}

/**
 * Converts a Blob containing MIDI to a `NoteSequence`.
 *
 * @param blob The Blob containing MIDI
 * @returns a new `NoteSequence`
 */
export function blobToNoteSequence(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const ns = midiToSequenceProto(reader.result)
        resolve(ns)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (e) => reject(e)
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * Fetches a MIDI file from a url and converts it to a `NoteSequence`.
 *
 * @param url The URL for the MIDI file.
 * @returns a new `NoteSequence`
 */
export function urlToNoteSequence(url) {
  return urlToBlob(url).then(blobToNoteSequence)
}
