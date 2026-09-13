'use strict'

/**
 * One unit of a voice, written back as MSQ.
 *
 * A unit is a chord, a single note or a rest, plus everything hanging off it:
 * its duration and dots, stem direction, beaming, accidentals, articulations,
 * ties and tremolos, and the marks that attach to it rather than span from it.
 * Marks that span several units — slurs, tuplets, pedals — are not written here;
 * they become their own commands once the whole voice is known.
 */

import { durationText, dotsText } from '#msq/language/serializer/durationText.js'

// The schema names an accidental `sharpKey`; the language writes `sharp`.
const KEY_WORDS = {
  sharpKey: 'sharp',
  flatKey: 'flat',
  naturalKey: 'natural',
  doubleSharpKey: 'double sharp',
  doubleFlatKey: 'double flat',
  demisharpKey: 'demisharp',
  demiflatKey: 'demiflat',
  sesquisharpKey: 'sesquisharp',
  sesquiflatKey: 'sesquiflat'
}

/*
Articulations whose written name differs from the schema's, and the ones that
take a value rather than standing alone.
*/
const ARTICULATION_WORDS = {
  leftHandPizzicato: 'left hand pizzicato',
  snapPizzicato: 'snap pizzicato',
  naturalHarmonic: 'natural harmonic',
  upBow: 'up bow',
  downBow: 'down bow',
  dynamicMark: 'dynamic'
}

/**
 * A note, with its octave when it is not the default one, and whatever is said
 * about that note alone rather than about the unit.
 */
function noteText(note) {
  const parts = [ `${note.noteName}${note.octaveNumber || ''}` ]
  if (note.isGhost) {
    parts.push('is ghost')
  }
  if (note.stave && note.stave !== 'current') {
    parts.push(`on ${note.stave} stave`)
  }
  return parts.join(' ')
}

/**
 * A vertical nudge, as the distance and the way it goes.
 *
 * The schema counts downwards — a negative correction lifts the mark — so the
 * sign becomes the word and the number is always written positive.
 */
function correctionText(yCorrection) {
  if (typeof yCorrection !== 'number' || yCorrection === 0) {
    return ''
  }
  return `${Math.abs(yCorrection)} ${yCorrection < 0 ? 'up' : 'down'}`
}

/**
 * Where an articulation or mark sits, written as the language words it.
 */
function placementText(params) {
  const words = []
  if (params.direction) {
    words.push(params.aboveBelowOverUnderStaveLines
      ? `${params.direction === 'up' ? 'above' : 'below'} stave`
      : params.direction)
  } else if (params.aboveBelowOverUnderStaveLines) {
    words.push('above stave')
  }
  const correction = correctionText(params.yCorrection)
  if (correction) {
    words.push(correction)
  }
  return words.join(' ')
}

/**
 * An articulation, with whatever it carries: a dynamic's text, the accidentals
 * an ornament wears, a trill's wave.
 */
function articulationText(articulation) {
  /*
  An octave sign worn by a single unit is not written as an articulation at all:
  the language says what it does rather than what it draws.
  */
  if (articulation.name === 'octaveSign') {
    const octave = articulation.textValue === '15' ? 'two octaves' : 'octave'
    return [ `is ${octave} ${articulation.direction}`, correctionText(articulation.yCorrection) ]
      .filter(Boolean).join(' ')
  }

  const name = ARTICULATION_WORDS[articulation.name] || articulation.name
  const parts = [ articulation.textValue === undefined
    ? `with ${name}`
    : `with ${name} "${articulation.textValue}${articulation.subTextValue || ''}"` ]

  if (articulation.inverted) {
    parts.push('inverted')
  }
  if (articulation.withWave) {
    parts.push('with wave after')
  }
  if (articulation.followedAfter) {
    parts.push('after')
  }
  const placement = placementText(articulation)
  if (placement) {
    parts.push(placement)
  }
  if (articulation.keyAbove) {
    parts.push(`with ${articulation.keyAbove} key above`)
  }
  if (articulation.keyBelow) {
    parts.push(`with ${articulation.keyBelow} key below`)
  }
  return parts.join(' ')
}

/**
 * A pedal mark, which is written on the unit it lands on rather than as a span:
 * one command opens it, another releases it, and a retake is its own word.
 */
function pedalText(pedal) {
  const parts = []
  const text = pedal.textValue && pedal.textValue !== 'Ped.'
    ? ` "${pedal.textValue}"`
    : ''

  const correction = correctionText(pedal.yCorrection)

  if (pedal.variablePeak) {
    parts.push(`with variable peak${text}`)
  } else if (pedal.tillEndOfMeasure) {
    /*
    A pedal that runs on past the bar line is released `after measure` rather
    than `at the end of measure`: the first carries the line over, the second
    stops it where the measure does.
    */
    parts.push('with release after measure')
  } else if (pedal.release || pedal.withBracketClosure) {
    parts.push(pedal.withBrackets ? 'with release bracket' : 'with release')
  } else if (pedal.start) {
    parts.push(pedal.withBrackets
      ? 'with pedal opens with bracket'
      : `with pedal${text}${correction ? ` ${correction}` : ''}`)
  }

  if (pedal.beforeUnit) {
    parts.push('before')
  }
  if (pedal.afterUnit) {
    parts.push('after')
  }
  if (pedal.atEndOfMeasure && !pedal.tillEndOfMeasure) {
    parts.push('at the end of measure')
  }
  if (typeof pedal.underStaveIndex === 'number') {
    parts.push(`under stave ${pedal.underStaveIndex + 1}`)
  }
  return parts
}

