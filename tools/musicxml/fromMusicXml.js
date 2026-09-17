'use strict'

/**
 * MusicXML in, a MuSemantiQ page out.
 *
 * The two formats disagree about what the outermost thing is. MusicXML is a list
 * of parts, each holding its own run of measures; a MuSemantiQ page is a list of
 * measures, each holding the staves sounding at that moment. So the work is a
 * transpose — walk every part's measure N together and lay their staves side by
 * side — plus the vocabulary, which lives in `vocabulary.js`.
 *
 * Two things a caller should know:
 *
 *  - Nothing is guessed. A MusicXML feature a page cannot hold is dropped and
 *    named in `report.unsupported`, so an import that lost something says so
 *    rather than quietly engraving less than the file contained.
 *  - Spans are paired here. MusicXML marks a slur, a tuplet, a hairpin and the
 *    rest with a `start` on one note and a `stop` on another, identified by
 *    number; a page marks both ends with the same key and flags the last one
 *    `finish`. Pairing is what most of the bookkeeping below is for.
 */

import {
  parseXml, elements, element, text, textOf, numberOf, attribute
} from '#tools/musicxml/xml.js'
import {
  clefNamed, KEY_SIGNATURES_BY_FIFTHS, DURATIONS_BY_NOTE_TYPE, durationFromFraction,
  keyTypeFromAccidental, keyTypeFromAlter, markFromXml, ORNAMENT_VARIANTS,
  BAR_NAMES_BY_STYLE, GLISSANDO_FORMS_BACK, directionOfPlacement
} from '#tools/musicxml/vocabulary.js'

/**
 * A partwise score, whatever flavour the file is written in.
 *
 * `score-timewise` nests the other way round — measure then part — and is rare
 * enough that rather than teach the walk below about both, it is turned inside
 * out first.
 */
function partwise(root, report) {
  if (root.name === 'score-partwise') {
    return root
  }
  if (root.name !== 'score-timewise') {
    throw new Error(`expected <score-partwise>, found <${root.name}>`)
  }

  const parts = new Map()
  for (const measure of elements(root, 'measure')) {
    for (const part of elements(measure, 'part')) {
      const id = attribute(part, 'id')
      if (!parts.has(id)) {
        parts.set(id, { name: 'part', attributes: { id }, children: [] })
      }
      parts.get(id).children.push({
        name: 'measure', attributes: { ...measure.attributes }, children: part.children
      })
    }
  }
  report.note('the score was written timewise and has been turned partwise')
  return {
    name: 'score-partwise',
    attributes: root.attributes,
    children: [
      ...elements(root).filter((child) => child.name !== 'measure'),
      ...parts.values()
    ]
  }
}

/**
 * What the page could not hold, collected rather than thrown away silently.
 */
function madeReport() {
  const unsupported = new Map()
  const notes = []
  return {
    drop(what, where) {
      const seen = unsupported.get(what) || { what, count: 0, first: where }
      seen.count++
      unsupported.set(what, seen)
    },
    note(what) {
      notes.push(what)
    },
    read() {
      return { unsupported: [ ...unsupported.values() ], notes }
    }
  }
}

// --- the page's own settings ------------------------------------------------

function readCustomStyles(root, report) {
  const styles = {}
  const defaults = element(root, 'defaults')
  if (!defaults) {
    return styles
  }

  /*
  MusicXML measures a page in tenths of the distance between two stave lines,
  scaled to millimetres. A MuSemantiQ page is measured in that distance itself,
  so a length in tenths divided by ten is already the number wanted.
  */
  const layout = element(defaults, 'page-layout')
  if (layout) {
    const height = numberOf(layout, 'page-height')
    const width = numberOf(layout, 'page-width')
    const margins = element(layout, 'page-margins')
    if (height !== null) {
      styles.pageHeight = String(Math.round(height))
    }
    if (width !== null) {
      styles.pageLineMaxWidth = String(Math.round(width))
    }
    if (margins) {
      const left = numberOf(margins, 'left-margin')
      const top = numberOf(margins, 'top-margin')
      const bottom = numberOf(margins, 'bottom-margin')
      if (left !== null) {
        styles.pageLeftAndRightPadding = String(Math.round(left / 10))
      }
      if (top !== null) {
        styles.pageTopPadding = String(Math.round(top / 10))
      }
      if (bottom !== null) {
        styles.pageBottomPadding = String(Math.round(bottom / 10))
      }
    }
  }

  const system = element(defaults, 'system-layout')
  const between = system && numberOf(system, 'system-distance')
  if (between !== null && between !== undefined) {
    styles.intervalBetweenPageLines = String(Math.round(between / 10))
  }

  const stave = element(defaults, 'staff-layout')
  const staveDistance = stave && numberOf(stave, 'staff-distance')
  if (staveDistance !== null && staveDistance !== undefined) {
    styles.intervalBetweenStaves = String(Math.round(staveDistance / 10))
  }

  if (element(defaults, 'appearance')) {
    report.drop('<appearance> line widths and note sizes', 'defaults')
  }
  return styles
}

