'use strict'

/**
 * A parsed page, written back as MSQ source.
 *
 * The reverse of the parser: where `parsedLanguage` turns text into a page
 * schema and the settings that came with it, this turns them back into text that
 * parses to the same thing.
 *
 * It is a printer, not a transcript. The schema records what was meant, not how
 * it was typed, so the output is normalised — one accepted spelling of each
 * command, stem directions always stated, one unit per line. Parsing the result
 * gives back what it came from; it will rarely give back the original
 * characters, and is not meant to.
 */

import unitText from '#msq/language/serializer/unitText.js'
import spanText from '#msq/language/serializer/spanText.js'
import configurableStyles from '#msq/language/parser/scenarios/static-objects/configurableStyles.js'
import midiSettingNames from '#msq/language/parser/scenarios/static-objects/midiSettings.js'

const BAR_LINE_WORDS = {
  barLine: 'barline',
  doubleBarLine: 'double barline',
  boldDoubleBarLine: 'double bold barline',
  dottedBarLine: 'dotted barline'
}

const OPENING_BAR_LINE_WORDS = {
  startBarLine: 'barline',
  startBoldDoubleBarLine: 'double bold barline'
}

/**
 * The command that sets each key, taken from the table the parser reads.
 *
 * Several spellings reach the same key — `bg colour` and `background color` both
 * mean `backgroundColor` — so the first one named wins and becomes the one this
 * writes. Deriving it from the parser's own table is what keeps the two from
 * drifting apart.
 */
function commandForEachKey(table) {
  const commands = {}
  for (const [ command, key ] of Object.entries(table)) {
    if (!(key in commands)) {
      commands[key] = command
    }
  }
  return commands
}

const STYLE_COMMANDS = commandForEachKey(configurableStyles)
const MIDI_SETTING_COMMANDS = commandForEachKey(midiSettingNames)

/**
 * `mezzoSoprano` is one word in the schema and two in the source.
 */
const clefWords = (clef) => clef.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()

/**
 * A command that applies beyond its own measure says so.
 */
const scopeText = (forEachLineId) => forEachLineId === undefined ? '' : ' for each line'

/**
 * A vertical nudge, as the distance and the way it goes.
 */
const correctionText = (yCorrection) =>
  typeof yCorrection !== 'number' || yCorrection === 0
    ? ''
    : ` ${Math.abs(yCorrection)} ${yCorrection < 0 ? 'up' : 'down'}`

/**
 * The page's styles and midi settings, each as `<name> is <value>`.
 */
function settingLines(values, commands) {
  return Object.entries(values || {})
    .filter(([ key, value ]) => commands[key] && value !== undefined && value !== null && value !== '')
    .map(([ key, value ]) => `${commands[key]} is ${value}`)
}

/**
 * The page-wide settings, which live beside the schema rather than in it.
 */
function pageMeta(schema) {
  const lines = []
  const say = (command, value) => {
    if (value !== undefined && value !== null && value !== '') {
      lines.push(`${command} is "${value}"`)
    }
  }
  say('title', schema.title)
  say('subtitle', schema.subtitle)
  say('left subtitle', schema.leftSubtitle)
  say('right subtitle', schema.rightSubtitle)
  say('page number', schema.pageNumber)

  if (schema.showMeasureNumbers) {
    const scope = { first: 'first measures', all: 'all measures', 'first&last': 'first and last measures' }
    lines.push(`measure numbers for ${scope[schema.showMeasureNumbers] || schema.showMeasureNumbers}`)
  }
  if (schema.compressUnitsByNTimes) {
    lines.push(`compress units by ${schema.compressUnitsByNTimes} times`)
  }
  if (schema.stretchUnitsByNTimes) {
    lines.push(`stretch units by ${schema.stretchUnitsByNTimes} times`)
  }
  // Both are kept per page line, indexed from zero while the lines are named
  // from one.
  ;(schema.compressUnitsByNTimesInLines || []).forEach((times, index) => {
    if (times) {
      lines.push(`compress units by ${times} times in line ${index + 1}`)
    }
  })
  ;(schema.stretchUnitsByNTimesInLines || []).forEach((times, index) => {
    if (times) {
      lines.push(`stretch units by ${times} times in line ${index + 1}`)
    }
  })
  if (schema.hideLastMeasure) {
    lines.push('hide the last measure')
  }
  // Lyrics sit under the first stave unless the page says otherwise, and then
  // they say it once for the whole page.
  if (schema.lyricsUnderStaveIndex) {
    lines.push(`lyrics is under stave ${schema.lyricsUnderStaveIndex + 1}`)
  }
  return lines
}