/**
 * The ties a unit carries, each written the way the language reaches for it.
 *
 * `tied with next` binds two units side by side, while `tied before` and
 * `tied after` leave a tie hanging off one end — pointing into the previous
 * measure or out of this one — and the `measure` forms name which one.
 */
function tieTexts(unit) {
  const parts = []
  const tie = (words, params) => {
    const said = [ words ]
    if (params.direction) {
      said.push(params.direction)
    }
    if (params.roundCoefficientFactor) {
      said.push(`with roundness ${params.roundCoefficientFactor}`)
    }
    parts.push(said.join(' '))
  }

  if (unit.tiedWithNext) {
    tie('is tied with next', unit.tiedWithNext)
  }
  if (unit.tiedBefore) {
    tie('is tied before', unit.tiedBefore)
  }
  if (unit.tiedAfter) {
    tie('is tied after', unit.tiedAfter)
  }
  if (unit.tiedBeforeMeasure) {
    tie(`is tied before measure ${unit.tiedBeforeMeasure.index}`, unit.tiedBeforeMeasure)
  }
  if (unit.tiedAfterMeasure) {
    tie(`is tied after measure ${unit.tiedAfterMeasure.index}`, unit.tiedAfterMeasure)
  }
  return parts
}

/**
 * The accidentals a unit carries, each tied back to the note it belongs to.
 *
 * A single-note unit says `with sharp key` and leaves the note implied; a chord
 * has to name which note each accidental is for.
 */
function keysText(unit, isChord) {
  if (isChord) {
    // In a chord the accidental follows its own note in the note list, so it is
    // written there rather than as a modifier of the whole unit.
    return []
  }
  return (unit.keysParams || []).map(keyWords)
}

/**
 * One entry of `keysParams`, as the words that put it beside a note.
 *
 * Most are accidentals, but the column can also hold a plain label — a fingering
 * number, a string number — which the language writes as text rather than as a
 * key.
 */
function keyWords(key) {
  if (key.keyType === 'noteLetter') {
    return `with text "${key.textValue}"`
  }
  const word = KEY_WORDS[key.keyType] || key.keyType
  const parenthesised = key.withParentheses ? ' with parentheses' : ''
  return `with ${word} key${parenthesised}`
}

/**
 * The accidental belonging to one note of a chord, written beside it.
 */
function keyOfNote(unit, note) {
  const key = (unit.keysParams || []).find(
    (one) => one.noteName === note.noteName && (one.octaveNumber || '') === (note.octaveNumber || '')
  )
  if (!key) {
    return ''
  }
  // Beside its own note an accidental drops the `with … key` wrapping, but a
  // text label keeps its own form.
  return key.keyType === 'noteLetter'
    ? ` ${keyWords(key)}`
    : ` ${KEY_WORDS[key.keyType] || key.keyType}`
}

/**
 * Everything that attaches to this one unit, in the order the language reads
 * most naturally.
 */
