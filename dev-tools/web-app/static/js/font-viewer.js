import '#msq/msq-editor-template.js'
import opentype from '#msq-worker/drawer/lib/opentype/opentype.js'
import generateUnicodePoints from '#msq-worker/drawer/generateUnicodePoints.js'
import scaffold from '#tools/smufl/scaffold.js'
import './searchable-select.js'
import worker from '#msq/utils/worker-instance.js'
import { registerFontNames } from '#msq/utils/fontNames.js'

// --- the music each glyph is judged in ------------------------------------------------

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
function glyphExample(name) {
  return examples[name] || PLAIN
}

// --- one entry's yCorrection, as text --------------------------------------------------

/**
 * Reading one entry's yCorrection out of a music-js font, as text.
 *
 * The font viewer engraves through the editor, which engraves in the worker off
 * the font module the worker imported — so a value typed into the page cannot
 * reach the score by any other route than giving the worker a different module.
 * Patching the source here lets that happen without writing anything to disk.
 *
 * These files are generated, so their formatting is regular enough to walk by
 * line: one property per line, objects opened by `<name>: {` and closed by `}`
 * at the same indent.
 */

/**
 * Walk the file, calling back with the line index of the entry's yCorrection.
 */
function locate(lines, entryPath) {
  const stack = []
  let inside = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const closing = line.match(/^(\s*)\}/)
    if (closing) {
      while (stack.length && stack[stack.length - 1].indent >= closing[1].length) {
        stack.pop()
      }
      inside = stack.map((frame) => frame.name).join('.') === entryPath
    }

    const opening = line.match(/^(\s*)(?:'([^']*)'|([A-Za-z0-9_]+)): \{\s*$/)
    if (opening) {
      const indent = opening[1].length
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      stack.push({ indent, name: opening[2] === undefined ? opening[3] : opening[2] })
      inside = stack.map((frame) => frame.name).join('.') === entryPath
      continue
    }

    if (!inside) {
      continue
    }

    const correction = line.match(
      /^(\s*)yCorrection: (-?[\d.]+) \* intervalBetweenStaveLines(,?)\s*$/
    )
    if (correction) {
      return {
        line: index,
        indent: correction[1].length,
        value: Number(correction[2]),
        comma: correction[3] === ','
      }
    }
  }
  return null
}

/**
 * The yCorrection an entry currently carries, in stave-line intervals, or null
 * when it has none — most glyphs are positioned by yOffset or not at all.
 */
function readYCorrection(source, entryPath) {
  const found = locate(source.split('\n'), entryPath)
  return found ? found.value : null
}

// --- the page ---------------------------------------------------------------

const FONT_SOURCES_REFERENCE = 'msqFontSources'
const COORDINATE_DECIMALS = 2

// The layout is fetched before the page's own markup is placed, so nothing can
// be looked up until it is there.
await window.whenPresent('#editor')

const control = (id) => document.getElementById(id)
const elements = {
  font: control('font'), entry: control('entry'), codepoint: control('codepoint'),
  size: control('size'), interval: control('interval'), correction: control('correction'),
  editor: control('editor'), status: control('status'), points: control('points'),
  metrics: control('metrics'),
  previousGlyph: control('previous-glyph'), nextGlyph: control('next-glyph'),
  glyphPlace: control('glyph-place'),

  textFont: control('text-font'), textMusicFont: control('text-music-font'),
  textEditor: control('text-editor'), textSays: control('text-says'),

  chordFont: control('chord-font'), chordMusicFont: control('chord-music-font'),
  chordEditor: control('chord-editor'), chordSays: control('chord-says')
}

/*
Which faces there are, read off the disk rather than written down here.

The page used to carry its own list of the four music fonts and the four text
files, which meant a face added to src/drawer/font was invisible until someone
remembered to add it here too. `/dev/fonts` walks those folders and returns both
the faces and the config that registers them, under the names the language
accepts.
*/
let faces = { music: [], text: [], 'chord-letters': [], config: {} }

