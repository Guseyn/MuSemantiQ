'use strict'

/**
 * A little piece of music for each glyph.
 *
 * The font viewer engraves one of these so a glyph is judged where it is
 * actually used — an accent above and below a note, a flag on a stem in both
 * directions, a clef on a stave — rather than as an outline on its own.
 *
 * Every snippet is written in the vocabulary the parser already accepts; the
 * forms come from the test corpus under visual-tests/bravura/msq/. None of them
 * names a music font: the viewer prepends `music font is <name>` so switching
 * font rewrites that one line and nothing else.
 */

/*
Where a note sits changes what a glyph has to do.

In treble clef the stave lines are e g b d5 f5 and the spaces between them are
f a c5 e5, and a notehead straddling a line is a different problem from one
sitting in a space — an accidental centres differently, a stem leaves from a
different edge, an articulation has half a step more or less to clear. So these
show a glyph on a line note and on a space note rather than on one of them, and
reach past the stave where ledger lines come into it.
*/
const LINE_NOTE = 'b'
const SPACE_NOTE = 'a'

const bothStemDirections = (articulation) => `measure
${articulation} up, with stem up
${articulation} up, with stem down
${articulation} down, with stem up
${articulation} down, with stem down`

const withArticulation = (name) => `${bothStemDirections(`${LINE_NOTE} with ${name}`)}

${bothStemDirections(`${SPACE_NOTE} with ${name}`)}`

const withOrnament = (name) => `measure
1/2 ${LINE_NOTE} with ${name}
1/2 ${SPACE_NOTE} with ${name}
measure
1/2 d5 with ${name}, with stem down
1/2 c5 with ${name}, with stem down`

const withOrnamentKey = (key) => `measure
1/2 ${LINE_NOTE} with turn with ${key} above
1/2 ${SPACE_NOTE} with turn with ${key} above
measure
1/2 d5 with mordent with ${key} below, with stem down
1/2 c5 with mordent with ${key} below, with stem down`

const withClef = (clef) => `measure
stave with ${clef}
e f g a
b c5 d5 e5`

const withAccidental = (key) => `measure
e with ${key} key
f with ${key} key
g with ${key} key
a with ${key} key
measure
b with ${key} key, with stem down
c5 with ${key} key, with stem down
d5 with ${key} key, with stem down
e5 with ${key} key, with stem down
measure
c with ${key} key
a5 with ${key} key, with stem down
chord
f a with ${key} key c5`

const withRest = (duration) => `measure
${duration} rest
${duration} ${LINE_NOTE}
${duration} rest
${duration} ${SPACE_NOTE}`

const withFlags = (duration) => `measure
voice
${duration} e with stem down, f g a
b with stem up, c5 d5 e5`

const withNoteBody = (duration) => `measure
${duration} e
${duration} f
${duration} g
${duration} a
measure
${duration} b with stem down
${duration} c5 with stem down
${duration} d5 with stem down
${duration} e5 with stem down
measure
${duration} c
${duration} a5 with stem down
chord
${duration} f a c5`

const ghostNoteBody = (duration) => `measure
${duration} ${LINE_NOTE} is ghost
${duration} ${SPACE_NOTE} is ghost
measure
${duration} d5 is ghost, with stem down
${duration} c5 is ghost, with stem down`

const withBrace = (staves) => `measure
brace from first stave to ${staves} stave
${'stave\n'.repeat(staves === 'second' ? 2 : staves === 'third' ? 3 : 4).trim()}`

const withWave = (command) => `measure
1/2 ${LINE_NOTE} ${command}
1/2 ${SPACE_NOTE} ${command}`

const withDynamic = (text) => `measure
${LINE_NOTE} with dynamic "${text}"
${SPACE_NOTE} with dynamic "${text}"
d5 with dynamic "${text}" below, with stem down
c5 with dynamic "${text}" below, with stem down`

const withTempo = (note) => `measure
tempo is "${note} = 120"
e f g a
b c5 d5 e5`

const withTimeSignature = (signature) => `measure
time signature is ${signature}
e f g a
b c5 d5 e5`

const withTuplet = (value) => `measure
1/8 g beamed, a, b
1/8 c5 beamed, d5, e5
tuplet ${value} with brackets from first unit to third unit
tuplet ${value} with brackets from fourth unit to 6th unit`

const withPedal = (text) => `measure
${LINE_NOTE} with pedal "${text}"
${SPACE_NOTE}
d5
c5 with release`

const withOctaveSign = (command) => `measure
${LINE_NOTE} is ${command}
${SPACE_NOTE} is ${command}
d5 is ${command}
c5 is ${command}`