function modifiers(unit, isChord, previousWasBeamed) {
  const parts = []

  const dots = dotsText(unit.numberOfDots)
  if (dots) {
    parts.push(dots)
  }
  if (unit.isGrace) {
    parts.push(unit.hasGraceCrushLine ? 'is crushed grace' : 'is grace')
  }
  if (unit.isFullMeasure) {
    parts.push('is centralized')
  }

  parts.push(...keysText(unit, isChord))

  for (const articulation of unit.articulationParams || []) {
    parts.push(articulationText(articulation))
  }

  if (unit.clefBefore) {
    parts.push(`with ${unit.clefBefore} clef before`)
  }
  if (unit.keySignatureBefore) {
    parts.push(`with key signature ${unit.keySignatureBefore.split('|')[0]} before`)
  }
  if (unit.breathMarkBefore) {
    const type = unit.breathMarkBefore.type === 'double slash' ? 'double slashes' : 'comma'
    parts.push([ `with breath ${type} before`, correctionText(unit.breathMarkBefore.yCorrection) ]
      .filter(Boolean).join(' '))
  }
  if (unit.arpeggiated) {
    if (unit.arpeggiated.arrow) {
      parts.push(`is arpeggiated with arrow ${unit.arpeggiated.arrow}`)
    } else if (unit.arpeggiated.isConnectedWithNextChord) {
      parts.push('is arpeggiated with chord below')
    } else {
      parts.push('is arpeggiated')
    }
  }
  /*
  A simile that stands for a single unit is written on that unit; one that stands
  for a run of them counts beats instead, and becomes its own command naming the
  run it repeats.
  */
  if (unit.simileMark && unit.simileMark.count && !unit.simileMark.numberOfBeats) {
    parts.push([ `repeat ${unit.simileMark.count} times`, correctionText(unit.simileMark.yCorrection) ]
      .filter(Boolean).join(' '))
  }
  if (unit.tremoloParams) {
    const strokes = unit.tremoloParams.customNumberOfTremoloStrokes
    parts.push(unit.tremoloParams.type === 'withNext' ? 'with tremolo with next' : 'with tremolo')
    if (strokes) {
      parts.push(`with ${strokes} strokes`)
    }
  }
  parts.push(...tieTexts(unit))
  /*
  `after measure` has to be the last thing on the line: anything following it
  reads as a command of its own rather than as more of this unit. So that one
  release waits until the stem has been written.
  */
  const pedal = unit.pedalMark ? pedalText(unit.pedalMark) : []
  if (!(unit.pedalMark && unit.pedalMark.tillEndOfMeasure)) {
    parts.push(...pedal)
  }
  for (const glissando of unit.glissandoMarks || []) {
    // A glissando given a form is drawn between two named units, so it is
    // written as its own command once the whole voice is known.
    if (glissando.finish || glissando.form) {
      continue
    }
    const where = glissando.before
      ? [ 'before', glissando.beforeMeasure ? `measure ${glissando.beforeMeasure}` : '' ]
      : [ 'after', glissando.afterMeasure ? `measure ${glissando.afterMeasure}` : '' ]
    parts.push(`with glissando ${[ ...where, glissando.direction ].filter(Boolean).join(' ')}`.trim())
  }
  if (typeof unit.relatedXCorrection === 'number' && unit.relatedXCorrection !== 0) {
    const distance = Math.abs(unit.relatedXCorrection)
    parts.push(`is ${unit.relatedXCorrection < 0 ? 'left' : 'right'} by ${distance}`)
  }
  if ((unit.parentheses || []).length) {
    parts.push('with parentheses')
  }
  for (const lyrics of unit.relatedLyrics || []) {
    const syllable = [ `with lyrics "${lyrics.textValue}"` ]
    if (lyrics.dashAfter) {
      syllable.push('followed by dash')
    }
    if (lyrics.underscoreStarts) {
      syllable.push('with underscore starts')
    }
    if (lyrics.underscoreFinishes) {
      syllable.push('where underscore ends')
    }
    const correction = correctionText(lyrics.yCorrection)
    if (correction) {
      syllable.push(correction)
    }
    parts.push(syllable.join(' '))
  }
  if (unit.relatedChordLetter) {
    parts.push([
      `with chord "${unit.relatedChordLetter.textValue}"`,
      unit.relatedChordLetter.direction,
      correctionText(unit.relatedChordLetter.yCorrection)
    ].filter(Boolean).join(' '))
  }

  /*
  Beaming is sticky in the source: a run carries on until something stops it. So
  the unit that starts one says `beamed`, and the unit that ends one has to say
  `not beamed` — but only then, since saying it where no run is open changes what
  is read back.
  */
  if (unit.beamedWithNext) {
    parts.push(unit.beamedWithNextWithJustOneBeam
      ? 'beamed with only primary line'
      : 'beamed with next')
  } else if (previousWasBeamed) {
    parts.push('not beamed')
  }

  // The stem is always written out: the parser infers one when the source is
  // silent, and saying it explicitly is what makes a schema round-trip.
  if (unit.stemDirection && !unit.isRest) {
    parts.push(`with stem ${unit.stemDirection}`)
  }
  if (unit.pedalMark && unit.pedalMark.tillEndOfMeasure) {
    parts.push(...pedal)
  }
  return parts
}

/**
 * A unit as the lines of MSQ that produce it.
 */
export default function unitText(unit, previousUnit) {
  const duration = durationText(unit.unitDuration)
  const notes = unit.notes || []
  const isChord = !unit.isRest && notes.length > 1
  const parts = modifiers(unit, isChord, Boolean(previousUnit && previousUnit.beamedWithNext))

  if (unit.isRest) {
    return [ [ duration, 'rest', ...parts ].filter(Boolean).join(', ').replace(', rest', ' rest') ]
  }

  if (isChord) {
    const head = [ [ duration, 'chord' ].filter(Boolean).join(' '), ...parts ].join(', ')
    /*
    The list of notes under a `chord` runs on until something ends it, so a
    blank line has to follow: without one the next unit's note is read as
    another member of this chord.
    */
    return [ head, notes.map((note) => `${noteText(note)}${keyOfNote(unit, note)}`).join(', '), '' ]
  }

  const head = [ duration, notes.map(noteText).join(' ') ].filter(Boolean).join(' ')
  return [ [ head, ...parts ].join(', ') ]
}