async function readFaces() {
  const response = await fetch('/dev/fonts')
  if (!response.ok) {
    throw new Error(`the server answered ${response.status}`)
  }
  faces = await response.json()
  return faces
}

/**
 * Fill a picker with names, keeping what was chosen if it is still offered.
 */
function fillPicker(picker, names, fallback) {
  if (!picker) {
    return
  }
  const chosen = picker.value
  picker.replaceChildren()
  for (const name of names) {
    const option = document.createElement('option')
    option.value = name
    option.textContent = name
    picker.appendChild(option)
  }
  picker.value = names.includes(chosen) ? chosen : (names.includes(fallback) ? fallback : names[0] || '')
  picker.refresh()
}

const usableNames = (family) => faces[family].filter((one) => one.usable).map((one) => one.name)
const faceNamed = (family, name) => faces[family].find((one) => one.name === name)

// Every glyph the scaffold defines, flattened so nested letter maps are pickable.
const glyphs = new Map()
const collect = (nodes, prefix) => {
  for (const node of nodes) {
    if (node.kind === 'glyph') {
      glyphs.set(prefix + node.name, node)
    } else if (node.kind === 'group') {
      collect(node.entries, `${prefix}${node.name}.`)
    }
  }
}
collect(scaffold, '')

for (const name of glyphs.keys()) {
  const option = document.createElement('option')
  option.value = name
  option.textContent = name
  elements.entry.appendChild(option)
}
elements.entry.value = 'treble'

const loadedFonts = new Map()
async function fontFor(name) {
  if (!loadedFonts.has(name)) {
    const face = faceNamed('music', name)
    if (!face || !face.url) {
      throw new Error(`no font file for ${name}`)
    }
    loadedFonts.set(name, await opentype.load(face.url))
  }
  return loadedFonts.get(name)
}

/**
 * Accepts a literal character or any of U+E050 / e050 / 0xE050.
 */
function charactersFrom(value) {
  const text = value.trim()
  const codepoint = text.match(/^(?:U\+|0x)?([0-9a-fA-F]{4,6})$/)
  return codepoint ? String.fromCodePoint(parseInt(codepoint[1], 16)) : text
}

const unicodeLabel = (characters) => [ ...characters ].map(
  (character) => 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
).join(' ')

/**
 * Lay a point array out the way the music-js fonts hold it — the same shape the
 * generator writes, so what is copied from here can be pasted straight in.
 */
