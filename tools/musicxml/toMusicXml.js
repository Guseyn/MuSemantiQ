'use strict'

/**
 * A MuSemantiQ page out as MusicXML.
 *
 * The transpose the importer does, done the other way: a page is measures each
 * holding every stave, and MusicXML is parts each holding every measure, so the
 * staves have to be gathered into parts first and then walked down the page.
 *
 * Two things the page leaves implicit have to be made explicit here, because
 * MusicXML has nowhere to put "it depends":
 *
 *  - **The octave.** A page writes `a` and lets the clef decide which A. The
 *    same table the MIDI side uses decides it here, so an exported file sounds
 *    like the page sounds.
 *  - **The pitch.** MusicXML says both what is drawn (`accidental`) and what is
 *    heard (`alter`), and the two differ wherever a key signature or an earlier
 *    accidental in the bar is doing the work. That is tracked per measure.
 */

import { made, serializeXml } from '#tools/musicxml/xml.js'
import {
  clefShape, FIFTHS_BY_KEY_SIGNATURE, NOTE_TYPES_BY_DURATION, accidentalShape,
  alterOf, markNamed, ornamentVariantFor, BAR_STYLES_BY_NAME,
  OPENING_BAR_STYLES_BY_NAME, GLISSANDO_FORMS, placementOf
} from '#tools/musicxml/vocabulary.js'

/*
Divisions per quarter note.

It has to divide every value a page can write — down to a 256th, which is a
sixty-fourth of a quarter — and still land on whole numbers inside triplets and
their dots. 768 is 64 × 12, which does both.
*/
const DIVISIONS = 768

const DEFAULT_OCTAVE_BY_CLEF = {
  treble: 4, bass: 2, alto: 3, baritone: 4, mezzoSoprano: 3, soprano: 4,
  tenor: 3, octaveEightUp: 5, octaveEightDown: 3, octaveFifteenUp: 6,
  octaveFifteenDown: 2
}

const STEPS = [ 'c', 'd', 'e', 'f', 'g', 'a', 'b' ]

/** The sharps and flats a key signature puts in force, by step. */
function keySignatureAlters(name) {
  const fifths = Number(FIFTHS_BY_KEY_SIGNATURE[name])
  if (!Number.isFinite(fifths) || fifths === 0) {
    return {}
  }
  const order = fifths > 0
    ? [ 'f', 'c', 'g', 'd', 'a', 'e', 'b' ]
    : [ 'b', 'e', 'a', 'd', 'g', 'c', 'f' ]
  const alters = {}
  for (let index = 0; index < Math.abs(fifths); index++) {
    alters[order[index]] = fifths > 0 ? 1 : -1
  }
  return alters
}

/**
 * Gather the staves of a page into parts.
 *
 * A brace is what tells two staves they are one instrument — a keyboard — so
 * braced staves become one part with `<staves>`. Everything else stands alone.
 * Instrument titles name whatever part starts on the stave they sit against.
 */
/**
 * Every brace and bracket the page asks for anywhere.
 *
 * A connection declared `for lines below` first appears on the measure that
 * declares it, not on the first, so looking only at measure one misses it — and
 * the same brace is restated on every page line, so they are deduped by the
 * staves they cover.
 */
function connectionsOf(pageSchema, name) {
  const byRange = new Map()
  for (const measure of pageSchema.measuresParams || []) {
    for (const one of measure.connectionsParams || []) {
      if (one.name !== name) {
        continue
      }
      byRange.set(`${one.staveStartNumber}-${one.staveEndNumber}`, one)
    }
  }
  return [ ...byRange.values() ]
}

/** The instrument titles the page states, wherever it first states them. */
function titlesOf(pageSchema) {
  const byStave = new Map()
  for (const measure of pageSchema.measuresParams || []) {
    for (const one of measure.instrumentTitlesParams || []) {
      const at = one.staveStartNumber ?? one.staveNumber
      if (at !== undefined && !byStave.has(at)) {
        byStave.set(at, one)
      }
    }
  }
  return [ ...byStave.values() ]
}

function partsOf(pageSchema) {
  const first = (pageSchema.measuresParams || [])[0] || {}
  const staveCount = (first.stavesParams || []).length || 1

  const braced = connectionsOf(pageSchema, 'brace')
  const titles = titlesOf(pageSchema)

  const taken = new Set()
  const parts = []

  for (const brace of braced) {
    const from = brace.staveStartNumber
    const to = brace.staveEndNumber
    if (from === undefined || to === undefined || to < from) {
      continue
    }
    const staves = []
    for (let index = from; index <= to; index++) {
      if (!taken.has(index)) {
        staves.push(index)
        taken.add(index)
      }
    }
    if (staves.length) {
      parts.push({ staves })
    }
  }

  for (let index = 0; index < staveCount; index++) {
    if (!taken.has(index)) {
      parts.push({ staves: [ index ] })
    }
  }

  parts.sort((one, another) => one.staves[0] - another.staves[0])
  return parts.map((part, index) => {
    const title = titles.find((one) =>
      (one.staveStartNumber ?? one.staveNumber) === part.staves[0]
    )
    /*
    A part the page never named stays unnamed. MusicXML wants a `<part-name>`
    and will take an empty one — inventing "Part 1" would come back on the next
    import as an instrument title the score never had.
    */
    return {
      id: `P${index + 1}`,
      name: title ? title.value : '',
      staves: part.staves
    }
  })
}

