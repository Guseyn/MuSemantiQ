'use strict'

/**
 * What a blob of ink can be — the class table, data not code.
 *
 * `kind` says who reads the symbol: lines are found by geometry and never
 * reach the model; blobs and glyphs are classified. `role` says what the
 * symbol does in music — the rules match roles, not class names, so a new
 * class joins its rules by sitting in this table. `msq` is what the symbol
 * becomes in MSQ. Adding a language element later means one row here, a
 * shape in the training drawer, and the one rule that reads its role.
 */

export const symbolClasses = [
  { id: 'notehead-filled', kind: 'blob', role: 'head', msq: 'duration, pitch' },
  { id: 'notehead-open', kind: 'blob', role: 'head', msq: 'duration, pitch' },
  { id: 'notehead-double-whole', kind: 'blob', role: 'head', msq: '4 duration, pitch' },
  { id: 'notehead-quadruple-whole', kind: 'blob', role: 'head', msq: '2 duration, pitch' },
  { id: 'ghost-head', kind: 'blob', role: 'head', msq: 'is ghost' },
  { id: 'dot', kind: 'blob', role: 'dot', msq: 'dotted' },
  { id: 'sharp', kind: 'blob', role: 'accidental', msq: 'sharp' },
  { id: 'flat', kind: 'blob', role: 'accidental', msq: 'flat' },
  { id: 'natural', kind: 'blob', role: 'accidental', msq: 'natural' },
  { id: 'double-sharp', kind: 'blob', role: 'accidental', msq: 'double sharp' },
  { id: 'double-flat', kind: 'blob', role: 'accidental', msq: 'double flat' },
  { id: 'demiflat', kind: 'blob', role: 'accidental', msq: 'demiflat' },
  { id: 'sesquiflat', kind: 'blob', role: 'accidental', msq: 'sesquiflat' },
  { id: 'demisharp', kind: 'blob', role: 'accidental', msq: 'demisharp' },
  { id: 'sesquisharp', kind: 'blob', role: 'accidental', msq: 'sesquisharp' },
  { id: 'clef-treble', kind: 'glyph', role: 'clef', msq: 'treble clef' },
  { id: 'clef-bass', kind: 'glyph', role: 'clef', msq: 'bass clef' },
  { id: 'clef-alto', kind: 'glyph', role: 'clef', msq: 'alto clef' },
  { id: 'clef-tenor', kind: 'glyph', role: 'clef', msq: 'tenor clef' },
  { id: 'clef-soprano', kind: 'glyph', role: 'clef', msq: 'soprano clef' },
  { id: 'clef-mezzo-soprano', kind: 'glyph', role: 'clef', msq: 'mezzo soprano clef' },
  { id: 'clef-baritone', kind: 'glyph', role: 'clef', msq: 'baritone clef' },
  { id: 'clef-octave-eight-up', kind: 'glyph', role: 'clef', msq: 'octave eight up clef' },
  { id: 'clef-octave-eight-down', kind: 'glyph', role: 'clef', msq: 'octave eight down clef' },
  { id: 'clef-octave-fifteen-up', kind: 'glyph', role: 'clef', msq: 'octave fifteen up clef' },
  { id: 'clef-octave-fifteen-down', kind: 'glyph', role: 'clef', msq: 'octave fifteen down clef' },
  { id: 'rest-quadruple-whole', kind: 'blob', role: 'rest', msq: '2 rest' },
  { id: 'rest-double-whole', kind: 'blob', role: 'rest', msq: '4 rest' },
  { id: 'rest-whole', kind: 'blob', role: 'rest', msq: '1 rest' },
  { id: 'rest-half', kind: 'blob', role: 'rest', msq: '1/2 rest' },
  { id: 'rest-quarter', kind: 'blob', role: 'rest', msq: '1/4 rest' },
  { id: 'rest-eighth', kind: 'blob', role: 'rest', msq: '1/8 rest' },
  { id: 'rest-sixteenth', kind: 'blob', role: 'rest', msq: '1/16 rest' },
  { id: 'rest-thirty-second', kind: 'blob', role: 'rest', msq: '1/32 rest' },
  { id: 'rest-sixty-fourth', kind: 'blob', role: 'rest', msq: '1/64 rest' },
  { id: 'rest-one-hundred-twenty-eighth', kind: 'blob', role: 'rest', msq: '1/128 rest' },
  { id: 'rest-two-hundred-fifty-sixth', kind: 'blob', role: 'rest', msq: '1/256 rest' },
  { id: 'digit-0', kind: 'glyph', role: 'digit', msq: '0' },
  { id: 'digit-1', kind: 'glyph', role: 'digit', msq: '1' },
  { id: 'digit-2', kind: 'glyph', role: 'digit', msq: '2' },
  { id: 'digit-3', kind: 'glyph', role: 'digit', msq: '3' },
  { id: 'digit-4', kind: 'glyph', role: 'digit', msq: '4' },
  { id: 'digit-5', kind: 'glyph', role: 'digit', msq: '5' },
  { id: 'digit-6', kind: 'glyph', role: 'digit', msq: '6' },
  { id: 'digit-7', kind: 'glyph', role: 'digit', msq: '7' },
  { id: 'digit-8', kind: 'glyph', role: 'digit', msq: '8' },
  { id: 'digit-9', kind: 'glyph', role: 'digit', msq: '9' },
  { id: 'fermata', kind: 'blob', role: 'mark', msq: 'fermata' },
  { id: 'breath-mark', kind: 'blob', role: 'mark', msq: 'breath mark' },
  { id: 'staccato', kind: 'blob', role: 'mark', msq: 'staccato' },
  { id: 'spiccato', kind: 'blob', role: 'mark', msq: 'spiccato' },
  { id: 'left-hand-pizzicato', kind: 'blob', role: 'mark', msq: 'left hand pizzicato' },
  { id: 'snap-pizzicato', kind: 'blob', role: 'mark', msq: 'snap pizzicato' },
  { id: 'natural-harmonic', kind: 'blob', role: 'mark', msq: 'natural harmonic' },
  { id: 'up-bow', kind: 'blob', role: 'mark', msq: 'up bow' },
  { id: 'down-bow', kind: 'blob', role: 'mark', msq: 'down bow' },
  { id: 'common-time', kind: 'glyph', role: 'meter', msq: 'time signature is c' },
  { id: 'cut-time', kind: 'glyph', role: 'meter', msq: 'time signature is crossed c' },
  { id: 'other', kind: 'blob', role: 'other', msq: 'unknown or nonmusic' },
  { id: 'accent', kind: 'blob', role: 'mark', msq: 'accent' },
  { id: 'tenuto', kind: 'blob', role: 'mark', msq: 'tenuto' },
  { id: 'marcato', kind: 'blob', role: 'mark', msq: 'marcato' },
  { id: 'grace-slash', kind: 'blob', role: 'mark', msq: 'grace with crush line' },
  { id: 'segno', kind: 'glyph', role: 'mark', msq: 'sign' },
  { id: 'coda', kind: 'glyph', role: 'mark', msq: 'coda' },
  { id: 'pedal', kind: 'glyph', role: 'mark', msq: 'pedal' },
  { id: 'turn', kind: 'blob', role: 'mark', msq: 'with turn' },
  { id: 'mordent', kind: 'blob', role: 'mark', msq: 'with mordent' },
  { id: 'trill', kind: 'blob', role: 'mark', msq: 'with trill' },
  { id: 'simile', kind: 'blob', role: 'mark', msq: 'simile' },
  { id: 'brace', kind: 'glyph', role: 'connection', msq: 'brace from stave N to stave M' },
  { id: 'bracket', kind: 'glyph', role: 'connection', msq: 'bracket from stave N to stave M' },
  { id: 'repeat-dot', kind: 'blob', role: 'mark', msq: 'repeat sign' },
  { id: 'notehead-whole', kind: 'blob', role: 'head', msq: '1 duration, pitch' },
  { id: 'flag-eighth-up', kind: 'glyph', role: 'flag', msq: '1/8 duration, stem up' },
  { id: 'flag-eighth-down', kind: 'glyph', role: 'flag', msq: '1/8 duration, stem down' },
  { id: 'flag-sixteenth-up', kind: 'glyph', role: 'flag', msq: '1/16 duration, stem up' },
  { id: 'flag-sixteenth-down', kind: 'glyph', role: 'flag', msq: '1/16 duration, stem down' },
  { id: 'flag-thirty-second-up', kind: 'glyph', role: 'flag', msq: '1/32 duration, stem up' },
  { id: 'flag-thirty-second-down', kind: 'glyph', role: 'flag', msq: '1/32 duration, stem down' },
  { id: 'flag-sixty-fourth-up', kind: 'glyph', role: 'flag', msq: '1/64 duration, stem up' },
  { id: 'flag-sixty-fourth-down', kind: 'glyph', role: 'flag', msq: '1/64 duration, stem down' },
  { id: 'flag-one-hundred-twenty-eighth-up', kind: 'glyph', role: 'flag', msq: '1/128 duration, stem up' },
  { id: 'flag-one-hundred-twenty-eighth-down', kind: 'glyph', role: 'flag', msq: '1/128 duration, stem down' },
  { id: 'flag-two-hundred-fifty-sixth-up', kind: 'glyph', role: 'flag', msq: '1/256 duration, stem up' },
  { id: 'flag-two-hundred-fifty-sixth-down', kind: 'glyph', role: 'flag', msq: '1/256 duration, stem down' },
  { id: 'parenthesis-open', kind: 'blob', role: 'parenthesis', msq: 'with parentheses' },
  { id: 'parenthesis-close', kind: 'blob', role: 'parenthesis', msq: 'with parentheses' },
  { id: 'breath-mark-double-slash', kind: 'blob', role: 'mark', msq: 'breath double slash' },
  { id: 'arpeggio', kind: 'glyph', role: 'arpeggio', msq: 'is arpeggiated' },
  { id: 'arpeggio-arrow-up', kind: 'glyph', role: 'arpeggio', msq: 'is arpeggiated with arrow up' },
  { id: 'arpeggio-arrow-down', kind: 'glyph', role: 'arpeggio', msq: 'is arpeggiated with arrow down' },
  { id: 'octave-sign-eight-up', kind: 'glyph', role: 'octave-sign', msq: 'octave up' },
  { id: 'octave-sign-eight-down', kind: 'glyph', role: 'octave-sign', msq: 'octave down' },
  { id: 'octave-sign-fifteen-up', kind: 'glyph', role: 'octave-sign', msq: 'two octaves up' },
  { id: 'octave-sign-fifteen-down', kind: 'glyph', role: 'octave-sign', msq: 'two octaves down' },
  { id: 'pedal-release', kind: 'glyph', role: 'mark', msq: 'release pedal' },
  { id: 'pedal-variable-peak', kind: 'blob', role: 'mark', msq: 'variable peak' },
  { id: 'rest-measure', kind: 'glyph', role: 'measure-rest', msq: 'measure rest / multi measure rest' },
  { id: 'turn-inverted', kind: 'blob', role: 'mark', msq: 'with turn inverted' },
  { id: 'mordent-inverted', kind: 'blob', role: 'mark', msq: 'with mordent inverted' },
  { id: 'fermata-down', kind: 'blob', role: 'mark', msq: 'fermata down' },
  { id: 'spiccato-down', kind: 'blob', role: 'mark', msq: 'spiccato down' },
  { id: 'snap-pizzicato-down', kind: 'blob', role: 'mark', msq: 'snap pizzicato down' },
  { id: 'marcato-down', kind: 'blob', role: 'mark', msq: 'marcato down' },
  { id: 'up-bow-down', kind: 'blob', role: 'mark', msq: 'up bow down' },
  { id: 'down-bow-down', kind: 'blob', role: 'mark', msq: 'down bow down' },
  { id: 'simile-two-measures', kind: 'glyph', role: 'mark', msq: 'simile of two previous measures' },

  // found by geometry, never classified — listed so the vocabulary is whole
  { id: 'staff-line', kind: 'line', role: 'line', msq: 'stave' },
  { id: 'stem', kind: 'line', role: 'line', msq: 'with stem up/down' },
  { id: 'beam', kind: 'line', role: 'line', msq: 'beamed' },
  { id: 'barline', kind: 'line', role: 'line', msq: 'measure' },
  { id: 'slur-or-tie', kind: 'line', role: 'line', msq: 'slur / tied with next' },
  { id: 'crescendo', kind: 'line', role: 'line', msq: 'crescendo' },
  { id: 'tremolo-stroke', kind: 'line', role: 'line', msq: 'with tremolo' },
  { id: 'ledger-line', kind: 'line', role: 'line', msq: 'pitch beyond the stave' },
  { id: 'tuplet-bracket', kind: 'line', role: 'line', msq: 'tuplet with brackets' },
  { id: 'octave-span', kind: 'line', role: 'line', msq: 'octave sign span' },
  { id: 'glissando-line', kind: 'line', role: 'line', msq: 'glissando as line' },
  { id: 'glissando-wave', kind: 'line', role: 'line', msq: 'glissando as wave' },
  { id: 'pedal-bracket', kind: 'line', role: 'line', msq: 'pedal with brackets' },
  { id: 'volta-bracket', kind: 'line', role: 'line', msq: 'volta bracket' },
  { id: 'trill-wave', kind: 'line', role: 'line', msq: 'trill with wave after' },
  { id: 'diminuendo', kind: 'line', role: 'line', msq: 'diminuendo' }
]

export const classifiedClassIds = symbolClasses
  .filter((symbolClass) => symbolClass.kind !== 'line')
  .map((symbolClass) => symbolClass.id)

export function classIndexOf (classId) {
  return classifiedClassIds.indexOf(classId)
}

// What a class does in music. Rules match roles, so a class added to the
// table above is a head (or a rest, a dot …) everywhere at once.
export function roleOf (classId) {
  const found = symbolClasses.find((symbolClass) => symbolClass.id === classId)
  return found ? found.role : 'mark'
}

export default symbolClasses