function readMidiSettings(root) {
  const settings = {}
  for (const part of elements(element(root, 'part-list'), 'score-part')) {
    const instrument = element(part, 'midi-instrument')
    const name = textOf(part, 'part-name')
    if (!settings.defaultInstrument && (instrument || name)) {
      const named = textOf(element(part, 'score-instrument'), 'instrument-name') || name
      if (named) {
        settings.defaultInstrument = named.toLowerCase()
      }
    }
  }
  // The first tempo the score states stands for the page.
  for (const part of elements(root, 'part')) {
    for (const measure of elements(part, 'measure')) {
      for (const direction of elements(measure, 'direction')) {
        const sound = element(direction, 'sound')
        const tempo = sound && attribute(sound, 'tempo')
        if (tempo) {
          return { ...settings, defaultTempo: `"1/4 = ${Math.round(Number(tempo))}"` }
        }
      }
    }
  }
  return settings
}

function readPageMeta(root) {
  const meta = {}
  const title = textOf(element(root, 'work'), 'work-title') || textOf(root, 'movement-title')
  if (title) {
    meta.title = title
  }
  const subtitle = textOf(element(root, 'work'), 'work-number') || textOf(root, 'movement-number')
  if (subtitle) {
    meta.subtitle = subtitle
  }
  for (const creator of elements(element(root, 'identification'), 'creator')) {
    const role = attribute(creator, 'type')
    if (role === 'composer' && !meta.leftSubtitle) {
      meta.leftSubtitle = text(creator)
    }
    if ((role === 'lyricist' || role === 'poet') && !meta.rightSubtitle) {
      meta.rightSubtitle = text(creator)
    }
  }
  return meta
}

// --- the parts, and which stave each of their staves becomes ----------------

/**
 * Lay the parts out as staves.
 *
 * A part with `<staves>2` — a keyboard — becomes two staves of the page, so the
 * part's own staff numbers have to be shifted by everything declared before it.
 */
function readParts(root) {
  const named = new Map()
  for (const score of elements(element(root, 'part-list'), 'score-part')) {
    named.set(attribute(score, 'id'), textOf(score, 'part-name'))
  }

  const parts = []
  let firstStave = 0
  for (const part of elements(root, 'part')) {
    const id = attribute(part, 'id')
    const measures = elements(part, 'measure')
    const staves = measures.reduce((most, measure) => {
      const count = numberOf(element(measure, 'attributes'), 'staves')
      return count === null ? most : Math.max(most, count)
    }, 1)
    parts.push({ id, name: named.get(id) || '', measures, staves, firstStave })
    firstStave += staves
  }
  return { parts, staveCount: firstStave }
}

/**
 * The brace and bracket a `<part-group>` asks for, over the staves it covers.
 */
function readConnections(root, parts) {
  const connections = []
  const open = []
  let index = 0

  for (const child of elements(element(root, 'part-list'))) {
    if (child.name === 'score-part') {
      index++
      continue
    }
    if (child.name !== 'part-group') {
      continue
    }
    if (attribute(child, 'type') === 'start') {
      open.push({ at: index, symbol: textOf(child, 'group-symbol') })
      continue
    }
    const started = open.pop()
    if (!started) {
      continue
    }
    const from = parts[started.at]
    const to = parts[index - 1]
    if (!from || !to) {
      continue
    }
    const name = started.symbol === 'brace' ? 'brace' : 'bracket'
    connections.push({
      name,
      staveStartNumber: from.firstStave,
      staveEndNumber: to.firstStave + to.staves - 1
    })
  }

  /*
  A part written on several staves is one instrument on a brace — a keyboard —
  and every reader draws it that way without being told. A page has to be told,
  so the brace is made explicit, unless the file already asked for one over the
  same staves.
  */
  for (const part of parts) {
    if (part.staves < 2) {
      continue
    }
    const from = part.firstStave
    const to = part.firstStave + part.staves - 1
    const already = connections.some((one) =>
      one.staveStartNumber === from && one.staveEndNumber === to
    )
    if (!already) {
      connections.push({ name: 'brace', staveStartNumber: from, staveEndNumber: to })
    }
  }

  return connections
}

// --- one note ---------------------------------------------------------------

const STEPS = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ]

/**
 * Read a `<note>` into the note a unit holds.
 */