/**
 * The commands that belong to a measure rather than to any note in it.
 */
function measureCommands(measure) {
  const lines = []

  /*
  The bar lines come first.

  Not for looks: the parser will not take `ends with …` after a connection, an
  instrument title or even a time signature has been named, so writing them in
  the order they are thought of produces a measure that does not read back.
  */
  if (measure.openingBarLineName) {
    lines.push(`starts with ${OPENING_BAR_LINE_WORDS[measure.openingBarLineName] || measure.openingBarLineName}`)
  }
  if (measure.withoutStartBarLine) {
    lines.push('without start barline')
  }
  if (measure.closingBarLineName && measure.closingBarLineName !== 'barLine') {
    lines.push(`ends with ${BAR_LINE_WORDS[measure.closingBarLineName] || measure.closingBarLineName}`)
  }
  if (measure.repeatDotsMarkAtTheStart) {
    lines.push('with repeat sign at the start')
  }
  if (measure.repeatDotsMarkAtTheEnd) {
    lines.push('with repeat sign at the end')
  }
  if (measure.endsWithFermata) {
    lines.push('ends with fermata')
  }

  if (measure.timeSignatureParams) {
    const { cMode, crossed, numerator, denominator } = measure.timeSignatureParams
    const value = cMode ? (crossed ? 'crossed c' : 'c') : `${numerator}:${denominator}`
    lines.push(`time signature is ${value}${scopeText(measure.timeSignatureParams.forEachLineId)}`)
  }
  if (measure.keySignatureName) {
    lines.push(
      `key signature is ${measure.keySignatureName.split('|')[0]}` +
      scopeText(measure.keySignatureNameForEachLineId)
    )
  }

  for (const connection of measure.connectionsParams || []) {
    lines.push(
      `${connection.name} from stave ${connection.staveStartNumber + 1}` +
      ` to stave ${connection.staveEndNumber + 1}${scopeText(connection.forEachLineId)}`
    )
  }
  for (const title of measure.instrumentTitlesParams || []) {
    const start = (title.staveStartNumber ?? title.staveNumber ?? 0) + 1
    const end = (title.staveEndNumber ?? title.staveStartNumber ?? title.staveNumber ?? 0) + 1
    // A title spanning staves is centred between them rather than set against one.
    lines.push(
      (end > start
        ? `instrument "${title.value}" between stave ${start} and stave ${end}`
        : `instrument title is "${title.value}" for stave ${start}`) +
      scopeText(title.forEachLineId)
    )
  }

  if (measure.tempoMark) {
    lines.push(
      `tempo is "${(measure.tempoMark.textValueParts || []).join('')}"` +
      correctionText(measure.tempoMark.yCorrection)
    )
  }

  if (measure.isMeasureRest) {
    lines.push('with measure rest')
  }
  if (measure.multiMeasureRestCount) {
    lines.push(`with multi measure rest ${measure.multiMeasureRestCount} times`)
  }
  if (measure.similePreviousMeasureCount) {
    lines.push(`with simile of previous measure ${measure.similePreviousMeasureCount} times`)
  }
  if (measure.simileTwoPreviousMeasuresCount) {
    lines.push(`with simile of two previous measures ${measure.simileTwoPreviousMeasuresCount} times`)
  }

  if (measure.coda) {
    lines.push(
      `coda at the ${measure.coda.measurePosition} of the measure` +
      correctionText(measure.coda.yCorrection)
    )
  }
  if (measure.sign) {
    lines.push(
      `sign at the ${measure.sign.measurePosition} of the measure` +
      correctionText(measure.sign.yCorrection)
    )
  }
  if (measure.repetitionNote) {
    lines.push(
      `repetition note "${measure.repetitionNote.value}"` +
      ` at the ${measure.repetitionNote.measurePosition} of the measure` +
      correctionText(measure.repetitionNote.yCorrection)
    )
  }
  return lines
}