function pointArrayLines(points) {
  const lines = []
  let coordinates = []
  const flush = () => {
    if (coordinates.length) {
      lines.push(coordinates.join(', '))
      coordinates = []
    }
  }
  for (const point of points) {
    if (typeof point === 'string') {
      flush()
      lines.push(`'${point}'`)
    } else {
      const written = Object.is(point, -0)
        ? `-${(0).toFixed(COORDINATE_DECIMALS)}`
        : point.toFixed(COORDINATE_DECIMALS)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flush()
  return lines.map((line, index) => index === lines.length - 1 ? line : `${line},`)
}

let traced = []

/**
 * Trace the current character at the current size, and show the result.
 */
async function traceGlyph() {
  const characters = charactersFrom(elements.codepoint.value)
  if (!characters) {
    return
  }

  const interval = Number(elements.interval.value) || 8.5
  const size = Number(elements.size.value) || 4.0
  const font = await fontFor(elements.font.value)

  const missing = [ ...characters ].filter(
    (character) => font.charToGlyphIndex(character) === 0
  )
  if (missing.length) {
    traced = []
    elements.points.value = ''
    elements.metrics.innerHTML =
      `<span is="e-tag">${unicodeLabel(characters)} is not in this font</span>`
    return
  }

  traced = generateUnicodePoints(characters, font, null, size, interval).map(
    (point) => typeof point === 'string'
      ? point
      : Number((point / interval).toFixed(COORDINATE_DECIMALS))
  )
  elements.points.value = pointArrayLines(traced).join('\n')

  const numbers = traced.filter((point) => typeof point === 'number')
  const xs = numbers.filter((value, index) => index % 2 === 0)
  const ys = numbers.filter((value, index) => index % 2 === 1)
  elements.metrics.innerHTML = [
    unicodeLabel(characters),
    `width ${(Math.max(...xs) - Math.min(...xs)).toFixed(2)}`,
    `height ${(Math.max(...ys) - Math.min(...ys)).toFixed(2)}`,
    `${numbers.length / 2} points`
  ].map((metric) => `<span is="e-tag">${metric}</span>`).join('')
}

/**
 * The fonts the page registers.
 *
 * The config comes from the server with the faces, so it holds whatever is on
 * disk. `musicJs` overrides where one music font's module comes from, which is
 * how a typed correction reaches the worker.
 */
function fontConfig(musicJs = {}) {
  const config = JSON.parse(JSON.stringify(faces.config || {}))
  for (const [ name, url ] of Object.entries(musicJs)) {
    if (config.music && config.music[name]) {
      config.music[name] = { ...config.music[name], js: url }
    }
  }
  return config
}

/*
The music-js source of each font, read from the same file Apply writes.

It used to come from the generated mirror under /js/msq/worker/, which is a copy
made at build time — so an applied change appeared to revert until that copy was
rebuilt. Reading the source directly is what makes Apply visible.
*/
const fontSources = new Map()
async function musicJsSource(name) {
  if (!fontSources.has(name)) {
    const response = await fetch(`/dev/font-source/${name}`)
    if (!response.ok) {
      throw new Error(`could not read ${name}.js`)
    }
    fontSources.set(name, await response.text())
  }
  return fontSources.get(name)
}

/*
Registering a preview.

The worker refuses a second registration under a reference it already holds, so
each preview gets its own. The patched font goes in as a blob: the worker
imports it like any other module, and nothing is written to disk.
*/
let previewCount = 0
const previews = new Map()

/**
 * A reference whose font carries what has been traced.
 *
 * The score is drawn by the worker out of the font module it imported, so the
 * only way a traced glyph — at whatever size and interval it was traced — can
 * reach the stave is to give the worker a different module. The server makes
 * that module by the same edit Apply would write, without writing it, and it
 * goes in as a blob: nothing on disk changes until Apply is pressed.
 */
async function referenceWithTracing(font, entry, correction) {
  /*
  Until one of the three values has been touched, what is on screen is the font
  as it stands — and registering a preview of it would mean re-reading every
  font in the config for no difference at all.
  */
  if (!tuning || !traced.length) {
    return currentReference
  }

  const key = `${currentReference}|${font}|${entry}|${correction}|${traced.join(' ')}`
  if (previews.has(key)) {
    return previews.get(key)
  }

  const response = await fetch('/dev/font-glyph/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      font,
      entry,
      points: traced,
      yCorrection: correction === null ? undefined : correction
    })
  })
  if (!response.ok) {
    const failed = await response.json().catch(() => ({}))
    throw new Error(failed.error || `the server answered ${response.status}`)
  }

  const url = URL.createObjectURL(new Blob([ await response.text() ], { type: 'text/javascript' }))
  const reference = `${FONT_SOURCES_REFERENCE}-preview-${++previewCount}`
  const config = fontConfig({ [font]: url })

  await registerWithWorker(reference, config)
  registerFontNames(reference, config)
  previews.set(key, reference)
  return reference
}