function readNote(node, report) {
  const pitch = element(node, 'pitch') || element(node, 'unpitched')
  if (!pitch) {
    return {}
  }
  const step = textOf(pitch, 'step').toLowerCase() ||
    textOf(pitch, 'display-step').toLowerCase()
  if (!STEPS.includes(step)) {
    report.drop(`a note on step "${step}"`, 'note')
    return {}
  }
  const note = { noteName: step }
  const octave = numberOf(pitch, 'octave')
  const shown = numberOf(pitch, 'display-octave')
  const which = octave === null ? shown : octave
  if (which !== null) {
    note.octaveNumber = String(which)
  }
  return note
}

/**
 * The accidental a note draws, which is what a page records — MusicXML also
 * says what it sounds, and the two only differ where a key signature is doing
 * the work.
 */
function readAccidental(node) {
  const drawn = element(node, 'accidental')
  if (drawn) {
    const keyType = keyTypeFromAccidental(text(drawn))
    if (keyType) {
      return {
        keyType,
        withParentheses: attribute(drawn, 'parentheses') === 'yes' || undefined
      }
    }
  }
  return null
}

/**
 * How long the note lasts, as the fraction of a whole note a page counts in.
 *
 * `<type>` says it outright and is trusted when present. Without one the only
 * evidence is `<duration>` against the measure's divisions, which a tuplet
 * makes fractional — so it is rounded to the nearest value that can be drawn.
 */
function readDuration(node, divisions, report) {
  const type = textOf(node, 'type')
  if (type && DURATIONS_BY_NOTE_TYPE[type] !== undefined) {
    return DURATIONS_BY_NOTE_TYPE[type]
  }
  if (type) {
    report.drop(`a note of type "${type}"`, 'note')
  }
  const duration = numberOf(node, 'duration')
  if (duration === null || !divisions) {
    return 0.25
  }
  return durationFromFraction(duration / divisions / 4)
}

/**
 * Everything hanging off one note that a page keeps on the unit.
 */
function readNotations(node, unit, spans, report) {
  const notations = element(node, 'notations')
  if (!notations) {
    return
  }

  for (const group of elements(notations)) {
    switch (group.name) {
      case 'tied': {
        const type = attribute(group, 'type')
        const direction = attribute(group, 'placement')
        if (type === 'start') {
          unit.tiedWithNext = {}
          if (direction) {
            unit.tiedWithNext.direction = directionOfPlacement(direction)
          }
        }
        break
      }

      case 'slur': {
        const number = attribute(group, 'number') || '1'
        const type = attribute(group, 'type')
        if (type === 'start') {
          const key = spans.open('slur', number)
          const mark = { key }
          const placement = attribute(group, 'placement')
          if (placement) {
            mark.direction = directionOfPlacement(placement)
          }
          ;(unit.slurMarks = unit.slurMarks || []).push(mark)
        } else if (type === 'stop') {
          const key = spans.close('slur', number)
          if (key) {
            ;(unit.slurMarks = unit.slurMarks || []).push({ key, finish: true })
          }
        }
        break
      }

      case 'tuplet': {
        const number = attribute(group, 'number') || '1'
        const type = attribute(group, 'type')
        if (type === 'start') {
          const key = spans.open('tuplet', number)
          const mark = { key, value: String(spans.tupletValue || 3) }
          if (attribute(group, 'bracket') === 'yes') {
            mark.withBrackets = true
          }
          const placement = attribute(group, 'placement')
          if (placement) {
            mark.direction = directionOfPlacement(placement)
          }
          ;(unit.tupletMarks = unit.tupletMarks || []).push(mark)
        } else if (type === 'stop') {
          const key = spans.close('tuplet', number)
          if (key) {
            ;(unit.tupletMarks = unit.tupletMarks || []).push({ key, finish: true })
          }
        }
        break
      }

      case 'articulations':
      case 'technical':
      case 'ornaments': {
        for (const mark of elements(group)) {
          if (mark.name === 'breath-mark') {
            unit.breathMarkBefore = {
              type: text(mark) === 'tick' ? 'double slash' : 'comma'
            }
            continue
          }
          if (mark.name === 'fingering' || mark.name === 'string') {
            const note = unit.notes[0] || {}
            ;(unit.keysParams = unit.keysParams || []).push({
              ...note, keyType: 'noteLetter', textValue: text(mark)
            })
            continue
          }
          if (mark.name === 'tremolo') {
            const strokes = Number(text(mark)) || 3
            unit.tremoloParams = {
              type: attribute(mark, 'type') === 'start' ? 'withNext' : 'single'
            }
            if (strokes !== 3) {
              unit.tremoloParams.customNumberOfTremoloStrokes = strokes
            }
            continue
          }
          const variant = ORNAMENT_VARIANTS[mark.name]
          if (variant) {
            ;(unit.articulationParams = unit.articulationParams || []).push({ ...variant })
            continue
          }
          const known = markFromXml(mark.name)
          if (!known) {
            if (mark.name !== 'wavy-line' && mark.name !== 'accidental-mark') {
              report.drop(`<${mark.name}>`, group.name)
            }
            continue
          }
          const articulation = { name: known.name }
          const placement = attribute(mark, 'placement')
          if (placement) {
            articulation.direction = directionOfPlacement(placement)
          }
          ;(unit.articulationParams = unit.articulationParams || []).push(articulation)
        }
        // A trill written with a wavy line carries it in MuSemantiQ too.
        if (group.name === 'ornaments' && element(group, 'wavy-line')) {
          const trill = (unit.articulationParams || []).find((one) => one.name === 'trill')
          if (trill) {
            trill.withWave = true
          }
        }
        break
      }

      case 'fermata': {
        ;(unit.articulationParams = unit.articulationParams || []).push({
          name: 'fermata',
          direction: attribute(group, 'type') === 'inverted' ? 'down' : 'up'
        })
        break
      }

      case 'dynamics': {
        const written = elements(group).map((one) => one.name).join('')
        if (written) {
          const placement = attribute(group, 'placement')
          ;(unit.articulationParams = unit.articulationParams || []).push({
            name: 'dynamicMark',
            textValue: written,
            ...(placement ? { direction: directionOfPlacement(placement) } : {})
          })
        }
        break
      }

      case 'arpeggiate': {
        unit.arpeggiated = {}
        const arrow = attribute(group, 'direction')
        if (arrow === 'up' || arrow === 'down') {
          unit.arpeggiated.arrow = arrow
        }
        break
      }

      case 'glissando':
      case 'slide': {
        const type = attribute(group, 'type')
        const number = attribute(group, 'number') || '1'
        const form = GLISSANDO_FORMS_BACK[group.name] || 'line'
        if (type === 'start') {
          const key = spans.open('glissando', number)
          ;(unit.glissandoMarks = unit.glissandoMarks || []).push({ key, form })
        } else if (type === 'stop') {
          const key = spans.close('glissando', number)
          if (key) {
            ;(unit.glissandoMarks = unit.glissandoMarks || []).push({ key, form })
          }
        }
        break
      }

      case 'tremolo': {
        const strokes = Number(text(group)) || 3
        unit.tremoloParams = {
          type: attribute(group, 'type') === 'start' ? 'withNext' : 'single'
        }
        if (strokes && strokes !== 3) {
          unit.tremoloParams.customNumberOfTremoloStrokes = strokes
        }
        break
      }

      default:
        break
    }
  }
}