/**
 * A volta runs from one measure to another, so it is written once for the page
 * rather than on each measure it covers.
 */
function voltaLines(measures) {
  const marked = measures.findIndex((one) => one.voltaMark && one.voltaMark.value !== undefined)
  if (marked === -1) {
    return []
  }
  const volta = measures[marked].voltaMark
  const finished = measures.findIndex(
    (one) => one.voltaMark && (one.voltaMark.finishesHere || one.voltaMark.finishesAfter)
  )
  const to = finished === -1 ? measures.length - 1 : finished

  /*
  A bracket can hang past the measures it names — opening before the first and
  closing after the last — which is what `startsBefore` and `finishesAfter`
  record, and what these two clauses say back.
  */
  const opens = volta.startsBefore
    ? `starts before measure ${marked + 1}`
    : `from measure ${marked + 1}`
  const closes = measures[to].voltaMark.finishesAfter
    ? `and finishes after measure ${to + 1}`
    : `to measure ${to + 1}`

  return [
    `volta${volta.value ? ` with text "${volta.value}"` : ' bracket'}` +
    ` ${opens} ${closes}${correctionText(volta.yCorrection)}`
  ]
}

/**
 * One voice: its units, then the marks that span them.
 */
function voiceLines(units) {
  /*
  The units a simile stands for are produced by the simile command itself, so
  writing them out as well would say the same thing twice.
  */
  const written = units.filter((one) => !one.isSimile)
  return [
    ...written.flatMap((unit, index) => unitText(unit, written[index - 1])),
    ...spanText(written)
  ]
}

/**
 * Put each comment back on the line it was written on.
 *
 * A comment remembers where it sat in the source, and the parser reads those
 * line numbers back out, so writing the comments anywhere else would change
 * them. Each block is laid into the lines it claims, and the page is padded with
 * blank lines when a comment sits past the end of the music.
 */
function withComments(lines, comments) {
  const placed = [ ...lines ]
  for (const comment of comments || []) {
    const quote = comment.startQuote || '"'
    const block = `comment: ${quote}${comment.text}${quote}`.split('\n')
    const from = (comment.startLineNumber || 1) - 1
    while (placed.length < from) {
      placed.push('')
    }
    placed.splice(from, 0, ...block)
  }
  return placed
}

/**
 * Write a parsed page as MSQ source.
 *
 * @param {Object} pageSchema     one page, as `generateIntermediateStructuresForSinglePage` returns it
 * @param {Object} [customStyles] the page's styles, as the parser collected them
 * @param {Object} [midiSettings] the page's midi settings, as the parser collected them
 * @param {Array}  [comments]     the page's comments, each with the lines it sat on
 * @returns {string} MSQ source that parses to the same page
 */
export default function serialize(pageSchema, customStyles, midiSettings, comments) {
  const schema = pageSchema || {}
  const lines = [
    ...settingLines(customStyles, STYLE_COMMANDS),
    ...settingLines(midiSettings, MIDI_SETTING_COMMANDS),
    ...pageMeta(schema)
  ]

  let pageLineNumber = null
  for (const measure of schema.measuresParams || []) {
    // A new page line is its own command, not a property of the measure after it.
    if (pageLineNumber !== null && measure.pageLineNumber !== pageLineNumber) {
      lines.push('', 'new line')
    }
    pageLineNumber = measure.pageLineNumber

    lines.push('', 'measure')
    lines.push(...measureCommands(measure))

    for (const stave of measure.stavesParams || []) {
      lines.push('stave')
      if (stave.clef) {
        lines.push(`${clefWords(stave.clef)} clef`)
      }
      const voices = stave.voicesParams || []
      voices.forEach((units, index) => {
        // The first voice of a stave is implied; the rest are opened explicitly.
        if (index > 0) {
          lines.push('voice')
        }
        lines.push(...voiceLines(units))
      })
    }
  }

  lines.push(...voltaLines(schema.measuresParams || []))

  const body = lines.join('\n').trim().split('\n')
  return `${withComments(body, comments).join('\n')}\n`
}