/*
Rendering the example.

An msq-editor cannot be re-rendered: it replaces itself with the engraved view
and guards on having rendered once. So each time anything changes we build a
fresh template and let insertion drive it, which is the element's own lifecycle.
*/
async function renderEditor() {
  const entry = elements.entry.value
  const font = elements.font.value

  /*
  The interval between stave lines is what the page is measured in, and in the
  language it is spelled `font size` — the same property, under the name the
  style command uses. Putting it in the source is what makes the input change
  the whole example rather than only the glyph: the traced points are written
  against the interval, so a glyph keeps its proportions while everything around
  it grows with the stave.

  The size input above is the other half of that pair, and deliberately not this:
  it scales the one glyph being traced, against a stave that stays put.
  */
  const interval = Number(elements.interval.value)
  const staveSize = Number.isFinite(interval) && interval > 0
    ? `font size is ${interval}\n`
    : ''
  const source = `music font is ${font}\n${staveSize}\n${glyphExample(entry)}`

  const typed = elements.correction.value === '' ? null : Number(elements.correction.value)
  let reference = currentReference
  try {
    reference = await referenceWithTracing(font, entry, typed)
  } catch (error) {
    window.showError(`Could not preview it: ${error.message}`)
  }

  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', reference)
  template.setAttribute('data-editor-height', '320px')
  // The source goes in through innerState rather than as content, which is the
  // hook MSQTemplateElement reads before falling back to its template content.
  template.innerState = source

  elements.editor.replaceChildren(template)
  elements.status.textContent = `${entry} — engraved with ${font}` +
    (reference === currentReference ? '' : ', showing what you have traced')
  showGlyphPlace()
}

let renderSoon = null
function refresh({ retrace = true } = {}) {
  clearTimeout(renderSoon)
  renderSoon = setTimeout(async () => {
    if (retrace) {
      await traceGlyph()
    }
    await renderEditor()
  }, 120)
}

/**
 * Picking an entry fills in its codepoint, its size and its correction, so the
 * three inputs always describe the glyph on screen.
 */
async function loadEntry() {
  const glyph = glyphs.get(elements.entry.value)
  if (!glyph) {
    return
  }
  tuning = false
  elements.codepoint.value = unicodeLabel(glyph.smufl).split(' ')[0]
  const sourceSize = scaffold.find((node) => node.name === 'musicFontSourceSize')
  elements.size.value = String((sourceSize ? sourceSize.value : 4) * (glyph.scale || 1))
  await syncCorrectionFromFont()
}

/**
 * Show the yCorrection the selected font actually holds for the selected entry.
 *
 * It comes out of that font's own music-js file rather than out of the scaffold,
 * whose value is only the midpoint the font started from — switching font has to
 * show what that font says, since that is what Apply would overwrite.
 *
 * Most glyphs are not positioned by a yCorrection at all: an articulation sits at
 * a yOffset from the note, and many entries carry neither. Offering an input for
 * a value the entry does not have would invite tuning something that can never
 * take effect, so it is disabled and says which value the glyph does use.
 */
async function syncCorrectionFromFont() {
  const glyph = glyphs.get(elements.entry.value)
  let correction = null
  try {
    correction = readYCorrection(
      await musicJsSource(elements.font.value), elements.entry.value
    )
  } catch {
    correction = null
  }

  const offset = ((glyph && glyph.rest) || []).find((one) => one.name === 'yOffset')
  elements.correction.value = correction === null ? '' : String(correction)
  elements.correction.disabled = correction === null
  elements.correction.placeholder = correction !== null
    ? ''
    : offset
      ? `not used — positioned by yOffset ${offset.value}`
      : 'not used by this glyph'
  refresh()
}

/**
 * Step to the glyph before or after this one in the table.
 *
 * The order is the scaffold's, which is the order the font file is written in —
 * so walking it goes through a family at a time rather than alphabetically
 * across unrelated signs.
 */
async function stepGlyph(by) {
  const names = [ ...glyphs.keys() ]
  const at = names.indexOf(elements.entry.value)
  const next = names[(at + by + names.length) % names.length]
  if (!next) {
    return
  }
  elements.entry.value = next
  elements.entry.refresh()
  await loadEntry()
  writeUrl({ push: true })
}

/**
 * Where in the table you are, so walking it has a sense of distance.
 */
function showGlyphPlace() {
  const names = [ ...glyphs.keys() ]
  const at = names.indexOf(elements.entry.value)
  elements.glyphPlace.textContent = at === -1
    ? ''
    : `${at + 1} of ${names.length}`
}

/*
Whether anything has been tuned since the glyph was picked.

The preview is not free — it asks the server for a patched font and hands the
worker a fresh registration — so it is only built once a value has actually been
changed. Picking another glyph puts you back to looking at the font as it is.
*/
let tuning = false