/** The bracket groups a page asks for, as `<part-group>` around those parts. */
function partListOf(pageSchema, parts) {
  const brackets = connectionsOf(pageSchema, 'bracket')
  const braces = connectionsOf(pageSchema, 'brace')

  const children = []
  parts.forEach((part, index) => {
    for (const bracket of brackets) {
      if (bracket.staveStartNumber === part.staves[0]) {
        children.push(made('part-group', { type: 'start', number: '1' },
          made('group-symbol', {}, 'bracket')))
      }
    }
    /*
    A brace is written for any part the page braced — including one over a single
    stave, which a keyboard never needs but the language allows.
    */
    const isBraced = part.staves.length > 1 ||
      braces.some((one) => one.staveStartNumber === part.staves[0])
    if (isBraced) {
      children.push(made('part-group', { type: 'start', number: '2' },
        made('group-symbol', {}, 'brace')))
    }
    children.push(made('score-part', { id: part.id },
      part.name ? made('part-name', {}, part.name) : made('part-name', {}),
      part.name
        ? made('score-instrument', { id: `${part.id}-I1` },
          made('instrument-name', {}, part.name))
        : null))
    if (isBraced) {
      children.push(made('part-group', { type: 'stop', number: '2' }))
    }
    for (const bracket of brackets) {
      if (bracket.staveEndNumber === part.staves[part.staves.length - 1]) {
        children.push(made('part-group', { type: 'stop', number: '1' }))
      }
    }
    void index
  })
  return made('part-list', {}, children)
}

const durationOf = (unit, ratio = null) => {
  const base = unit.unitDuration === undefined ? 0.25 : unit.unitDuration
  const dots = unit.numberOfDots || 0
  let total = base
  let added = base
  for (let index = 0; index < dots; index++) {
    added /= 2
    total += added
  }
  // Inside a tuplet a note sounds for less than it is written as.
  const shortened = ratio ? total * ratio.normal / ratio.actual : total
  return Math.round(shortened * 4 * DIVISIONS)
}

/**
 * The pitch of one note, as both what is drawn and what is heard.
 */
function pitchOf(note, unit, clef, accidentals) {
  const step = (note.noteName || 'c').toUpperCase()
  const octave = note.octaveNumber !== undefined
    ? Number(note.octaveNumber)
    : (DEFAULT_OCTAVE_BY_CLEF[clef] === undefined ? 4 : DEFAULT_OCTAVE_BY_CLEF[clef])

  // The accidental drawn against this note, if the unit carries one for it.
  const drawn = (unit.keysParams || []).find((key) =>
    key.noteName === note.noteName &&
    (key.octaveNumber || '') === (note.octaveNumber || '') &&
    key.keyType !== 'noteLetter'
  )

  const at = `${note.noteName}${octave}`
  let alter
  if (drawn) {
    alter = alterOf(drawn.keyType)
    accidentals.inBar[at] = alter
  } else if (accidentals.inBar[at] !== undefined) {
    alter = accidentals.inBar[at]
  } else {
    alter = accidentals.fromKey[note.noteName] || 0
  }

  return {
    element: made('pitch', {},
      made('step', {}, step),
      alter !== 0 ? made('alter', {}, String(alter)) : null,
      made('octave', {}, String(octave))),
    drawn
  }
}

/**
 * Everything a page hangs off a unit, as the `<notations>` of its first note.
 */
