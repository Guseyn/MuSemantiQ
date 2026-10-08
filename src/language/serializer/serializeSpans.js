'use strict'

/**
 * Marks that run across units, written as their own commands.
 *
 * A slur, a tuplet, an octave sign, a pedal line or a volta is not a property of
 * one unit: the schema stamps every unit it covers with the same key, and marks
 * the last one `finish`. So they cannot be written while walking units — the
 * whole voice has to be seen first, the units carrying each key collected, and
 * one command written naming where the mark starts and ends.
 */

/**
 * `1st`, `2nd`, `3rd`, `4th` — what the language uses to name a unit.
 */
function serializeOrdinal(index) {
  const number = index + 1
  const teen = number % 100
  if (teen >= 11 && teen <= 13) {
    return `${number}th`
  }
  return `${number}${ { 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th' }`
}

const serializeUnitNumber = (index) => `${index + 1}`

/**
 * Group the units of a voice by the key of a mark they carry.
 *
 * Returns, per key, the index of the first and last unit it appears on, and the
 * parameters as the first unit stated them.
 */
function collectSpans(units, field) {
  const spans = new Map()
  units.forEach((unit, index) => {
    const marks = unit[field]
    if (!marks) {
      return
    }
    for (const mark of Array.isArray(marks) ? marks : [ marks ]) {
      const key = mark.key || mark.refId || field
      if (!spans.has(key)) {
        spans.set(key, { from: index, to: index, params: mark })
      }
      const span = spans.get(key)
      span.to = index
      span.endParams = mark
      if (mark.finish) {
        span.finished = true
      }
    }
  })
  return [ ...spans.values() ]
}

/**
 * The units a span runs between.
 *
 * An endpoint can also sit just outside the unit it names — a slur that starts
 * before the note it is written on, a tuplet bracket closing after the last one
 * — which the language says in place of `from` and `to`.
 */
function serializeRange(span) {
  const opens = span.params.before
    ? `starts before unit ${serializeUnitNumber(span.from)}`
    : `from unit ${serializeUnitNumber(span.from)}`
  const closes = (span.endParams || {}).after
    ? `finishes after unit ${serializeUnitNumber(span.to)}`
    : `to unit ${serializeUnitNumber(span.to)}`
  return `${opens} ${closes}`
}

/**
 * A vertical nudge, as the distance and the way it goes.
 */
function serializeCorrection(yCorrection) {
  if (typeof yCorrection !== 'number' || yCorrection === 0) {
    return ''
  }
  return `${Math.abs(yCorrection)} ${yCorrection < 0 ? 'up' : 'down'}`
}

function serializePlacement(params) {
  const words = []
  if (params.aboveBelowOverUnderStaveLines && params.direction) {
    words.push(params.direction === 'up' ? 'above stave' : 'below stave')
  } else if (params.direction) {
    words.push(params.direction)
  }
  return words.join(' ')
}

/**
 * Every span command a voice needs, in the order they read best.
 */
export default function serializeSpans(units) {
  const commands = []

  for (const span of collectSpans(units, 'tupletMarks')) {
    const words = [ `tuplet ${span.params.value}` ]
    if (span.params.withBrackets) {
      words.push('with brackets')
    }
    const where = serializePlacement(span.params)
    if (where) {
      words.push(where)
    }
    words.push(serializeRange(span), serializeCorrection(span.params.yCorrection))
    commands.push(words.filter(Boolean).join(' '))
  }

  for (const span of collectSpans(units, 'slurMarks')) {
    const words = [ 'slur' ]
    const where = serializePlacement(span.params)
    if (where) {
      words.push(where)
    }
    words.push(serializeRange(span))
    /*
    A slur is a curve before it is a span, so it takes its own shaping: how far
    it bends, whether it doubles back, and where each end lands.
    */
    if (span.params.sShape) {
      words.push('with s-shape')
    }
    if (span.params.roundCoefficientFactor) {
      words.push(`with roundness ${span.params.roundCoefficientFactor}`)
    }
    const left = serializeCorrection(span.params.leftYCorrection)
    if (left) {
      words.push(`with left point ${left}`)
    }
    const right = serializeCorrection(span.params.rightYCorrection)
    if (right) {
      words.push(`with right point ${right}`)
    }
    if (span.params.rightPlacement === 'noteBody') {
      words.push('with right point attached to note body')
    }
    commands.push(words.join(' '))
  }

  /*
  A glissando is written on its unit unless it was given a form, and then it
  names both ends instead.
  */
  for (const span of collectSpans(units, 'glissandoMarks')) {
    if (!span.params.form) {
      continue
    }
    commands.push(`glissando as ${span.params.form} ${serializeRange(span)}`)
  }

  /*
  A simile counting beats stands for a run of units rather than for the one it
  is written on, so it names that run.
  */
  for (const span of collectSpans(units, 'simileMark')) {
    if (!span.params.numberOfBeats) {
      continue
    }
    commands.push([
      `simile ${serializeRange(span)} ${span.params.count} times`,
      serializeCorrection(span.params.yCorrection)
    ].filter(Boolean).join(' '))
  }

  for (const span of collectSpans(units, 'octaveSignMark')) {
    const octave = span.params.octaveNumber === '15' ? 'two octaves' : 'octave'
    commands.push([
      `${octave} ${span.params.direction} ${serializeRange(span)}`,
      serializeCorrection(span.params.yCorrection)
    ].filter(Boolean).join(' '))
  }

  for (const span of collectSpans(units, 'dynamicChangeMark')) {
    const words = [ span.params.type ]
    const where = serializePlacement(span.params)
    if (where) {
      words.push(where)
    }
    words.push(serializeRange(span), serializeCorrection(span.params.yCorrection))
    commands.push(words.filter(Boolean).join(' '))
    // The endpoint dynamics are their own commands, each naming a unit.
    if (span.params.valueBefore) {
      commands.push(`starts with "${span.params.valueBefore}" at ${serializeOrdinal(span.from)} unit`)
    }
    if (span.params.valueAfter) {
      commands.push(`finishes with "${span.params.valueAfter}" at ${serializeOrdinal(span.to)} unit`)
    }
  }

  return commands
}

export { collectSpans }