/*
The controls live in the address bar.

Everything the page shows is derived from these six values, so putting them in
the query string makes a view reloadable and shareable, and lets the back button
walk through what was looked at. Only committed changes are recorded — picking a
font or a glyph, or leaving a field — so a back press steps between states rather
than between keystrokes.
*/
const URL_FIELDS = [ 'font', 'entry', 'codepoint', 'size', 'interval', 'correction' ]
let applyingUrl = false

function writeUrl({ push = false } = {}) {
  if (applyingUrl) {
    return
  }
  const params = new URLSearchParams()
  for (const field of URL_FIELDS) {
    const value = elements[field].value
    if (value !== '' && !elements[field].disabled) {
      params.set(field, value)
    }
  }
  const url = `${location.pathname}?${params}`
  if (url === `${location.pathname}${location.search}`) {
    return
  }
  history[push ? 'pushState' : 'replaceState'](null, '', url)
}

async function applyUrl() {
  const params = new URLSearchParams(location.search)
  applyingUrl = true

  if (params.has('font') && [ ...elements.font.options ].some((o) => o.value === params.get('font'))) {
    elements.font.value = params.get('font')
    elements.font.refresh()
  }
  if (params.has('entry') && glyphs.has(params.get('entry'))) {
    elements.entry.value = params.get('entry')
    elements.entry.refresh()
  }

  // Fill in the entry's own defaults first, so anything the url does not carry
  // still describes the glyph rather than whatever was on screen before.
  await loadEntry()

  for (const field of [ 'codepoint', 'size', 'interval', 'correction' ]) {
    if (params.has(field) && !elements[field].disabled) {
      elements[field].value = params.get(field)
    }
  }
  applyingUrl = false
  // Seed the address bar so the very first view is reloadable too, without
  // adding a history entry for simply having opened the page.
  writeUrl()
  refresh()
}

window.addEventListener('popstate', () => { applyUrl() })

elements.entry.addEventListener('change', async () => {
  await loadEntry()
  writeUrl({ push: true })
})
elements.previousGlyph.addEventListener('click', () => stepGlyph(-1))
elements.nextGlyph.addEventListener('click', () => stepGlyph(1))
elements.font.addEventListener('change', async () => {
  await syncCorrectionFromFont()
  writeUrl({ push: true })
})
for (const id of [ 'codepoint', 'size', 'interval', 'correction' ]) {
  elements[id].addEventListener('change', () => writeUrl({ push: true }))
}
/*
Typing redraws but does not touch the address bar. Replacing the current entry
on every keystroke would overwrite the very state a back press should return to,
so the url only moves when a value is committed — on blur, on Enter, or on
picking from a list.
*/
/*
The codepoint and the size change the glyph itself, so they put the page into
tuning — which is what builds a preview font for the stave to be drawn from.
*/
for (const id of [ 'codepoint', 'size' ]) {
  elements[id].addEventListener('input', () => {
    tuning = true
    refresh()
  })
}

/*
The interval does not. A glyph is traced at `size × interval` and its numbers
written back divided by the interval, so the interval cancels out of what is
stored — it is the size of the stave, not of the glyph, and it reaches the
example as `font size is …` in the source rather than through a patched font.
*/
elements.interval.addEventListener('input', () => refresh())
elements.correction.addEventListener('input', () => {
  tuning = true
  refresh({ retrace: false })
})

control('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(elements.points.value)
    window.showToast('Points copied.')
  } catch {
    elements.points.select()
    window.showToast('Selected — press Cmd/Ctrl+C.')
  }
})