function notationsOf(unit, spans, tiedInto) {
  const children = []

  /*
  A page marks a tie once, on the note it leaves. MusicXML marks both ends, so
  the note being tied *into* has to be told — which it cannot know about itself,
  and which is why the voice walk carries it here. Without this a reader sees a
  tie that opens and never closes.
  */
  if (tiedInto || unit.tiedBefore || unit.tiedBeforeMeasure) {
    children.push(made('tied', { type: 'stop' }))
  }
  if (unit.tiedWithNext || unit.tiedAfter || unit.tiedAfterMeasure) {
    const tie = unit.tiedWithNext || unit.tiedAfter || unit.tiedAfterMeasure
    children.push(made('tied', {
      type: 'start',
      placement: tie.direction ? placementOf(tie.direction) : null
    }))
  }

  for (const slur of unit.slurMarks || []) {
    if (slur.finish) {
      const number = spans.close('slur', slur.key)
      children.push(made('slur', { type: 'stop', number }))
    } else {
      const number = spans.open('slur', slur.key)
      children.push(made('slur', {
        type: 'start', number,
        placement: slur.direction ? placementOf(slur.direction) : null
      }))
    }
  }

  for (const tuplet of unit.tupletMarks || []) {
    if (tuplet.finish) {
      const number = spans.close('tuplet', tuplet.key)
      children.push(made('tuplet', { type: 'stop', number }))
    } else {
      const number = spans.open('tuplet', tuplet.key)
      children.push(made('tuplet', {
        type: 'start', number,
        bracket: tuplet.withBrackets ? 'yes' : null,
        placement: tuplet.direction ? placementOf(tuplet.direction) : null
      }))
    }
  }

  // A page keeps every mark in one list; MusicXML files them under three parents.
  const byParent = { articulations: [], technical: [], ornaments: [] }

  /*
  A breath belongs to the note it comes before, and MusicXML files it with the
  articulations even though it is drawn between notes rather than on one.
  */
  if (unit.breathMarkBefore) {
    byParent.articulations.push(made('breath-mark', {},
      unit.breathMarkBefore.type === 'double slash' ? 'tick' : 'comma'))
  }

  // A fingering or string number is a text label on the note.
  for (const key of unit.keysParams || []) {
    if (key.keyType === 'noteLetter' && key.textValue !== undefined) {
      byParent.technical.push(made('fingering', {}, String(key.textValue)))
    }
  }
  for (const articulation of unit.articulationParams || []) {
    if (articulation.name === 'dynamicMark') {
      children.push(made('dynamics', {
        placement: articulation.direction ? placementOf(articulation.direction) : null
      }, made(articulation.textValue || 'mf', {})))
      continue
    }
    if (articulation.name === 'noteLetter' || articulation.name === 'octaveSign') {
      continue
    }
    if (articulation.name === 'fermata') {
      children.push(made('fermata', {
        type: articulation.direction === 'down' ? 'inverted' : 'upright'
      }))
      continue
    }

    const variant = ornamentVariantFor(articulation)
    if (variant) {
      byParent.ornaments.push(made(variant, {}))
      continue
    }
    const known = markNamed(articulation.name)
    if (!known) {
      continue
    }
    const node = made(known.xml, {
      placement: articulation.direction ? placementOf(articulation.direction) : null
    })
    byParent[known.under === 'notations' ? 'articulations' : known.under].push(node)
    if (articulation.name === 'trill' && articulation.withWave) {
      byParent.ornaments.push(made('wavy-line', { type: 'start' }))
    }
  }
  for (const parent of [ 'articulations', 'technical', 'ornaments' ]) {
    if (byParent[parent].length) {
      children.push(made(parent, {}, byParent[parent]))
    }
  }

  if (unit.arpeggiated) {
    children.push(made('arpeggiate', {
      direction: unit.arpeggiated.arrow || null
    }))
  }

  for (const glissando of unit.glissandoMarks || []) {
    const name = GLISSANDO_FORMS[glissando.form || 'line'] || 'glissando'
    const closing = glissando.finish || spans.isOpen('glissando', glissando.key)
    const number = closing ? spans.close('glissando', glissando.key) : spans.open('glissando', glissando.key)
    children.push(made(name, { type: closing ? 'stop' : 'start', number, 'line-type': 'wavy' }))
  }

  if (unit.tremoloParams) {
    children.push(made('ornaments', {}, made('tremolo', {
      type: unit.tremoloParams.type === 'withNext' ? 'start' : 'single'
    }, String(unit.tremoloParams.customNumberOfTremoloStrokes || 3))))
  }

  return children.length ? made('notations', {}, children) : null
}

/**
 * How many notes are played in the time of how many.
 *
 * A page says only the number over the bracket. MusicXML needs both sides,
 * because `<duration>` is the real, shortened length and a reader has no other
 * way to know a run of eighths is a triplet. Where the page names both — `6:4` —
 * that is used; otherwise the note count is taken against the power of two below
 * it, which is what a plain `3` or `5` means.
 */
function tupletRatio(value) {
  const written = String(value === undefined ? 3 : value)
  const both = written.match(/^(\d+)\s*:\s*(\d+)$/)
  if (both) {
    return { actual: Number(both[1]), normal: Number(both[2]) }
  }
  const actual = Number(written) || 3
  let normal = 1
  while (normal * 2 < actual) {
    normal *= 2
  }
  return { actual, normal }
}

