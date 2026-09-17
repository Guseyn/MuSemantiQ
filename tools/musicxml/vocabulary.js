'use strict'

/**
 * What each format calls the same thing.
 *
 * Both converters read from here, so a name is decided once and the two
 * directions cannot drift. Where the mapping is not one to one it is written as
 * one table read forwards and a derived table read backwards, rather than as two
 * tables that have to be kept in step by hand.
 *
 * Everything here is the part of MusicXML that a MuSemantiQ page can hold. The
 * rest — figured bass, percussion staves, exact layout offsets, parts beyond the
 * staves of one system — has nowhere to land, and the converters report it
 * instead of guessing.
 */

/**
 * Turn a forward table into the table read the other way.
 *
 * The first key wins where several map to the same value, so the aliases below
 * can be listed without deciding which one is canonical until it is written out.
 */
export function reversed(table) {
  const back = {}
  for (const [ key, value ] of Object.entries(table)) {
    if (!(value in back)) {
      back[value] = key
    }
  }
  return back
}

// --- clefs ------------------------------------------------------------------

/*
A MusicXML clef is a sign, the stave line it sits on, and how many octaves it
transposes. The three together name one of MuSemantiQ's clefs.
*/
export const CLEFS = [
  { clef: 'treble', sign: 'G', line: 2, octaveChange: 0 },
  { clef: 'bass', sign: 'F', line: 4, octaveChange: 0 },
  { clef: 'alto', sign: 'C', line: 3, octaveChange: 0 },
  { clef: 'tenor', sign: 'C', line: 4, octaveChange: 0 },
  { clef: 'soprano', sign: 'C', line: 1, octaveChange: 0 },
  { clef: 'mezzoSoprano', sign: 'C', line: 2, octaveChange: 0 },
  { clef: 'baritone', sign: 'C', line: 5, octaveChange: 0 },
  { clef: 'octaveEightUp', sign: 'G', line: 2, octaveChange: 1 },
  { clef: 'octaveEightDown', sign: 'G', line: 2, octaveChange: -1 },
  { clef: 'octaveFifteenUp', sign: 'G', line: 2, octaveChange: 2 },
  { clef: 'octaveFifteenDown', sign: 'G', line: 2, octaveChange: -2 }
]

export function clefNamed(sign, line, octaveChange) {
  const found = CLEFS.find((one) =>
    one.sign === sign && one.line === line && one.octaveChange === (octaveChange || 0)
  )
  if (found) {
    return found.clef
  }
  // A baritone clef is written either way round; F on the third line is the same
  // reading as C on the fifth.
  if (sign === 'F' && line === 3) {
    return 'baritone'
  }
  // An unplaced sign still has a usual home.
  return { G: 'treble', F: 'bass', C: 'alto' }[sign] || null
}

export const clefShape = (clef) => CLEFS.find((one) => one.clef === clef) || null

// --- key signatures ---------------------------------------------------------

/*
MusicXML counts a key signature in fifths, from seven flats to seven sharps.
MuSemantiQ names both the major and the relative minor.
*/
export const KEY_SIGNATURES_BY_FIFTHS = {
  '-7': 'c flat major|a flat minor',
  '-6': 'g flat major|e flat minor',
  '-5': 'd flat major|b flat minor',
  '-4': 'a flat major|f minor',
  '-3': 'e flat major|c minor',
  '-2': 'b flat major|g minor',
  '-1': 'f major|d minor',
  '0': 'c major|a minor',
  '1': 'g major|e minor',
  '2': 'd major|b minor',
  '3': 'a major|f sharp minor',
  '4': 'e major|c sharp minor',
  '5': 'b major|g sharp minor',
  '6': 'f sharp major|d sharp minor',
  '7': 'c sharp major|a sharp minor'
}

export const FIFTHS_BY_KEY_SIGNATURE = reversed(KEY_SIGNATURES_BY_FIFTHS)

// --- note values ------------------------------------------------------------

/*
A MuSemantiQ duration is the fraction of a whole note the unit lasts, which is
what MusicXML spells out in words.
*/
export const NOTE_TYPES_BY_DURATION = {
  4: 'long',
  2: 'breve',
  1: 'whole',
  0.5: 'half',
  0.25: 'quarter',
  0.125: 'eighth',
  0.0625: '16th',
  0.03125: '32nd',
  0.015625: '64th',
  0.0078125: '128th',
  0.00390625: '256th'
}

export const DURATIONS_BY_NOTE_TYPE = {
  ...reversed(NOTE_TYPES_BY_DURATION),
  // Names MusicXML allows that MuSemantiQ has no separate value for; they round
  // to the longest note it can draw.
  maxima: 4,
  '512th': 0.00390625,
  '1024th': 0.00390625
}

Object.keys(DURATIONS_BY_NOTE_TYPE).forEach((name) => {
  DURATIONS_BY_NOTE_TYPE[name] = Number(DURATIONS_BY_NOTE_TYPE[name])
})

/** The note value a fraction of a whole note is nearest to, never longer. */
export function durationFromFraction(fraction) {
  const values = Object.keys(NOTE_TYPES_BY_DURATION).map(Number).sort((a, b) => b - a)
  let closest = values[values.length - 1]
  let distance = Infinity
  for (const value of values) {
    const away = Math.abs(Math.log2(fraction / value))
    if (away < distance) {
      distance = away
      closest = value
    }
  }
  return closest
}

// --- accidentals ------------------------------------------------------------

