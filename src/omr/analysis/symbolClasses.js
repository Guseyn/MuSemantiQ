'use strict'

/**
 * What a blob of ink can be — the class table, data not code.
 *
 * `kind` says who reads the symbol: lines are found by geometry and never
 * reach the model; blobs and glyphs are classified. `msq` is what the symbol
 * becomes in MSQ. Adding a language element later means adding a row here,
 * drawing it in the training set, and one rule in translation/ — no more.
 */

export const symbolClasses = [
  { id: 'notehead-filled', kind: 'blob', msq: 'duration, pitch' },
  { id: 'notehead-open', kind: 'blob', msq: 'duration, pitch' },
  { id: 'dot', kind: 'blob', msq: 'dotted' },
  { id: 'sharp', kind: 'blob', msq: 'sharp' },
  { id: 'flat', kind: 'blob', msq: 'flat' },
  { id: 'natural', kind: 'blob', msq: 'natural' },
  { id: 'double-sharp', kind: 'blob', msq: 'double sharp' },
  { id: 'double-flat', kind: 'blob', msq: 'double flat' },
  { id: 'clef-treble', kind: 'glyph', msq: 'treble clef' },
  { id: 'clef-bass', kind: 'glyph', msq: 'bass clef' },
  { id: 'clef-alto', kind: 'glyph', msq: 'alto clef' },
  { id: 'rest-whole', kind: 'blob', msq: '1 rest' },
  { id: 'rest-half', kind: 'blob', msq: '1/2 rest' },
  { id: 'rest-quarter', kind: 'blob', msq: '1/4 rest' },
  { id: 'rest-eighth', kind: 'blob', msq: '1/8 rest' },
  { id: 'digit-0', kind: 'glyph', msq: '0' },
  { id: 'digit-1', kind: 'glyph', msq: '1' },
  { id: 'digit-2', kind: 'glyph', msq: '2' },
  { id: 'digit-3', kind: 'glyph', msq: '3' },
  { id: 'digit-4', kind: 'glyph', msq: '4' },
  { id: 'digit-5', kind: 'glyph', msq: '5' },
  { id: 'digit-6', kind: 'glyph', msq: '6' },
  { id: 'digit-7', kind: 'glyph', msq: '7' },
  { id: 'digit-8', kind: 'glyph', msq: '8' },
  { id: 'digit-9', kind: 'glyph', msq: '9' },
  { id: 'fermata', kind: 'blob', msq: 'fermata' },
  { id: 'breath-mark', kind: 'blob', msq: 'breath mark' },
  { id: 'staccato', kind: 'blob', msq: 'staccato' },
  { id: 'accent', kind: 'blob', msq: 'accent' },
  { id: 'tenuto', kind: 'blob', msq: 'tenuto' },
  { id: 'marcato', kind: 'blob', msq: 'marcato' },
  { id: 'grace-slash', kind: 'blob', msq: 'grace with crush line' },
  { id: 'segno', kind: 'glyph', msq: 'sign' },
  { id: 'coda', kind: 'glyph', msq: 'coda' },
  { id: 'pedal', kind: 'glyph', msq: 'pedal' },
  { id: 'turn', kind: 'blob', msq: 'with turn' },
  { id: 'mordent', kind: 'blob', msq: 'with mordent' },
  { id: 'trill', kind: 'blob', msq: 'with trill' },
  { id: 'simile', kind: 'blob', msq: 'simile' },
  { id: 'brace', kind: 'glyph', msq: 'brace from stave N to stave M' },
  { id: 'bracket', kind: 'glyph', msq: 'bracket from stave N to stave M' },
  { id: 'repeat-dot', kind: 'blob', msq: 'repeat sign' },

  // found by geometry, never classified — listed so the vocabulary is whole
  { id: 'staff-line', kind: 'line', msq: 'stave' },
  { id: 'stem', kind: 'line', msq: 'with stem up/down' },
  { id: 'beam', kind: 'line', msq: 'beamed' },
  { id: 'barline', kind: 'line', msq: 'measure' },
  { id: 'slur-or-tie', kind: 'line', msq: 'slur / tied with next' },
  { id: 'crescendo', kind: 'line', msq: 'crescendo' },
  { id: 'tremolo-stroke', kind: 'line', msq: 'with tremolo' },
  { id: 'ledger-line', kind: 'line', msq: 'pitch beyond the stave' }
]

export const classifiedClassIds = symbolClasses
  .filter((symbolClass) => symbolClass.kind !== 'line')
  .map((symbolClass) => symbolClass.id)

export function classIndexOf (classId) {
  return classifiedClassIds.indexOf(classId)
}

export default symbolClasses
