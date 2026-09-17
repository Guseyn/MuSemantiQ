/**
 * A plain-JavaScript stand-in for magenta's protobufjs-generated `NoteSequence`.
 *
 * Upstream (`music/src/protobuf/proto.js`) is a ~300 KB machine-generated
 * protobufjs module plus the protobufjs runtime. The player path only ever uses
 * a tiny slice of that surface:
 *
 *   - `NoteSequence.create()` and the nested `Note` / `Tempo` / `TimeSignature`
 *     / `ControlChange` / `QuantizationInfo` / `KeySignature` / `SourceInfo`
 *     message constructors, all used as plain data holders.
 *   - `NoteSequence.encode()` / `.decode()`, used *only* to implement
 *     `sequences.clone()` as a serialize/deserialize round-trip.
 *
 * So this module provides `create()` for each message and implements `clone()`
 * with `structuredClone` instead (see `core/sequences.js`). No binary wire
 * format is implemented; `encode`/`decode` are intentionally absent.
 *
 * Difference from the generated code: protobuf drops fields whose value equals
 * the field default during a round-trip, whereas `structuredClone` preserves
 * them. That is immaterial for playback.
 *
 * Derived from magenta-js (Apache-2.0), https://github.com/magenta/magenta-js
 */

// Repeated fields default to `[]` so callers can `push` without a guard, the
// way protobufjs-generated messages behave.
const NOTE_SEQUENCE_REPEATED_FIELDS = [
  'notes',
  'tempos',
  'timeSignatures',
  'keySignatures',
  'controlChanges',
  'textAnnotations',
  'pitchBends',
  'sectionAnnotations'
]

function assign(target, props) {
  if (props) {
    Object.assign(target, props)
  }
  return target
}

/**
 * A single note. Times are in seconds unless the sequence is quantized, in
 * which case `quantizedStartStep` / `quantizedEndStep` are set instead.
 */
export class Note {
  static create(props) {
    return assign(new Note(), props)
  }
}

/** A tempo change, `qpm` (quarters per minute) taking effect at `time`. */
export class Tempo {
  static create(props) {
    return assign(new Tempo(), props)
  }
}

/** A time signature change taking effect at `time`. */
export class TimeSignature {
  static create(props) {
    return assign(new TimeSignature(), props)
  }
}

/** A key signature change taking effect at `time`. */
export class KeySignature {
  static create(props) {
    return assign(new KeySignature(), props)
  }
}

/** A MIDI control change event. */
export class ControlChange {
  static create(props) {
    return assign(new ControlChange(), props)
  }
}

/** A pitch bend event. */
export class PitchBend {
  static create(props) {
    return assign(new PitchBend(), props)
  }
}

/** A free-text annotation (chord symbol, lyric, ...) at `time`. */
export class TextAnnotation {
  static create(props) {
    return assign(new TextAnnotation(), props)
  }
}

/**
 * Quantization settings. `stepsPerQuarter` marks a sequence quantized relative
 * to tempo; `stepsPerSecond` marks one quantized by absolute time.
 */
export class QuantizationInfo {
  static create(props) {
    return assign(new QuantizationInfo(), props)
  }
}

/** Where a sequence came from and how it was encoded. */
export class SourceInfo {
  static create(props) {
    return assign(new SourceInfo(), props)
  }
}

// Only the members magenta's `midi_io.js` actually sets are enumerated; the
// numeric values match the upstream proto so serialized sequences stay
// comparable with magenta's own output.
SourceInfo.SourceType = Object.freeze({
  UNKNOWN_SOURCE_TYPE: 0,
  SCORE_BASED: 1,
  PERFORMANCE_BASED: 2
})

SourceInfo.EncodingType = Object.freeze({
  UNKNOWN_ENCODING_TYPE: 0,
  MUSIC_XML: 1,
  ABC: 2,
  MIDI: 3,
  MUSICNET: 4
})

SourceInfo.Parser = Object.freeze({
  UNKNOWN_PARSER: 0,
  MUSIC21: 1,
  PRETTY_MIDI: 2,
  MAGENTA_MUSIC_XML: 3,
  MAGENTA_MUSICNET: 5,
  MAGENTA_ABC: 6,
  TONEJS_MIDI_CONVERT: 7
})

/**
 * A sequence of notes with timing, tempo and time-signature information — the
 * unit every magenta player and converter operates on.
 */
export class NoteSequence {
  static create(props) {
    const ns = new NoteSequence()
    for (const field of NOTE_SEQUENCE_REPEATED_FIELDS) {
      ns[field] = []
    }
    ns.totalTime = 0
    return assign(ns, props)
  }
}

NoteSequence.Note = Note
NoteSequence.Tempo = Tempo
NoteSequence.TimeSignature = TimeSignature
NoteSequence.KeySignature = KeySignature
NoteSequence.ControlChange = ControlChange
NoteSequence.PitchBend = PitchBend
NoteSequence.TextAnnotation = TextAnnotation
NoteSequence.QuantizationInfo = QuantizationInfo
NoteSequence.SourceInfo = SourceInfo