/*
MusicXML says both what a note sounds (`alter`, in semitones) and what is drawn
(`accidental`). MuSemantiQ says only what is drawn, so the drawn name leads and
the alteration follows from it.
*/
export const ACCIDENTALS = [
  { keyType: 'doubleFlatKey', accidental: 'flat-flat', alter: -2 },
  { keyType: 'sesquiflatKey', accidental: 'three-quarters-flat', alter: -1.5 },
  { keyType: 'flatKey', accidental: 'flat', alter: -1 },
  { keyType: 'demiflatKey', accidental: 'quarter-flat', alter: -0.5 },
  { keyType: 'naturalKey', accidental: 'natural', alter: 0 },
  { keyType: 'demisharpKey', accidental: 'quarter-sharp', alter: 0.5 },
  { keyType: 'sharpKey', accidental: 'sharp', alter: 1 },
  { keyType: 'sesquisharpKey', accidental: 'three-quarters-sharp', alter: 1.5 },
  { keyType: 'doubleSharpKey', accidental: 'double-sharp', alter: 2 }
]

/** Other spellings MusicXML allows for the same drawn accidental. */
const ACCIDENTAL_ALIASES = {
  'sharp-sharp': 'doubleSharpKey',
  'natural-sharp': 'sharpKey',
  'natural-flat': 'flatKey',
  'flat-down': 'flatKey',
  'sharp-up': 'sharpKey'
}

export function keyTypeFromAccidental(accidental) {
  const found = ACCIDENTALS.find((one) => one.accidental === accidental)
  return found ? found.keyType : ACCIDENTAL_ALIASES[accidental] || null
}

export function keyTypeFromAlter(alter) {
  const found = ACCIDENTALS.find((one) => one.alter === alter)
  return found ? found.keyType : null
}

export const accidentalShape = (keyType) =>
  ACCIDENTALS.find((one) => one.keyType === keyType) || null

/** How far a step is moved by an accidental, for writing `alter` back out. */
export const alterOf = (keyType) => {
  const found = accidentalShape(keyType)
  return found ? found.alter : 0
}

// --- articulations, ornaments and techniques --------------------------------

/*
MuSemantiQ keeps all of these in one list on the unit. MusicXML files them under
three different parents, so each one remembers which parent it belongs to.
*/
export const MARKS = [
  { name: 'staccato', xml: 'staccato', under: 'articulations' },
  { name: 'spiccato', xml: 'staccatissimo', under: 'articulations' },
  { name: 'accent', xml: 'accent', under: 'articulations' },
  { name: 'tenuto', xml: 'tenuto', under: 'articulations' },
  { name: 'marcato', xml: 'strong-accent', under: 'articulations' },
  { name: 'upBow', xml: 'up-bow', under: 'technical' },
  { name: 'downBow', xml: 'down-bow', under: 'technical' },
  { name: 'naturalHarmonic', xml: 'harmonic', under: 'technical' },
  { name: 'snapPizzicato', xml: 'snap-pizzicato', under: 'technical' },
  { name: 'leftHandPizzicato', xml: 'stopped', under: 'technical' },
  { name: 'trill', xml: 'trill-mark', under: 'ornaments' },
  { name: 'turn', xml: 'turn', under: 'ornaments' },
  { name: 'mordent', xml: 'mordent', under: 'ornaments' },
  // A fermata is its own child of <notations>, beside the three groups.
  { name: 'fermata', xml: 'fermata', under: 'notations' }
]

export const markFromXml = (xml) => MARKS.find((one) => one.xml === xml) || null
export const markNamed = (name) => MARKS.find((one) => one.name === name) || null

/*
The ornaments MusicXML spells as their own element where MuSemantiQ writes a
plain ornament carrying a flag.
*/
export const ORNAMENT_VARIANTS = {
  'inverted-turn': { name: 'turn', inverted: true },
  'delayed-turn': { name: 'turn', followedAfter: true },
  'delayed-inverted-turn': { name: 'turn', inverted: true, followedAfter: true },
  'inverted-mordent': { name: 'mordent', inverted: true }
}

export function ornamentVariantFor(articulation) {
  if (articulation.name === 'turn' && articulation.inverted && articulation.followedAfter) {
    return 'delayed-inverted-turn'
  }
  if (articulation.name === 'turn' && articulation.inverted) {
    return 'inverted-turn'
  }
  if (articulation.name === 'turn' && articulation.followedAfter) {
    return 'delayed-turn'
  }
  if (articulation.name === 'mordent' && articulation.inverted) {
    return 'inverted-mordent'
  }
  return null
}

// --- bar lines --------------------------------------------------------------

export const BAR_STYLES_BY_NAME = {
  barLine: 'regular',
  doubleBarLine: 'light-light',
  boldDoubleBarLine: 'light-heavy',
  dottedBarLine: 'dotted'
}

export const BAR_NAMES_BY_STYLE = {
  ...reversed(BAR_STYLES_BY_NAME),
  dashed: 'dottedBarLine',
  heavy: 'boldDoubleBarLine',
  'heavy-light': 'boldDoubleBarLine',
  'heavy-heavy': 'boldDoubleBarLine'
}

export const OPENING_BAR_STYLES_BY_NAME = {
  startBarLine: 'regular',
  startBoldDoubleBarLine: 'heavy-light'
}

// --- directions -------------------------------------------------------------

/** The words MusicXML uses for a hairpin, and what MuSemantiQ calls them. */
export const WEDGE_TYPES = { crescendo: 'crescendo', diminuendo: 'diminuendo' }

/** MusicXML writes a glissando as a line and a slide as a wave, near enough. */
export const GLISSANDO_FORMS = { wave: 'slide', line: 'glissando' }
export const GLISSANDO_FORMS_BACK = reversed(GLISSANDO_FORMS)

/** Where a MuSemantiQ direction sits, as MusicXML places it. */
export const placementOf = (direction) => direction === 'down' ? 'below' : 'above'
export const directionOfPlacement = (placement) => placement === 'below' ? 'down' : 'up'