function readLyrics(node, unit) {
  for (const lyric of elements(node, 'lyric')) {
    const words = elements(lyric, 'text').map(text).join('')
    if (!words) {
      continue
    }
    const syllabic = textOf(lyric, 'syllabic')
    const entry = { textValue: words }
    if (syllabic === 'begin' || syllabic === 'middle') {
      entry.dashAfter = true
    }
    if (element(lyric, 'extend')) {
      entry.underscoreStarts = true
    }
    ;(unit.relatedLyrics = unit.relatedLyrics || []).push(entry)
  }
}

// --- pairing the spans ------------------------------------------------------

/**
 * Keys for the things that run between two notes.
 *
 * MusicXML tells the two ends apart by a number that is reused as soon as the
 * span closes; a page needs a key unique for the whole page, so a fresh one is
 * minted at every `start` and remembered until its `stop`.
 */
function madeSpans() {
  const open = new Map()
  const counts = {}
  return {
    tupletValue: 3,
    open(kind, number) {
      counts[kind] = (counts[kind] || 0) + 1
      const key = `${kind}-${counts[kind]}`
      open.set(`${kind}|${number}`, key)
      return key
    },
    close(kind, number) {
      const at = `${kind}|${number}`
      const key = open.get(at)
      open.delete(at)
      return key || null
    },
    peek(kind, number) {
      return open.get(`${kind}|${number}`) || null
    }
  }
}