const withNoteLetter = (text) => `measure
${LINE_NOTE} with text "${text}" above
${SPACE_NOTE} with text "${text}" above
d5 with text "${text}" below, with stem down
c5 with text "${text}" below, with stem down`

/**
 * A stave of plain notes: what to show for a glyph that has no context of its
 * own, such as a brace tier the drawer picks by height.
 */
const PLAIN = `measure
e f g a
b c5 d5 e5`

const examples = {
  // articulations
  accent: withArticulation('accent'),
  staccato: withArticulation('staccato'),
  tenuto: withArticulation('tenuto'),
  marcato: withArticulation('marcato'),
  spiccato: withArticulation('spiccato'),
  fermata: withArticulation('fermata'),
  leftHandPizzicato: withArticulation('left hand pizzicato'),
  snapPizzicato: withArticulation('snap pizzicato'),
  naturalHarmonic: withArticulation('natural harmonic'),
  upBow: withArticulation('up bow'),
  downBow: withArticulation('down bow'),

  // ornaments and the accidentals that sit over them
  trill: withOrnament('trill'),
  turn: withOrnament('turn'),
  turnInverted: withOrnament('turn inverted'),
  mordent: withOrnament('mordent'),
  mordentInverted: withOrnament('mordent inverted'),
  articulationSharpKey: withOrnamentKey('sharp key'),
  articulationFlatKey: withOrnamentKey('flat key'),
  articulationNaturalKey: withOrnamentKey('natural key'),

  // clefs
  treble: withClef('treble clef'),
  bass: withClef('bass clef'),
  alto: withClef('alto clef'),
  trebleOctaveEightUp: withClef('octave 8 up clef'),
  trebleOctaveEightDown: withClef('octave 8 down clef'),
  trebleOctaveFifteenUp: withClef('octave fifteen up clef'),
  trebleOctaveFifteenDown: withClef('octave fifteen down clef'),

  // note bodies
  darkNoteBody: withNoteBody('1/4'),
  halfNoteBody: withNoteBody('1/2'),
  wholeNoteBody: withNoteBody('1'),
  doubleWholeNoteBody: withNoteBody('2'),
  ghostDarkNoteBody: ghostNoteBody('1/4'),
  ghostHalfNoteBody: ghostNoteBody('1/2'),
  ghostWholeNoteBody: ghostNoteBody('1'),
  // A dot belongs in a space, so on a line note it lifts into the space above.
  noteDot: `measure
1/4 e dotted
1/4 f dotted
1/4 g dotted
1/4 a dotted
measure
1/4 b dotted, with stem down
1/4 c5 dotted, with stem down
1/4 d5 with two dots, with stem down
1/4 e5 with two dots, with stem down
measure
chord with dot
f a c5`,

  // accidentals
  sharpKey: withAccidental('sharp'),
  flatKey: withAccidental('flat'),
  naturalKey: withAccidental('natural'),
  doubleSharpKey: withAccidental('double sharp'),
  doubleFlatKey: withAccidental('double flat'),
  demisharpKey: withAccidental('demisharp'),
  demiflatKey: withAccidental('demiflat'),
  sesquisharpKey: withAccidental('sesquisharp'),
  sesquiflatKey: withAccidental('sesquiflat'),

  // rests
  quadrupleWholeRest: withRest('4'),
  doubleWholeRest: withRest('2'),
  wholeRest: withRest('1'),
  halfRest: withRest('1/2'),
  quarterRest: withRest('1/4'),
  eighthRest: withRest('1/8'),
  sixteenthRest: withRest('1/16'),
  thirtySecondRest: withRest('1/32'),
  sixtyFourthRest: withRest('1/64'),
  hundredTwentyEighthRest: withRest('1/128'),
  twoHundredFiftySixthRest: withRest('1/256'),
  measureRest: `measure with multi measure rest 4 times
stave
stave`,

  // flags — one duration per flag count, in both stem directions
  oneTopFlag: withFlags('1/8'),
  twoTopFlags: withFlags('1/16'),
  threeTopFlags: withFlags('1/32'),
  fourTopFlags: withFlags('1/64'),
  fiveTopFlags: withFlags('1/128'),
  sixTopFlags: withFlags('1/256'),
  oneBottomFlag: withFlags('1/8'),
  twoBottomFlags: withFlags('1/16'),
  threeBottomFlags: withFlags('1/32'),
  fourBottomFlags: withFlags('1/64'),
  fiveBottomFlags: withFlags('1/128'),
  sixBottomFlags: withFlags('1/256'),

  // repeats, navigation and breathing
  coda: `measure
coda
a b c5 d5`,
  sign: `measure
sign
a b c5 d5`,
  repeatDots: `measure
starts with double bold barline, with repeat sign at the start
a b c5 d5
measure
ends with double bold barline, with repeat sign at the end
a b c5 d5`,
  simile: `measure
b repeat three times
measure
a repeat three times`,
  mixedSimile: `measure with simile of two previous measures 3 times
stave`,
  singleMixedSimile: `measure with simile of previous measure 3 times
stave`,
  breathMarkAsComma: `measure
a
b with breath comma before
c5`,
  breathMarkAsDoubleSlash: `measure
a
b with breath double slashes before
c5`,

  // pedals
  releasePedal: `measure
a with pedal
b
c5 with release`,

  // waves
  trillWavePeriod: withWave('with trill with wave after'),
  glissandoWavePeriod: `measure
1/2 b with glissando after up
1/2 d5
measure
1/2 a with glissando after up
1/2 c5`,
  arpeggioWavePeriod: `measure
chord is arpeggiated
c e g b`,
  arpeggioWaveWithArrowPeriod: `measure
chord is arpeggiated with arrow up
c e g b

chord is arpeggiated with arrow down
c e g b`,

  // staff connections — the brace tier is chosen by how many staves it spans
  curlySmallBrace: withBrace('second'),
  curlyLargeBrace: withBrace('third'),
  curlyLargerBrace: withBrace('fourth'),
  curlyFlatBrace: withBrace('fourth'),
  bracketTop: `measure
bracket from first stave to second stave
stave
stave`,
  bracketBottom: `measure
bracket from first stave to second stave
stave
stave`
}