/**
 * A chord symbol, as the root MusicXML files it under.
 *
 * A page keeps the symbol as the text a player reads — `Cmaj7`, `A^flat/C` — so
 * the root is what can be recovered from it with any confidence; the quality and
 * the bass note are left in the text rather than guessed into `<kind>`.
 */
function harmonyOf(chordLetter) {
  const written = String(chordLetter.textValue)
  const root = written.match(/^([A-G])(\^?(flat|sharp))?/)
  if (!root) {
    return made('harmony', {}, made('root', {}, made('root-step', {}, 'C')),
      made('kind', { text: written }, 'other'))
  }
  const alter = /flat/.test(root[2] || '') ? -1 : (/sharp/.test(root[2] || '') ? 1 : 0)
  return made('harmony', {},
    made('root', {},
      made('root-step', {}, root[1]),
      alter ? made('root-alter', {}, String(alter)) : null),
    made('kind', { text: written.slice(root[0].length) }, 'other'))
}

function lyricsOf(unit) {
  return (unit.relatedLyrics || []).map((lyric, index) => made('lyric', { number: String(index + 1) },
    made('syllabic', {}, lyric.dashAfter ? 'begin' : 'single'),
    made('text', {}, lyric.textValue || ''),
    lyric.underscoreStarts ? made('extend', { type: 'start' }) : null))
}

/**
 * The `<direction>` elements a unit asks for, which sit before the note.
 */
function directionsOf(unit, staffNumber, spans) {
  const directions = []

  if (unit.dynamicChangeMark) {
    const mark = unit.dynamicChangeMark
    if (mark.finish) {
      const number = spans.close('wedge', mark.key)
      directions.push(made('direction', {},
        made('direction-type', {}, made('wedge', { type: 'stop', number })),
        made('staff', {}, String(staffNumber))))
    } else {
      const number = spans.open('wedge', mark.key)
      directions.push(made('direction', {
        placement: mark.direction ? placementOf(mark.direction) : null
      },
      made('direction-type', {}, made('wedge', { type: mark.type || 'crescendo', number })),
      made('staff', {}, String(staffNumber))))
    }
  }

  if (unit.octaveSignMark) {
    const mark = unit.octaveSignMark
    if (mark.finish) {
      const number = spans.close('octave-shift', mark.key)
      directions.push(made('direction', {},
        made('direction-type', {}, made('octave-shift', { type: 'stop', number })),
        made('staff', {}, String(staffNumber))))
    } else {
      const size = mark.octaveNumber === '15' ? 15 : 8
      const number = spans.open('octave-shift', mark.key)
      directions.push(made('direction', {},
        made('direction-type', {}, made('octave-shift', {
          // A page names where the bracket is drawn; MusicXML names which way
          // the notes move, which is the other way round.
          type: mark.direction === 'down' ? 'up' : 'down', size, number
        })),
        made('staff', {}, String(staffNumber))))
    }
  }

  if (unit.pedalMark) {
    const pedal = unit.pedalMark
    const type = pedal.variablePeak ? 'change' : (pedal.start ? 'start' : 'stop')
    directions.push(made('direction', { placement: 'below' },
      made('direction-type', {}, made('pedal', { type, line: 'yes' })),
      made('staff', {}, String(staffNumber))))
  }

  return directions
}

/**
 * Numbers for the spans, minted per kind and handed back when they close.
 *
 * MusicXML tells two ends apart by a small number that may be reused the moment
 * a span closes, so a page's page-wide key becomes a number only while it is
 * open.
 */
function madeSpans() {
  const open = new Map()
  return {
    open(kind, key) {
      const used = new Set([ ...open.entries() ]
        .filter(([ at ]) => at.startsWith(`${kind}|`))
        .map(([ , number ]) => number))
      let number = 1
      while (used.has(String(number))) {
        number++
      }
      open.set(`${kind}|${key}`, String(number))
      return String(number)
    },
    close(kind, key) {
      const at = `${kind}|${key}`
      const number = open.get(at) || '1'
      open.delete(at)
      return number
    },
    isOpen(kind, key) {
      return open.has(`${kind}|${key}`)
    }
  }
}

/**
 * What the page holds that MusicXML has nowhere to put.
 */
function madeReport() {
  const dropped = new Map()
  return {
    drop(what) {
      dropped.set(what, (dropped.get(what) || 0) + 1)
    },
    read() {
      return {
        unsupported: [ ...dropped.entries() ].map(([ what, count ]) => ({ what, count })),
        notes: []
      }
    }
  }
}