export default function fromMusicXml(source) {
  const report = madeReport()
  const root = partwise(parseXml(source), report)

  const { parts, staveCount } = readParts(root)
  if (!parts.length) {
    throw new Error('the score has no parts')
  }

  const connections = readConnections(root, parts)
  const spans = madeSpans()

  const measureCount = parts.reduce((most, part) => Math.max(most, part.measures.length), 0)
  const measuresParams = []

  // What carries from one measure to the next, per part.
  const divisionsOf = new Map(parts.map((part) => [ part.id, 1 ]))
  const clefOf = new Map()
  let pageLineNumber = 1
  let previousPageLine = null
  let measureNumbering = null

  for (let index = 0; index < measureCount; index++) {
    const measure = {
      closingBarLineName: 'barLine',
      pageLineNumber,
      stavesParams: Array.from({ length: staveCount }, () => ({ voicesParams: [] }))
    }

    /*
    Where the page line breaks is settled before the measure is read, because a
    measure that begins a line has to restate the clef its stave is in — a
    system with no clef is not a system MuSemantiQ can lay out.

    The break belongs to the page rather than to the part that asked for it, so
    only the first part is believed.
    */
    const opening = parts[0] && parts[0].measures[index]
    const print = opening && element(opening, 'print')
    const numbering = print && element(print, 'measure-numbering')
    if (numbering && !measureNumbering) {
      measureNumbering = { system: 'first', measure: 'all', none: null }[text(numbering)] || null
    }
    if (print && index > 0 && attribute(print, 'new-system') === 'yes') {
      pageLineNumber++
      measure.pageLineNumber = pageLineNumber
    }
    if (print && index > 0 && attribute(print, 'new-page') === 'yes') {
      report.drop('a page break, which becomes a line break', 'print')
    }
    const startsPageLine = index === 0 || measure.pageLineNumber !== previousPageLine
    previousPageLine = measure.pageLineNumber

    for (const part of parts) {
      const source = part.measures[index]
      if (!source) {
        continue
      }
      readMeasureOfPart({
        source, part, measure, spans, report, divisionsOf, clefOf, startsPageLine
      })
    }

    // Every stave needs at least one voice, even where a part fell silent.
    for (const stave of measure.stavesParams) {
      if (!stave.voicesParams.length) {
        stave.voicesParams.push([])
      }
    }

    /*
    A brace or bracket opens every system, not only the first, so it is restated
    on the measure that begins each page line — the same way the clef is.
    */
    if (startsPageLine && connections.length) {
      measure.connectionsParams = connections.map((one) => ({ ...one }))
    }
    if (index === 0) {
      const titles = parts
        .filter((part) => part.name.trim())
        .map((part) => ({
          value: part.name.trim(),
          staveNumber: part.firstStave,
          staveStartNumber: part.firstStave
        }))
      if (titles.length) {
        measure.instrumentTitlesParams = titles
      }
    }

    measuresParams.push(measure)
  }

  /*
  Where each measure sits on the page.

  The parser works these out and the drawer lays the page out from them — a
  system is closed by `isLastMeasureOnPageLine`, not by the page line number
  changing — so a page built by hand has to fill them in or every measure is
  drawn on one endless line.
  */
  measuresParams.forEach((one, at) => {
    one.pageIndex = 0
    one.measureIndexOnPage = at
    const next = measuresParams[at + 1]
    one.isLastMeasureOnPageLine = Boolean(next && next.pageLineNumber !== one.pageLineNumber)
  })

  const pageSchema = { ...readPageMeta(root), measuresParams }
  if (measureNumbering) {
    pageSchema.showMeasureNumbers = measureNumbering
  }

  return {
    pageSchema,
    customStyles: readCustomStyles(root, report),
    midiSettings: readMidiSettings(root),
    report: report.read()
  }
}

/**
 * One part's share of one measure, laid into the staves it occupies.
 */