/*
The nested letter maps: each one is a group of characters the drawer sets in the
music font, so every letter gets an example built from the same shape.
*/
const DYNAMIC_LETTERS = [
  'p', 'm', 'f', 'r', 's', 'z', 'pppppp', 'ppppp', 'pppp', 'ppp', 'pp', 'mp',
  'mf', 'pf', 'ff', 'fff', 'ffff', 'fffff', 'ffffff', 'fp', 'fz', 'sf', 'sfp',
  'sfpp', 'sfz', 'sfzp', 'sffz', 'rf', 'rfz'
]
for (const text of DYNAMIC_LETTERS) {
  examples[`dynamicLetters.${text}`] = withDynamic(text)
}

const TEMPO_NOTES = {
  whole: '1', half: '1/2', quarter: '1/4', eighth: '1/8',
  sixteenth: '1/16', thirtySecond: '1/32', sixtyFourth: '1/64'
}
for (const [ name, duration ] of Object.entries(TEMPO_NOTES)) {
  examples[`tempoLetters.${name}`] = withTempo(duration)
  examples[`tempoLetters.${name}Dotted`] = withTempo(`${duration} dotted`)
}

for (const digit of '0123456789') {
  // There is no 0:4, so the digit zero is shown in a signature that contains it.
  examples[`timeSignatureLetters.${digit}`] = withTimeSignature(
    digit === '0' ? '10:4' : `${digit}:4`
  )
  examples[`tupletLetters.${digit}`] = withTuplet(digit === '0' ? '10' : digit)
  examples[`noteLetters.${digit}`] = withNoteLetter(digit)
}
examples['timeSignatureLetters.c'] = withTimeSignature('c')
examples['timeSignatureLetters.crossedC'] = withTimeSignature('crossed c')
examples['tupletLetters.:'] = withTuplet('6:4')

for (const letter of [ 'T', 't', 'p', 'i', 'm', 'a', 'c', 'x', 'e', 'o' ]) {
  examples[`noteLetters.${letter}`] = withNoteLetter(letter)
}

for (const text of [ 'Ped.', 'Ped', 'P', 'e', 'd', 'Soft.', 'Soft', 'S' ]) {
  examples[`pedalLetters.${text}`] = withPedal(text)
}

const OCTAVE_SIGNS = {
  '8va-up': 'octave up',
  '8va-down': 'octave down',
  '15ma-up': 'two octaves up',
  '15ma-down': 'two octaves down'
}
for (const [ name, command ] of Object.entries(OCTAVE_SIGNS)) {
  examples[`octaveSignLetters.${name}`] = withOctaveSign(command)
}

/**
 * The example for one glyph, or a plain stave when it has no context of its own.
 */
export default function glyphExample(name) {
  return examples[name] || PLAIN
}

export { examples }