export default function toMusicXml({ pageSchema, customStyles = {}, midiSettings = {} } = {}) {
  if (!pageSchema || !Array.isArray(pageSchema.measuresParams)) {
    throw new Error('a page schema with measuresParams is needed')
  }

  const parts = partsOf(pageSchema)
  const spans = madeSpans()
  const report = madeReport()

  /*
  How a page is laid out is its own business. MusicXML describes a score, not a
  MuSemantiQ page, and has no way to say "squeeze this line" or "put the words
  under the second stave", so these are named rather than approximated.
  */
  if (pageSchema.hideLastMeasure) {
    report.drop('hiding the last measure')
  }
  if (pageSchema.compressUnitsByNTimesInLines || pageSchema.stretchUnitsByNTimesInLines ||
      pageSchema.compressUnitsByNTimes || pageSchema.stretchUnitsByNTimes) {
    report.drop('compressing or stretching the units of a line')
  }
  if (pageSchema.lyricsUnderStaveIndex !== undefined) {
    report.drop('which stave the lyrics sit under')
  }

  const identification = made('identification', {},
    pageSchema.leftSubtitle ? made('creator', { type: 'composer' }, pageSchema.leftSubtitle) : null,
    pageSchema.rightSubtitle ? made('creator', { type: 'lyricist' }, pageSchema.rightSubtitle) : null,
    made('encoding', {},
      made('software', {}, 'MuSemantiQ'),
      made('encoding-date', {}, new Date().toISOString().slice(0, 10))))

  const scaling = made('scaling', {},
    made('millimetres', {}, '7.0'),
    made('tenths', {}, '40'))
  // `millimeters` is the spelling MusicXML uses.
  scaling.children[0].name = 'millimeters'

  const pageLayout = []
  if (customStyles.pageHeight) {
    pageLayout.push(made('page-height', {}, String(customStyles.pageHeight)))
  }
  if (customStyles.pageLineMaxWidth) {
    pageLayout.push(made('page-width', {}, String(customStyles.pageLineMaxWidth)))
  }
  const margins = []
  if (customStyles.pageLeftAndRightPadding) {
    const value = String(Number(customStyles.pageLeftAndRightPadding) * 10)
    margins.push(made('left-margin', {}, value), made('right-margin', {}, value))
  }
  if (customStyles.pageTopPadding) {
    margins.push(made('top-margin', {}, String(Number(customStyles.pageTopPadding) * 10)))
  }
  if (customStyles.pageBottomPadding) {
    margins.push(made('bottom-margin', {}, String(Number(customStyles.pageBottomPadding) * 10)))
  }
  if (margins.length) {
    pageLayout.push(made('page-margins', { type: 'both' }, margins))
  }

  const defaults = made('defaults', {},
    scaling,
    pageLayout.length ? made('page-layout', {}, pageLayout) : null,
    customStyles.intervalBetweenStaves
      ? made('staff-layout', {}, made('staff-distance', {},
        String(Number(customStyles.intervalBetweenStaves) * 10)))
      : null,
    customStyles.intervalBetweenPageLines
      ? made('system-layout', {}, made('system-distance', {},
        String(Number(customStyles.intervalBetweenPageLines) * 10)))
      : null)

  const credits = []
  if (pageSchema.title) {
    credits.push(made('credit', { page: '1' },
      made('credit-type', {}, 'title'),
      made('credit-words', {}, pageSchema.title)))
  }

  const root = made('score-partwise', { version: '4.0' },
    pageSchema.title ? made('work', {}, made('work-title', {}, pageSchema.title)) : null,
    pageSchema.subtitle ? made('movement-title', {}, pageSchema.subtitle) : null,
    identification,
    defaults,
    credits,
    partListOf(pageSchema, parts),
    parts.map((part) => partOf(part, pageSchema, spans, midiSettings, report)))

  return {
    xml: serializeXml(root, {
      doctype: '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN"' +
        ' "http://www.musicxml.org/dtds/partwise.dtd">'
    }),
    report: report.read()
  }
}

/**
 * One part: its share of every measure on the page.
 */
function partOf(part, pageSchema, spans, midiSettings, report) {
  const measures = []
  const state = {
    clefs: new Map(), keySignature: null, timeSignature: null, pageLine: null,
    // Which voices are in the middle of a tie as the barline goes by.
    tiedInto: new Map()
  }

  pageSchema.measuresParams.forEach((measure, index) => {
    measures.push(measureOf({ measure, index, part, state, spans, midiSettings, pageSchema, report }))
  })

  return made('part', { id: part.id }, measures)
}