function readMeasureOfPart({
  source, part, measure, spans, report, divisionsOf, clefOf, startsPageLine
}) {
  const changed = new Set()
  const attributes = element(source, 'attributes')
  if (attributes) {
    const divisions = numberOf(attributes, 'divisions')
    if (divisions) {
      divisionsOf.set(part.id, divisions)
    }

    const key = element(attributes, 'key')
    const fifths = key && numberOf(key, 'fifths')
    if (fifths !== null && fifths !== undefined && KEY_SIGNATURES_BY_FIFTHS[String(fifths)]) {
      measure.keySignatureName = KEY_SIGNATURES_BY_FIFTHS[String(fifths)]
    }

    const time = element(attributes, 'time')
    if (time) {
      const symbol = attribute(time, 'symbol')
      if (element(time, 'senza-misura')) {
        report.drop('a senza misura time signature', 'time')
      } else if (symbol === 'common' || symbol === 'cut') {
        measure.timeSignatureParams = { cMode: true, crossed: symbol === 'cut' }
      } else {
        /*
        MusicXML writes an additive signature as `3+2`, and a complex one as
        several `<beats>`/`<beat-type>` pairs. A page draws one number over
        another, so the beats are added up — `3+2/8` becomes `5/8`, which is the
        same measure length even though it loses how the bar is grouped.
        */
        const beatsParts = elements(time, 'beats').map(text)
        const beatTypes = elements(time, 'beat-type').map(text)
        const added = beatsParts
          .flatMap((part) => part.split('+'))
          .map((part) => Number(part.trim()))
        const denominator = beatTypes[0]

        if (added.length && added.every(Number.isFinite) && /^\d+$/.test(denominator || '')) {
          if (beatsParts.length > 1 || beatsParts.some((part) => part.includes('+'))) {
            report.drop('how an additive or complex time signature is grouped', 'time')
          }
          measure.timeSignatureParams = {
            numerator: String(added.reduce((sum, one) => sum + one, 0)),
            denominator
          }
        } else if (beatsParts.length) {
          report.drop(`a time signature of ${beatsParts.join(' ')}/${denominator || '?'}`, 'time')
        }
      }
    }

    /*
    A bar counted as several, or drawn as a slash for the bar before it, is a
    `<measure-style>` rather than anything in the notes.
    */
    for (const style of elements(attributes, 'measure-style')) {
      const multiple = element(style, 'multiple-rest')
      if (multiple) {
        measure.multiMeasureRestCount = text(multiple)
      }
      const repeat = element(style, 'measure-repeat')
      if (repeat && attribute(repeat, 'type') === 'start') {
        const slashes = Number(attribute(repeat, 'slashes') || text(repeat) || '1')
        if (slashes >= 2) {
          measure.simileTwoPreviousMeasuresCount = '1'
        } else {
          measure.similePreviousMeasureCount = '1'
        }
      }
    }

    for (const clef of elements(attributes, 'clef')) {
      const number = Number(attribute(clef, 'number') || '1')
      const named = clefNamed(
        textOf(clef, 'sign'), numberOf(clef, 'line'), numberOf(clef, 'clef-octave-change')
      )
      if (named) {
        if (clefOf.get(`${part.id}|${number}`) !== named) {
          changed.add(number)
        }
        clefOf.set(`${part.id}|${number}`, named)
      }
    }
  }

  /*
  A stave shows its clef at the head of every page line, and again wherever the
  clef changes mid-piece. Restating it on a line's first measure is not
  decoration: without one the line has nothing to open with.
  */
  for (let staff = 1; staff <= part.staves; staff++) {
    const named = clefOf.get(`${part.id}|${staff}`)
    if (named && (startsPageLine || changed.has(staff))) {
      measure.stavesParams[part.firstStave + staff - 1].clef = named
    }
  }

  readBarline(source, measure, report, spans)

  /*
  Directions are read where they stand rather than all at once.

  A `<direction>` is not attached to a note — it sits between them and applies
  from that point on. Collecting the whole measure first and handing every
  direction to the first note puts a hairpin's start and its stop on the same
  unit, where the second overwrites the first and the span disappears.
  */
  const pending = new Map()
  const waitFor = (staff, apply) => {
    const list = pending.get(staff) || []
    list.push(apply)
    pending.set(staff, list)
  }

  // --- the notes, grouped by the voice they belong to ---
  const voices = new Map()
  const divisions = divisionsOf.get(part.id) || 1
  let previousUnit = null
  let previousVoice = null

  /*
  A chord symbol is written beside the notes, not inside one: `<harmony>` is a
  sibling of `<note>` and applies to whatever follows it. It is carried to the
  next note here so the unit that draws it can pick it up.
  */
  let pendingHarmony = null

  for (const child of elements(source)) {
    if (child.name === 'direction') {
      readDirection(child, measure, spans, report, waitFor)
      continue
    }
    if (child.name === 'harmony') {
      pendingHarmony = child
      continue
    }
    if (child.name !== 'note') {
      continue
    }
    if (pendingHarmony) {
      child.__harmony = pendingHarmony
      pendingHarmony = null
    }

    const voiceName = textOf(child, 'voice') || '1'
    const staff = Number(textOf(child, 'staff') || '1')
    const isChordMember = !!element(child, 'chord')

    if (!voices.has(voiceName)) {
      voices.set(voiceName, { staff, units: [] })
    }
    const voice = voices.get(voiceName)

    /*
    A `<chord>` note is not a unit of its own — it sounds with the one before
    it, so it joins that unit's notes rather than starting a new one.
    */
    if (isChordMember && previousUnit && previousVoice === voiceName) {
      const note = readNote(child, report)
      const accidental = readAccidental(child)
      if (accidental) {
        ;(previousUnit.keysParams = previousUnit.keysParams || []).push({
          ...note, ...accidental
        })
      }
      previousUnit.notes.push(note)
      previousUnit.notes.forEach((one, index) => {
        one.id = index
      })
      continue
    }

    const unit = readUnit(child, { divisions, voice, staff, spans, report })
    voice.units.push(unit)
    previousUnit = unit
    previousVoice = voiceName

    const waiting = pending.get(staff)
    if (waiting && waiting.length) {
      for (const apply of waiting.splice(0, waiting.length)) {
        apply(unit)
      }
    }
  }

  for (const [ , voice ] of voices) {
    const stave = measure.stavesParams[part.firstStave + Math.min(voice.staff, part.staves) - 1]
    if (stave) {
      stave.voicesParams.push(voice.units)
    }
  }
}

/**
 * One `<note>` as a unit of a voice.
 */