control('apply').addEventListener('click', async () => {
  const entry = elements.entry.value
  const font = elements.font.value
  if (!traced.length) {
    window.showError('Nothing traced to apply.')
    return
  }

  const confirmed = await window.confirmAction(
    `Write the traced points for "${entry}" into src/drawer/font/music-js/${font}.js?` +
    ' This changes a file in the working tree.',
    'Write it', 'Leave it'
  )
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/dev/font-glyph', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        font,
        entry,
        points: traced,
        yCorrection: elements.correction.value === ''
          ? undefined
          : Number(elements.correction.value)
      })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || `the server answered ${response.status}`)
    }
    // What is on disk has changed, so the cached copy the preview patches must go.
    fontSources.delete(result.font)
    window.showToast(
      `Wrote ${result.wrote} point lines into ${result.font}.js` +
      `${result.yCorrection ? ' and its yCorrection' : ''}.`
    )
  } catch (error) {
    window.showError(`Could not apply: ${error.message}`)
  }
})

// Surface what the element swallows: render() is called without await.
window.addEventListener('unhandledrejection', (event) => {
  window.showError(`Render failed: ${event.reason?.message || event.reason}`)
})

// --- the text and chord-letter tabs -----------------------------------------

/*
What each face is asked to set.

A face is judged where it is used, so each example is the work that face does
and nothing else: the text one carries every piece of type on a page, and the
chord one the figures a chord face has to cope with. Both name the face in their
first line, which is the whole point of them.
*/
const textExample = (textFont, musicFont) => `music font is ${musicFont}
text font is ${textFont}

title is "Sonata in the Key of Type"
composer is "Handgloves & Co."
right subtitle is "0123456789"

measure
key signature is d major for each line
instrument title is "Voice" for stave 1
stave with treble clef

measure
tempo is "Andante cantabile"
1/4 d with lyrics "Whis" followed by dash
1/4 f sharp with lyrics "pered" followed by dash
1/4 a with lyrics "ly," with text "dolce" above
1/4 b with lyrics "then" where underscore starts
measure
1/2 a with lyrics "held" where underscore ends
1/4 g with lyrics "and" followed by dash
1/4 f sharp with lyrics "gone"`

const chordExample = (chordFont, musicFont) => `music font is ${musicFont}
chord letters font is ${chordFont}

measure
treble clef
1/4 c with chord "C"
1/4 e with chord "Cmaj7"
1/4 g with chord "C^9"
1/4 c5 with chord "C^halfdim13"
measure
1/4 d with chord "A^flat/C"
1/4 f with chord "C/F^sharp"
1/4 a with chord "G7"
1/4 c5 with chord "E^flatmaj7"`

/*
An engraved example, built the way the music tab builds its own: an msq-editor
cannot be re-rendered, so each time anything changes a fresh template is made
and insertion drives it.
*/
function engrave(where, source, height = '300px') {
  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', currentReference)
  template.setAttribute('data-editor-height', height)
  template.innerState = source
  where.replaceChildren(template)
}

function renderTextExample() {
  const face = faceNamed('text', elements.textFont.value)
  if (!face) {
    elements.textSays.textContent = 'No text face is available.'
    return
  }
  elements.textSays.textContent = `${face.name} — ${face.says}`
  engrave(elements.textEditor, textExample(face.name, elements.textMusicFont.value), '260px')
}

function renderChordExample() {
  const face = faceNamed('chord-letters', elements.chordFont.value)
  if (!face) {
    elements.chordSays.textContent = 'No chord face is available.'
    return
  }
  elements.chordSays.textContent = `${face.name} — ${face.says}`
  engrave(elements.chordEditor, chordExample(face.name, elements.chordMusicFont.value), '240px')
}

// --- registering what is on disk ---------------------------------------------

/*
The worker refuses a second registration under a reference it already holds, so
a changed set of faces is registered under a fresh one. That is also how the
music tab previews a correction, and the two are kept apart by name.
*/
let currentReference = FONT_SOURCES_REFERENCE
let registrations = 0

function registerWithWorker(reference, config) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()
    const onMessage = (event) => {
      if (event.data.id !== id) {
        return
      }
      worker.removeEventListener('message', onMessage)
      event.data.error ? reject(new Error(event.data.error)) : resolve()
    }
    worker.addEventListener('message', onMessage)
    worker.postMessage({
      id, name: 'fonts.setup', fontConfig: config, fontSourcesReference: reference
    })
  })
}