function measureOf({ measure, index, part, state, spans, midiSettings, pageSchema, report }) {
  const children = []

  // A page line break is a new system for every part that shows it.
  const startsPageLine = state.pageLine !== null && measure.pageLineNumber !== state.pageLine
  const numbering = index === 0 && pageSchema.showMeasureNumbers
    ? made('measure-numbering', {}, {
      first: 'system', all: 'measure', last: 'system', 'first&last': 'system'
    }[pageSchema.showMeasureNumbers] || 'system')
    : null
  if (startsPageLine || numbering) {
    children.push(made('print', { 'new-system': startsPageLine ? 'yes' : null }, numbering))
  }
  state.pageLine = measure.pageLineNumber

  // --- what changed since the measure before ---
  const attributes = []
  if (index === 0) {
    attributes.push(made('divisions', {}, String(DIVISIONS)))
  }

  if (measure.keySignatureName && (startsPageLine || measure.keySignatureName !== state.keySignature)) {
    state.keySignature = measure.keySignatureName
    const fifths = FIFTHS_BY_KEY_SIGNATURE[measure.keySignatureName]
    if (fifths !== undefined) {
      attributes.push(made('key', {}, made('fifths', {}, String(fifths)), made('mode', {}, 'major')))
    }
  }

  const time = measure.timeSignatureParams
  const timeAt = time ? JSON.stringify(time) : null
  if (time && (startsPageLine || timeAt !== state.timeSignature)) {
    state.timeSignature = timeAt
    attributes.push(time.cMode
      ? made('time', { symbol: time.crossed ? 'cut' : 'common' },
        made('beats', {}, time.crossed ? '2' : '4'),
        made('beat-type', {}, time.crossed ? '2' : '4'))
      : made('time', {},
        made('beats', {}, String(time.numerator || '4')),
        made('beat-type', {}, String(time.denominator || '4'))))
  }

  if (index === 0 && part.staves.length > 1) {
    attributes.push(made('staves', {}, String(part.staves.length)))
  }

  /*
  A bar counted as several, or drawn as a slash standing for the bar before it,
  is a `<measure-style>` rather than anything to do with the notes in it.
  */
  const repeated = measure.similePreviousMeasureCount || measure.simileTwoPreviousMeasuresCount
  if (measure.multiMeasureRestCount) {
    attributes.push(made('measure-style', {},
      made('multiple-rest', {}, String(measure.multiMeasureRestCount))))
  } else if (repeated) {
    attributes.push(made('measure-style', {},
      made('measure-repeat', {
        type: 'start',
        slashes: measure.simileTwoPreviousMeasuresCount ? '2' : '1'
      }, String(measure.simileTwoPreviousMeasuresCount ? 2 : 1))))
  }

  part.staves.forEach((staveIndex, position) => {
    const stave = (measure.stavesParams || [])[staveIndex]
    const clef = (stave && stave.clef) || state.clefs.get(staveIndex)
    if (clef && (startsPageLine || state.clefs.get(staveIndex) !== clef)) {
      state.clefs.set(staveIndex, clef)
      const shape = clefShape(clef)
      if (shape) {
        attributes.push(made('clef', { number: String(position + 1) },
          made('sign', {}, shape.sign),
          made('line', {}, String(shape.line)),
          shape.octaveChange ? made('clef-octave-change', {}, String(shape.octaveChange)) : null))
      }
    }
  })

  if (attributes.length) {
    children.push(made('attributes', {}, attributes))
  }

  // --- the measure's own marks ---
  if (measure.openingBarLineName) {
    children.push(made('barline', { location: 'left' },
      made('bar-style', {}, OPENING_BAR_STYLES_BY_NAME[measure.openingBarLineName] || 'regular'),
      measure.repeatDotsMarkAtTheStart ? made('repeat', { direction: 'forward' }) : null))
  } else if (measure.repeatDotsMarkAtTheStart) {
    children.push(made('barline', { location: 'left' },
      made('bar-style', {}, 'heavy-light'),
      made('repeat', { direction: 'forward' })))
  }

  if (index === 0 && midiSettings.defaultTempo) {
    const beats = String(midiSettings.defaultTempo).match(/(\d+)\s*"?$/)
    if (beats) {
      children.push(made('direction', { placement: 'above' },
        made('direction-type', {}, made('metronome', {},
          made('beat-unit', {}, 'quarter'),
          made('per-minute', {}, beats[1]))),
        made('sound', { tempo: beats[1] })))
    }
  }
  if (measure.tempoMark) {
    children.push(tempoDirectionOf(measure.tempoMark))
  }

  /*
  The marks that tell a player where to jump. A page says which end of the
  measure they sit at; MusicXML places them by where the direction is written,
  so one at the end is written after the notes — see below.
  */
  if (measure.sign && measure.sign.measurePosition !== 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('segno', {})), made('sound', { segno: 'segno' })))
  }
  if (measure.coda && measure.coda.measurePosition !== 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('coda', {})), made('sound', { coda: 'coda' })))
  }
  if (measure.repetitionNote && measure.repetitionNote.measurePosition !== 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('rehearsal', {}, measure.repetitionNote.value || ''))))
  }

  // --- the notes ---
  const accidentals = {
    fromKey: keySignatureAlters(state.keySignature),
    inBar: {}
  }

  let voiceNumber = 0
  let lastWritten = 0
  part.staves.forEach((staveIndex, position) => {
    const stave = (measure.stavesParams || [])[staveIndex]
    const clef = state.clefs.get(staveIndex) || 'treble'
    const voices = (stave && stave.voicesParams) || []

    voices.forEach((units) => {
      const sounding = units.filter((unit) => !unit.isSimile)
      if (!sounding.length) {
        return
      }
      voiceNumber++

      /*
      Go back to the start of the measure for the next voice — by exactly what
      the voice before it wrote, not by the longest voice in the measure. Voices
      are rarely the same length, and backing up further than was written lands
      before the barline, which puts the notes that follow in the measure before.
      */
      if (voiceNumber > 1 && lastWritten > 0) {
        children.push(made('backup', {}, made('duration', {}, String(lastWritten))))
      }

      let written = 0
      /*
      A tie may cross a barline, so whether this voice is being tied into is
      remembered on the part rather than reset with every measure.
      */
      const voiceAt = `${staveIndex}|${voiceNumber}`
      let tiedInto = Boolean(state.tiedInto && state.tiedInto.get(voiceAt))
      let ratio = null

      sounding.forEach((unit, at) => {
        // A tuplet shortens every note from its opening mark to its closing one.
        for (const tuplet of unit.tupletMarks || []) {
          if (!tuplet.finish) {
            ratio = tupletRatio(tuplet.value)
          }
        }
        /*
        A chord symbol belongs before the note it sits over.
        */
        if (unit.relatedChordLetter && unit.relatedChordLetter.textValue) {
          children.push(harmonyOf(unit.relatedChordLetter))
        }

        /*
        A simile standing for the beat before it is a `<measure-style>` on the
        attributes, which a page keeps on the unit instead.
        */
        if (unit.simileMark && unit.simileMark.count && at === 0) {
          children.push(made('attributes', {}, made('measure-style', {},
            made('beat-repeat', { type: 'start', slashes: '1' }))))
        }

        children.push(...directionsOf(unit, position + 1, spans))
        children.push(...noteElementsOf(unit, {
          clef, voice: voiceNumber, staff: position + 1, accidentals, spans, tiedInto, ratio
        }))

        // Whether the note after this one closes a tie this one opened.
        tiedInto = Boolean(unit.tiedWithNext)
        // A grace note is stolen from its neighbour and takes no time of its own.
        written += unit.isGrace ? 0 : durationOf(unit, ratio)

        if ((unit.tupletMarks || []).some((one) => one.finish)) {
          ratio = null
        }
        void at
      })
      if (state.tiedInto) {
        state.tiedInto.set(voiceAt, tiedInto)
      }
      lastWritten = written
    })
  })

  void pageSchema

  if (measure.sign && measure.sign.measurePosition === 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('segno', {})), made('sound', { segno: 'segno' })))
  }
  if (measure.coda && measure.coda.measurePosition === 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('coda', {})), made('sound', { coda: 'coda' })))
  }
  if (measure.repetitionNote && measure.repetitionNote.measurePosition === 'end') {
    children.push(made('direction', { placement: 'above' },
      made('direction-type', {}, made('rehearsal', {}, measure.repetitionNote.value || ''))))
  }

  // --- how the measure closes ---
  const closing = []
  const style = BAR_STYLES_BY_NAME[measure.closingBarLineName]
  if (style && measure.closingBarLineName !== 'barLine') {
    closing.push(made('bar-style', {}, style))
  }
  if (measure.voltaMark) {
    const volta = measure.voltaMark
    /*
    The mark that names the bracket is the one that opens it. `startsHere` is
    not the test: a page sets it on the closing measure too, so going by it
    writes an opening where an ending belongs and leaves the bracket unclosed.
    */
    if (volta.value !== undefined) {
      closing.push(made('ending', { number: '1', type: 'start' }, volta.value))
    }
    if (volta.finishesHere || volta.finishesAfter) {
      closing.push(made('ending', { number: '1', type: 'stop' }))
    }
  }
  if (measure.repeatDotsMarkAtTheEnd) {
    closing.push(made('repeat', { direction: 'backward' }))
  }
  if (measure.endsWithFermata) {
    closing.push(made('fermata', {}))
  }
  if (closing.length) {
    children.push(made('barline', { location: 'right' }, closing))
  }

  return made('measure', { number: String(index + 1) }, children)
}