function readUnit(node, { divisions, voice, staff, spans, report }) {
  const unit = { notes: [], unitDuration: readDuration(node, divisions, report) }

  const rest = element(node, 'rest')
  if (rest) {
    unit.isRest = true
    if (attribute(rest, 'measure') === 'yes') {
      unit.isFullMeasure = true
    }
    unit.notes.push({})
  } else {
    const note = readNote(node, report)
    // A note belonging to another stave of the same part is written where it is
    // read and says which stave it sounds on.
    if (staff !== voice.staff) {
      note.stave = staff > voice.staff ? 'next' : 'prev'
    }
    unit.notes.push(note)
    const accidental = readAccidental(node)
    if (accidental) {
      unit.keysParams = [ { ...note, ...accidental } ]
    }
  }

  const notehead = element(node, 'notehead')
  if (notehead) {
    if (text(notehead) === 'x') {
      unit.notes.forEach((one) => {
        one.isGhost = true
      })
    }
    if (attribute(notehead, 'parentheses') === 'yes') {
      unit.parentheses = [ { appliedToWholeUnit: true } ]
    }
  }

  const dots = elements(node, 'dot').length
  if (dots) {
    unit.numberOfDots = dots
  }

  const nudge = attribute(node, 'relative-x')
  if (nudge && Number(nudge)) {
    unit.relatedXCorrection = Number(nudge) / 10
  }

  const stem = textOf(node, 'stem')
  if (stem === 'up' || stem === 'down') {
    unit.stemDirection = stem
  }

  if (element(node, 'grace')) {
    unit.isGrace = true
    if (attribute(element(node, 'grace'), 'slash') === 'yes') {
      unit.hasGraceCrushLine = true
    }
  }

  // A beam is stated on every note it touches; a page only needs to know that
  // this note joins the next.
  const beams = elements(node, 'beam')
  if (beams.length) {
    const primary = beams.find((beam) => (attribute(beam, 'number') || '1') === '1') || beams[0]
    const how = text(primary)
    unit.beamedWithNext = how === 'begin' || how === 'continue'
  }

  const modification = element(node, 'time-modification')
  if (modification) {
    spans.tupletValue = numberOf(modification, 'actual-notes') || 3
  }

  readNotations(node, unit, spans, report)
  readLyrics(node, unit)

  const harmony = node.__harmony
  if (harmony) {
    const root = element(harmony, 'root')
    const letter = root && textOf(root, 'root-step')
    if (letter) {
      const alter = numberOf(root, 'root-alter')
      const kind = element(harmony, 'kind')
      // The quality travels as the text a player reads, which is how a page
      // keeps it — there is no vocabulary of chord names to map onto.
      const quality = kind ? attribute(kind, 'text') : ''
      const accidental = alter === 1 ? '^sharp' : (alter === -1 ? '^flat' : '')
      unit.relatedChordLetter = { textValue: `${letter}${accidental}${quality}` }
    }
  }

  unit.notes.forEach((note, index) => {
    note.id = index
  })
  if (unit.keysParams) {
    unit.keysParams.forEach((key, index) => {
      key.id = index
    })
  }
  return unit
}

/**
 * The bar line a measure closes with, and the repeat dots against it.
 */
function readBarline(source, measure, report, spans) {
  for (const barline of elements(source, 'barline')) {
    const where = attribute(barline, 'location') || 'right'
    const style = textOf(barline, 'bar-style')
    const named = BAR_NAMES_BY_STYLE[style]

    if (named && where === 'right') {
      measure.closingBarLineName = named
    }
    if (named && where === 'left') {
      measure.openingBarLineName = named === 'boldDoubleBarLine'
        ? 'startBoldDoubleBarLine'
        : 'startBarLine'
    }

    const repeat = element(barline, 'repeat')
    if (repeat) {
      if (attribute(repeat, 'direction') === 'forward') {
        measure.repeatDotsMarkAtTheStart = true
      } else {
        measure.repeatDotsMarkAtTheEnd = true
      }
    }

    const ending = element(barline, 'ending')
    if (ending) {
      const type = attribute(ending, 'type')
      const value = text(ending) || attribute(ending, 'number')
      const number = attribute(ending, 'number') || '1'
      measure.voltaMark = measure.voltaMark || {}
      if (type === 'start') {
        /*
        Both ends of a bracket carry the same key, which is what the drawer
        follows from one measure to the next — and what it calls `.replace` on,
        so a mark without one takes the page down.
        */
        measure.voltaMark.key = spans.open('volta-mark', number)
        measure.voltaMark.value = value
        measure.voltaMark.startsHere = true
        measure.voltaMark.finishesHere = false
      } else {
        measure.voltaMark.key = measure.voltaMark.key ||
          spans.close('volta-mark', number) || spans.open('volta-mark', number)
        measure.voltaMark.finishesHere = true
      }
    }

    if (element(barline, 'fermata') && where === 'right') {
      measure.endsWithFermata = true
    }
    if (element(barline, 'segno')) {
      measure.sign = { measurePosition: where === 'left' ? 'start' : 'end' }
    }
    if (element(barline, 'coda')) {
      measure.coda = { measurePosition: where === 'left' ? 'start' : 'end' }
    }
    void report
  }
}