/**
 * Read the faces again and put them in front of the worker and the pickers.
 *
 * Called on load, and after anything is added — which is what makes a face
 * usable the moment it lands rather than after a reload.
 */
async function loadFaces({ choose = null } = {}) {
  await readFaces()

  const music = usableNames('music')
  fillPicker(elements.font, music, 'bravura')
  fillPicker(elements.textMusicFont, music, 'bravura')
  fillPicker(elements.chordMusicFont, music, 'bravura')
  fillPicker(elements.textFont, usableNames('text'), 'noto-serif')
  fillPicker(elements.chordFont, usableNames('chord-letters'), 'gentium plus')

  // A face just added is the one you want to look at.
  for (const picker of [ elements.font, elements.textFont, elements.chordFont ]) {
    if (choose && [ ...picker.options ].some((option) => option.value === choose)) {
      picker.value = choose
      picker.refresh()
    }
  }

  const reference = registrations === 0
    ? FONT_SOURCES_REFERENCE
    : `${FONT_SOURCES_REFERENCE}-${registrations}`
  await registerWithWorker(reference, fontConfig())
  registerFontNames(reference, fontConfig())
  registrations += 1
  currentReference = reference
}

/*
Called from the upload forms, which are EHTML and know nothing of any of this.
*/
window.fontsChanged = async function (name) {
  try {
    // What is on disk has changed, so anything cached from it must go.
    fontSources.clear()
    loadedFonts.clear()
    await loadFaces({ choose: name })
    renderShownTab()
  } catch (error) {
    window.showError(`Could not read the fonts again: ${error.message}`)
  }
}

// --- which tab is showing ----------------------------------------------------

/*
An editor measures itself as it renders, and a tab that is not showing has no
size — so each example is engraved when its tab is chosen rather than on load.
It also means opening the page engraves one score instead of three.
*/
let shownTab = 0
const rendered = new Set()

function renderShownTab({ force = true } = {}) {
  if (shownTab === 0) {
    refresh()
    return
  }
  if (!force && rendered.has(shownTab)) {
    return
  }
  rendered.add(shownTab)
  shownTab === 1 ? renderTextExample() : renderChordExample()
}

/*
`e-tabs` builds its nav one microtask after EHTML activates it and offers no
event when a tab is chosen, so the buttons it generates are what we listen on.
*/
function watchTabs() {
  const nav = control('families').querySelector('nav')
  if (!nav) {
    return queueMicrotask(watchTabs)
  }
  nav.querySelectorAll('button').forEach((button, position) => {
    button.addEventListener('click', () => {
      shownTab = position
      renderShownTab({ force: false })
    })
  })
}

for (const [ picker, render ] of [
  [ elements.textFont, renderTextExample ], [ elements.textMusicFont, renderTextExample ],
  [ elements.chordFont, renderChordExample ], [ elements.chordMusicFont, renderChordExample ]
]) {
  picker.addEventListener('change', render)
}

// --- starting up --------------------------------------------------------------

/*
Nothing can be engraved until the worker has the fonts, and the fonts are not
known until the server has been asked. So the order is: read the faces, register
them, then draw whichever tab is showing.
*/
try {
  await loadFaces()
  watchTabs()
  /*
  The hash decides which tab e-tabs opens on, so the page has to draw that one
  rather than assuming the first. The hash of a tab is its title lowercased with
  the spaces hyphenated, which is e-tabs' own rule — read off the tabs rather
  than written down, so renaming one cannot put this out of step.
  */
  const hashes = [ ...control('families').querySelectorAll('e-tab') ].map((tab) =>
    '#' + encodeURIComponent((tab.getAttribute('data-title') || '').toLowerCase().replaceAll(/\s+/g, '-'))
  )
  const opened = hashes.indexOf(location.hash)
  shownTab = opened === -1 ? 0 : opened
  rendered.add(shownTab)
  shownTab === 0 ? applyUrl() : renderShownTab()
} catch (error) {
  window.showError(`Could not set the fonts up: ${error.message}`)
}