/*
The note value a metronome mark names, read back from the way a page spells it.
*/
const BEAT_UNITS = {
  '4': 'long', '2': 'breve', '1': 'whole', '1/2': 'half', '1/4': 'quarter',
  '1/8': 'eighth', '1/16': '16th', '1/32': '32nd', '1/64': '64th',
  whole: 'whole', half: 'half', quarter: 'quarter', eighth: 'eighth',
  sixteenth: '16th', 'thirty second': '32nd', 'sixty fourth': '64th'
}

/**
 * A tempo mark, as a metronome where it names a note value and a number, and as
 * words where it does not.
 *
 * A page keeps the mark in parts, with the note symbols on their own, which is
 * exactly the seam MusicXML needs to write a real `<metronome>` rather than a
 * string that happens to read like one.
 */
function tempoDirectionOf(tempoMark) {
  const parts = tempoMark.textValueParts || []
  const unit = parts.map((part) => BEAT_UNITS[part]).find(Boolean)
  const perMinute = parts.join('').match(/=\s*(\d+)/)

  if (unit && perMinute) {
    return made('direction', { placement: 'above' },
      made('direction-type', {}, made('metronome', {},
        made('beat-unit', {}, unit),
        made('per-minute', {}, perMinute[1]))),
      made('sound', { tempo: perMinute[1] }))
  }
  return made('direction', { placement: 'above' },
    made('direction-type', {}, made('words', {}, parts.join(''))))
}