/**
 * The `<direction>` elements of a measure.
 *
 * A direction is not attached to a note in MusicXML — it sits between them and
 * applies from that point on. What belongs to the measure is set straight away;
 * what belongs to a unit is returned as work waiting for the next note on that
 * staff.
 */
function readDirection(direction, measure, spans, report, waitFor) {
  {
    const staff = Number(textOf(direction, 'staff') || '1')
    const placement = attribute(direction, 'placement')

    for (const type of elements(direction, 'direction-type')) {
      for (const what of elements(type)) {
        switch (what.name) {
          case 'dynamics': {
            const written = elements(what).map((one) => one.name).join('')
            if (written) {
              waitFor(staff, (unit) => {
                ;(unit.articulationParams = unit.articulationParams || []).push({
                  name: 'dynamicMark',
                  textValue: written,
                  ...(placement ? { direction: directionOfPlacement(placement) } : {})
                })
              })
            }
            break
          }

          case 'wedge': {
            const kind = attribute(what, 'type')
            const number = attribute(what, 'number') || '1'
            if (kind === 'crescendo' || kind === 'diminuendo') {
              const key = spans.open('crescendo-or-diminuendo', number)
              waitFor(staff, (unit) => {
                unit.dynamicChangeMark = {
                  key,
                  type: kind,
                  ...(placement ? { direction: directionOfPlacement(placement) } : {})
                }
              })
            } else if (kind === 'stop') {
              const key = spans.close('crescendo-or-diminuendo', number)
              if (key) {
                waitFor(staff, (unit) => {
                  unit.dynamicChangeMark = { key, finish: true }
                })
              }
            }
            break
          }

          case 'octave-shift': {
            const kind = attribute(what, 'type')
            const number = attribute(what, 'number') || '1'
            const size = Number(attribute(what, 'size') || '8')
            if (kind === 'up' || kind === 'down') {
              const key = spans.open('octave-sign', number)
              waitFor(staff, (unit) => {
                unit.octaveSignMark = {
                  key,
                  octaveNumber: size === 15 ? '15' : '8',
                  octavePostfix: size === 15 ? 'ma' : 'va',
                  // MusicXML names which way the notes move; a page names where
                  // the bracket is drawn, which is the other way round.
                  direction: kind === 'down' ? 'up' : 'down'
                }
              })
            } else if (kind === 'stop') {
              const key = spans.close('octave-sign', number)
              if (key) {
                waitFor(staff, (unit) => {
                  unit.octaveSignMark = { key, finish: true }
                })
              }
            }
            break
          }

          case 'pedal': {
            const kind = attribute(what, 'type')
            const number = attribute(what, 'number') || '1'
            if (kind === 'start') {
              const key = spans.open('pedal', number)
              waitFor(staff, (unit) => {
                // `beforeUnit` puts the sign in front of the note it starts on,
                // which is where a pedal mark belongs.
                unit.pedalMark = {
                  key, textValue: 'Ped.', start: true, finish: false, beforeUnit: true
                }
              })
            } else if (kind === 'stop') {
              const key = spans.close('pedal', number) || spans.open('pedal', number)
              waitFor(staff, (unit) => {
                unit.pedalMark = { key, release: true, finish: true }
              })
            } else if (kind === 'change') {
              waitFor(staff, (unit) => {
                unit.pedalMark = { variablePeak: true }
              })
            }
            break
          }

          case 'metronome': {
            const note = textOf(what, 'beat-unit')
            const perMinute = textOf(what, 'per-minute')
            if (note && perMinute) {
              measure.tempoMark = {
                textValueParts: [ '', beatUnitOf(note), ` = ${perMinute}` ]
              }
            }
            break
          }

          case 'words': {
            const said = text(what)
            if (said && !measure.tempoMark) {
              measure.tempoMark = { textValueParts: [ said ] }
            }
            break
          }

          case 'segno':
            measure.sign = { measurePosition: 'start' }
            break

          case 'coda':
            measure.coda = { measurePosition: 'end' }
            break

          case 'rehearsal':
            measure.repetitionNote = { value: text(what), measurePosition: 'start' }
            break

          case 'dashes':
          case 'bracket':
          case 'harp-pedals':
          case 'damp':
          case 'scordatura':
          case 'accordion-registration':
            report.drop(`<${what.name}>`, 'direction')
            break

          default:
            break
        }
      }
    }
  }
}

/** The note symbol a metronome mark draws, as a page spells it. */
function beatUnitOf(name) {
  return {
    long: '4', breve: '2', whole: '1', half: '1/2', quarter: '1/4',
    eighth: '1/8', '16th': '1/16', '32nd': '1/32', '64th': '1/64'
  }[name] || '1/4'
}