/**
 * One unit as its `<note>` elements — one per note, the rest marked `<chord>`.
 */
function noteElementsOf(unit, { clef, voice, staff, accidentals, spans, tiedInto, ratio }) {
  const duration = durationOf(unit, ratio)
  const type = NOTE_TYPES_BY_DURATION[unit.unitDuration] || 'quarter'
  const notations = notationsOf(unit, spans, tiedInto)
  const lyrics = lyricsOf(unit)

  if (unit.isRest) {
    return [ made('note', {},
      // A whole-measure rest is a rest that says so, not a rest of some length.
      made('rest', { measure: unit.isFullMeasure ? 'yes' : null }),
      made('duration', {}, String(duration)),
      made('voice', {}, String(voice)),
      made('type', {}, type),
      Array.from({ length: unit.numberOfDots || 0 }, () => made('dot', {})),
      ratio ? made('time-modification', {},
        made('actual-notes', {}, String(ratio.actual)),
        made('normal-notes', {}, String(ratio.normal))) : null,
      made('staff', {}, String(staff)),
      notations) ]
  }

  return (unit.notes || []).map((note, index) => {
    const { element, drawn } = pitchOf(note, unit, clef, accidentals)
    const beam = unit.beamedWithNext === undefined
      ? null
      : made('beam', { number: '1' }, unit.beamedWithNext ? 'begin' : 'end')

    /*
    A ghost note is drawn as a cross, and a note the page puts in brackets is
    drawn parenthesised — both of which MusicXML says on the notehead.
    */
    const ghost = note.isGhost || unit.isGhost
    const bracketed = (unit.parentheses || []).some((one) =>
      one.appliedToWholeUnit ||
      (one.fromNoteIndex <= index && index <= one.toNoteIndex)
    )
    const notehead = ghost || bracketed
      ? made('notehead', { parentheses: bracketed ? 'yes' : null }, ghost ? 'x' : 'normal')
      : null

    return made('note', {
      // A page nudges a unit sideways in stave-line widths; MusicXML in tenths.
      'relative-x': unit.relatedXCorrection ? String(unit.relatedXCorrection * 10) : null
    },
    index > 0 ? made('chord', {}) : null,
    unit.isGrace ? made('grace', { slash: unit.hasGraceCrushLine ? 'yes' : null }) : null,
    element,
    unit.isGrace ? null : made('duration', {}, String(duration)),
    /*
    `<tie>` is what sounds and `<tied>` is what is drawn. A reader that plays
    the file needs the first; one that engraves it needs the second.
    */
    (tiedInto || unit.tiedBefore || unit.tiedBeforeMeasure) ? made('tie', { type: 'stop' }) : null,
    (unit.tiedWithNext || unit.tiedAfter || unit.tiedAfterMeasure) ? made('tie', { type: 'start' }) : null,
    made('voice', {}, String(voice)),
    made('type', {}, type),
    Array.from({ length: unit.numberOfDots || 0 }, () => made('dot', {})),
    ratio ? made('time-modification', {},
      made('actual-notes', {}, String(ratio.actual)),
      made('normal-notes', {}, String(ratio.normal))) : null,
    drawn && accidentalShape(drawn.keyType)
      ? made('accidental', { parentheses: drawn.withParentheses ? 'yes' : null },
        accidentalShape(drawn.keyType).accidental)
      : null,
    unit.stemDirection ? made('stem', {}, unit.stemDirection) : null,
    notehead,
    made('staff', {}, String(staff)),
    index === 0 && unit.unitDuration <= 0.125 ? beam : null,
    index === 0 ? notations : null,
    index === 0 ? lyrics : null)
  })
}
