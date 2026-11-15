'use strict'

import groupChordsByHorizontalProximity from '#msq/omr/translation/groupChordsByHorizontalProximity.js'
import assignPitchByPositionNumber from '#msq/omr/translation/assignPitchByPositionNumber.js'
import inferDurationFromNoteShapes from '#msq/omr/translation/inferDurationFromNoteShapes.js'
import buildMeasuresFromBarLines from '#msq/omr/translation/buildMeasuresFromBarLines.js'
import splitVoicesByStemDirection from '#msq/omr/translation/splitVoicesByStemDirection.js'
import fillRestsInMeasures from '#msq/omr/translation/fillRestsInMeasures.js'
import inferKeyAndTimeSignature from '#msq/omr/translation/inferKeyAndTimeSignature.js'
import attachUnitParentheses from '#msq/omr/translation/features/attachUnitParentheses.js'
import attachArpeggios from '#msq/omr/translation/features/attachArpeggios.js'
import attachFermatas from '#msq/omr/translation/features/attachFermatas.js'
import attachRestPositions from '#msq/omr/translation/features/attachRestPositions.js'
import attachOctaveSpans from '#msq/omr/translation/features/attachOctaveSpans.js'
import attachPedalMarks from '#msq/omr/translation/features/attachPedalMarks.js'
import attachTuplets from '#msq/omr/translation/features/attachTuplets.js'
import attachSimiles from '#msq/omr/translation/features/attachSimiles.js'
import attachMeasureRests from '#msq/omr/translation/features/attachMeasureRests.js'
import attachTremolos from '#msq/omr/translation/features/attachTremolos.js'
import attachGlissandi from '#msq/omr/translation/features/attachGlissandi.js'
import attachVoltas from '#msq/omr/translation/features/attachVoltas.js'
import mergeCrossStaveUnits from '#msq/omr/translation/features/mergeCrossStaveUnits.js'
import attachMeasureNumbers from '#msq/omr/translation/features/attachMeasureNumbers.js'
import measureLayoutSpacingAndCorrections from '#msq/omr/translation/features/measureLayoutSpacingAndCorrections.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

/**
 * Symbols become music: measures, staves, voices, units.
 *
 * The rules each do one thing and this walks them in order — heads group into
 * chords, stems give direction and duration, dots and accidentals attach to
 * the head they hug, barlines slice measures, stems up and down split voices,
 * and silence fills what the measure still lacks. Nothing is guessed here;
 * every field traces back to a symbol.
 */

const REST_DURATIONS = {
  'rest-quadruple-whole': 2,
  'rest-double-whole': 4,
  'rest-whole': 1,
  'rest-half': 0.5,
  'rest-quarter': 0.25,
  'rest-eighth': 0.125,
  'rest-sixteenth': 0.0625,
  'rest-thirty-second': 0.03125,
  'rest-sixty-fourth': 0.015625,
  'rest-one-hundred-twenty-eighth': 0.0078125,
  'rest-two-hundred-fifty-sixth': 0.00390625
}

const CLEF_NAMES = {
  'clef-treble': 'treble',
  'clef-bass': 'bass',
  'clef-alto': 'alto',
  'clef-tenor': 'tenor',
  'clef-soprano': 'soprano',
  'clef-mezzo-soprano': 'mezzoSoprano',
  'clef-baritone': 'baritone',
  'clef-octave-eight-up': 'octaveEightUp',
  'clef-octave-eight-down': 'octaveEightDown',
  'clef-octave-fifteen-up': 'octaveFifteenUp',
  'clef-octave-fifteen-down': 'octaveFifteenDown'
}

const KEY_TYPES = {
  sharp: 'sharpKey',
  flat: 'flatKey',
  natural: 'naturalKey',
  'double-sharp': 'doubleSharpKey',
  'double-flat': 'doubleFlatKey',
  demiflat: 'demiflatKey',
  sesquiflat: 'sesquiflatKey',
  demisharp: 'demisharpKey',
  sesquisharp: 'sesquisharpKey'
}

const UNIT_ARTICULATIONS = {
  staccato: 'staccato',
  spiccato: 'spiccato',
  'left-hand-pizzicato': 'leftHandPizzicato',
  'snap-pizzicato': 'snapPizzicato',
  'natural-harmonic': 'naturalHarmonic',
  'up-bow': 'upBow',
  'down-bow': 'downBow',
  accent: 'accent',
  tenuto: 'tenuto',
  marcato: 'marcato',
  turn: 'turn',
  mordent: 'mordent',
  trill: 'trill',
  'turn-inverted': 'turn',
  'mordent-inverted': 'mordent',
  'spiccato-down': 'spiccato',
  'snap-pizzicato-down': 'snapPizzicato',
  'marcato-down': 'marcato',
  'up-bow-down': 'upBow',
  'down-bow-down': 'downBow'
}

const DOWNWARD_ARTICULATIONS = new Set([
  'spiccato-down',
  'snap-pizzicato-down',
  'marcato-down',
  'up-bow-down',
  'down-bow-down'
])

const INVERTED_ORNAMENTS = new Set([ 'turn-inverted', 'mordent-inverted' ])

export function buildMusicModel ({
  blobs,
  stems,
  barLines,
  curves = [],
  hairpins = [],
  tupletBrackets = [],
  octaveSpans = [],
  pedalBrackets = [],
  tremoloStrokes = [],
  glissandoLines = [],
  voltaBrackets = [],
  lines = []
}, staves) {
  if (!staves.length) {
    return { clefs: [], clefsExplicit: [], keySignatureName: null, timeSignatureParams: null, measures: [] }
  }
  const staveMusic = staves.map((stave, staveIndex) =>
    buildStaveMusic(blobs, stems, stave, staveIndex)
  )
  const measureDuration = timeInWholeNotes(staveMusic[0].timeSignatureParams)
  const systemIndexes = [ ...new Set(staves.map((stave) => stave.systemIndex ?? 0)) ].sort((first, second) => first - second)
  const measures = []
  for (const systemIndex of systemIndexes) {
    const internalBarLines = barLines.filter((barLine) =>
      (barLine.systemIndex ?? 0) === systemIndex && (barLine.kind === undefined || barLine.kind === 'internal'))
    const systemMusic = staveMusic.filter((music) => (staves[music.staveIndex].systemIndex ?? 0) === systemIndex)
    const measuresOfStaves = systemMusic.map((music) => buildMeasuresFromBarLines(music.units, internalBarLines))
    const measureCount = internalBarLines.length + 1
    for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
      const stavesOfMeasure = systemMusic.map((music, index) => {
        const units = measuresOfStaves[index][measureIndex] || []
        const voices = fillRestsInMeasures(splitVoicesByStemDirection(units, staves[music.staveIndex].intervalBetweenStaveLines), measureDuration)
        markBeamedWithNext(voices, staves[music.staveIndex].intervalBetweenStaveLines)
        return {
          staveIndex: music.staveIndex,
          voices,
          ...(measureIndex === 0 ? { sourceBlobs: music.signatureBlobs } : {})
        }
      })
      const opening = barLines.find((barLine) => (barLine.systemIndex ?? 0) === systemIndex && barLine.kind === 'opening')
      measures.push({
        measureIndex: measures.length,
        systemIndex,
        staves: stavesOfMeasure,
        closingBarLineName: internalBarLines[measureIndex]?.barLineName || 'barLine',
        ...(measureIndex === 0 && opening ? { openingBarLineName: opening.barLineName } : {}),
        ...(measureIndex === 0 && !opening ? { withoutStartBarLine: true } : {})
      })
    }
  }
  mergeCrossStaveUnits(measures, staves)
  attachMeasureFurniture(measures, blobs, staves, barLines)
  attachMeasureRests(measures, blobs, staves, barLines)
  attachSimiles(measures, blobs, staves, barLines)
  attachUnitParentheses(measures, blobs, staves)
  attachArpeggios(measures, blobs, staves)
  attachFermatas(measures, blobs, staves, barLines)
  attachRestPositions(measures, staves, barLines, measureDuration)
  attachOctaveSpans(measures, blobs, staves, [ ...octaveSpans, ...lines.filter((line) => line.className === 'octave-span') ])
  attachPedalMarks(measures, blobs, staves, [ ...pedalBrackets, ...lines.filter((line) => line.className === 'pedal-bracket') ])
  attachTuplets(measures, blobs, staves, [ ...tupletBrackets, ...lines.filter((line) => line.className === 'tuplet-bracket') ])
  attachTremolos(measures, staves, [ ...tremoloStrokes, ...lines.filter((line) => line.className === 'tremolo-stroke') ])
  attachGlissandi(measures, staves, [ ...glissandoLines, ...lines.filter((line) => [ 'glissando-line', 'glissando-wave' ].includes(line.className)) ])
  attachVoltas(measures, blobs, staves, barLines, [ ...voltaBrackets, ...lines.filter((line) => line.className === 'volta-bracket') ])
  attachCurves(measures, curves, staves)
  attachHairpins(measures, hairpins, staves)
  const musicModel = {
    clefs: staveMusic.map((music) => music.clef),
    clefsExplicit: staveMusic.map((music) => music.clefExplicit),
    keySignatureName: staveMusic[0].keySignatureName,
    timeSignatureParams: staveMusic[0].timeSignatureParams,
    measures
  }
  attachMeasureNumbers(musicModel, blobs, staves, barLines)
  measureLayoutSpacingAndCorrections(musicModel, staves)
  return musicModel
}

function attachHairpins (measures, hairpins, staves) {
  const units = measures.flatMap((measure) => measure.staves.flatMap((stave) =>
    stave.voices.flatMap((voice) => voice.filter((unit) => !unit.isRest))))
  for (const [ index, hairpin ] of hairpins.entries()) {
    const candidates = units.filter((unit) => unit.sourceBlobs.some((blob) => blob.staveIndex === hairpin.staveIndex))
    const left = nearestUnit(candidates, hairpin.box.x)
    const right = nearestUnit(candidates, hairpin.box.x + hairpin.box.w - 1)
    if (!left || !right || left === right) {
      continue
    }
    const intervalBetweenStaveLines = staves[hairpin.staveIndex].intervalBetweenStaveLines
    if (Math.abs(left.x - hairpin.box.x) > 2 * intervalBetweenStaveLines || Math.abs(right.x - (hairpin.box.x + hairpin.box.w - 1)) > 2 * intervalBetweenStaveLines) {
      continue
    }
    const key = `crescendo-or-diminuendo-${index + 1}`
    const stave = staves[hairpin.staveIndex]
    left.dynamicChangeMark = {
      key,
      type: hairpin.className,
      direction: hairpin.box.y + hairpin.box.h / 2 > stave.bottomY ? 'down' : 'up',
      yCorrection: 0
    }
    right.dynamicChangeMark = { key, finish: true }
    left.sourceBlobs = [ ...new Set([ ...(left.sourceBlobs || []), hairpin ]) ]
    right.sourceBlobs = [ ...new Set([ ...(right.sourceBlobs || []), hairpin ]) ]
  }
}

function attachCurves (measures, curves, staves) {
  const units = measures.flatMap((measure) => measure.staves.flatMap((stave) =>
    stave.voices.flatMap((voice) => voice.filter((unit) => !unit.isRest))))
  let slurIndex = 0
  for (const curve of curves) {
    const candidates = units.filter((unit) => unit.sourceBlobs.some((blob) => blob.staveIndex === curve.staveIndex))
    const left = nearestUnit(candidates, curve.box.x)
    const right = nearestUnit(candidates, curve.box.x + curve.box.w - 1)
    if (!left || !right || left === right) {
      continue
    }
    const intervalBetweenStaveLines = staves[curve.staveIndex].intervalBetweenStaveLines
    if (Math.abs(left.x - curve.box.x) > 1.5 * intervalBetweenStaveLines || Math.abs(right.x - (curve.box.x + curve.box.w - 1)) > 1.5 * intervalBetweenStaveLines) {
      continue
    }
    const leftPitch = left.notes[0]
    const rightPitch = right.notes[0]
    const isTie = curve.box.w <= 3 * intervalBetweenStaveLines && leftPitch && rightPitch &&
      leftPitch.noteName === rightPitch.noteName && leftPitch.octaveNumber === rightPitch.octaveNumber
    if (isTie) {
      left.tiedWithNext = {}
      left.sourceBlobs = [ ...new Set([ ...(left.sourceBlobs || []), curve ]) ]
      right.sourceBlobs = [ ...new Set([ ...(right.sourceBlobs || []), curve ]) ]
      continue
    }
    const key = `slur-${++slurIndex}`
    left.slurMarks = [ ...(left.slurMarks || []), { key, direction: curve.depth < 0 ? 'up' : 'down' } ]
    right.slurMarks = [ ...(right.slurMarks || []), { key, finish: true } ]
    left.sourceBlobs = [ ...new Set([ ...(left.sourceBlobs || []), curve ]) ]
    right.sourceBlobs = [ ...new Set([ ...(right.sourceBlobs || []), curve ]) ]
  }
}

function nearestUnit (units, x) {
  return units.sort((first, second) => Math.abs(first.x - x) - Math.abs(second.x - x))[0] || null
}

function attachMeasureFurniture (measures, blobs, staves, barLines) {
  const systemIndexes = [ ...new Set(measures.map((measure) => measure.systemIndex ?? 0)) ]
  for (const systemIndex of systemIndexes) {
    const systemMeasures = measures.filter((measure) => (measure.systemIndex ?? 0) === systemIndex)
    const systemStaves = staves.filter((stave) => (stave.systemIndex ?? 0) === systemIndex)
    const internal = barLines.filter((barLine) => (barLine.systemIndex ?? 0) === systemIndex && barLine.kind === 'internal')
    const firstMeasure = systemMeasures[0]
    const connections = blobs.filter((blob) => roleOf(blob.className) === 'connection' &&
      centerX(blob) >= Math.min(...systemStaves.map((stave) => stave.xStart)) - 4 * systemStaves[0].intervalBetweenStaveLines &&
      centerX(blob) <= Math.min(...systemStaves.map((stave) => stave.xStart)) + 2 * systemStaves[0].intervalBetweenStaveLines)
    if (connections.length) {
      firstMeasure.connectionsParams = connections.map((blob) => ({
        name: blob.className,
        staveStartNumber: 0,
        staveEndNumber: systemStaves.length - 1
      }))
      firstMeasure.sourceBlobs = [ ...(firstMeasure.sourceBlobs || []), ...connections ]
    }
    for (const blob of blobs.filter((item) => item.className === 'repeat-dot')) {
      const boundaries = barLines.filter((barLine) => (barLine.systemIndex ?? 0) === systemIndex)
      const nearest = boundaries.sort((first, second) => Math.abs(first.x - centerX(blob)) - Math.abs(second.x - centerX(blob)))[0]
      if (!nearest || Math.abs(nearest.x - centerX(blob)) > 2 * systemStaves[0].intervalBetweenStaveLines) {
        continue
      }
      const before = boundaries.filter((barLine) => barLine.x < nearest.x && barLine.kind === 'internal').length
      if (centerX(blob) < nearest.x) {
        systemMeasures[before].repeatDotsMarkAtTheEnd = true
        systemMeasures[before].sourceBlobs = [ ...(systemMeasures[before].sourceBlobs || []), blob ]
      } else if (systemMeasures[before + 1]) {
        systemMeasures[before + 1].repeatDotsMarkAtTheStart = true
        systemMeasures[before + 1].sourceBlobs = [ ...(systemMeasures[before + 1].sourceBlobs || []), blob ]
      }
    }
    for (const blob of blobs.filter((item) => item.className === 'coda' || item.className === 'segno')) {
      const measureIndex = systemMeasures.findIndex((measure, index) => {
        const left = index === 0 ? Math.min(...systemStaves.map((stave) => stave.xStart)) : internal[index - 1].x
        const right = index < internal.length ? internal[index].x : Math.max(...systemStaves.map((stave) => stave.xEnd))
        return centerX(blob) >= left && centerX(blob) <= right
      })
      if (measureIndex >= 0) {
        const measure = systemMeasures[measureIndex]
        const key = blob.className === 'coda' ? 'coda' : 'sign'
        const left = measureIndex === 0 ? Math.min(...systemStaves.map((stave) => stave.xStart)) : internal[measureIndex - 1].x
        const right = measureIndex < internal.length ? internal[measureIndex].x : Math.max(...systemStaves.map((stave) => stave.xEnd))
        measure[key] = { measurePosition: centerX(blob) - left <= right - centerX(blob) ? 'start' : 'end' }
        measure.sourceBlobs = [ ...(measure.sourceBlobs || []), blob ]
      }
    }
  }
}

function buildStaveMusic (blobs, stems, stave, staveIndex) {
  const intervalBetweenStaveLines = stave.intervalBetweenStaveLines
  const staveBlobs = blobs.filter((blob) => blob.staveIndex === staveIndex)
  const heads = staveBlobs.filter((blob) => roleOf(blob.className) === 'head')
  const rests = staveBlobs.filter((blob) => roleOf(blob.className) === 'rest')
  const clefBlob = staveBlobs.find((blob) => roleOf(blob.className) === 'clef')
  const clef = clefBlob ? CLEF_NAMES[clefBlob.className] || 'treble' : 'treble'
  const { keySignatureName, timeSignatureParams } = inferKeyAndTimeSignature(staveBlobs, heads, intervalBetweenStaveLines)
  const firstHeadX = heads.length ? Math.min(...heads.map((head) => head.box.x)) : Infinity
  const signatureBlobs = staveBlobs.filter((blob) =>
    [ 'clef', 'meter' ].includes(roleOf(blob.className)) ||
    (roleOf(blob.className) === 'accidental' && blob.box.x < firstHeadX - 0.3 * intervalBetweenStaveLines)
  )
  let clefAura = clef
  const units = groupChordsByHorizontalProximity(heads, intervalBetweenStaveLines).map((chord) => {
    const unit = buildNoteUnit(chord, staveBlobs, stems, clefAura, intervalBetweenStaveLines, clefBlob)
    if (unit.clefBefore) {
      clefAura = unit.clefBefore
    }
    return unit
  })
  for (const rest of rests) {
    const dotBlobs = dotsOf({ x: centerX(rest), heads: [ rest ] }, staveBlobs, intervalBetweenStaveLines)
    units.push({
      x: rest.box.x,
      notes: [],
      isRest: true,
      restPosition: rest.positionNumber,
      unitDuration: REST_DURATIONS[rest.className] || 0.25,
      numberOfDots: dotBlobs.length,
      stemDirection: 'up',
      beamedWithNext: false,
      sourceBlobs: [ rest, ...dotBlobs ]
    })
  }
  units.sort((first, second) => first.x - second.x)
  return { staveIndex, clef, clefExplicit: Boolean(clefBlob), keySignatureName, timeSignatureParams, signatureBlobs, units }
}

function buildNoteUnit (chord, staveBlobs, stems, clef, intervalBetweenStaveLines, initialClefBlob) {
  const clefChange = staveBlobs.filter((blob) => roleOf(blob.className) === 'clef' && blob !== initialClefBlob &&
    centerX(blob) < chord.x && chord.x - centerX(blob) <= 2 * intervalBetweenStaveLines &&
    CLEF_NAMES[blob.className]).sort((first, second) => centerX(second) - centerX(first))[0]
  const effectiveClef = clefChange ? CLEF_NAMES[clefChange.className] : clef
  const signatureBlobs = clefChange
    ? staveBlobs.filter((blob) => blob.box.x >= clefChange.box.x && roleOf(blob.className) === 'accidental')
    : []
  const { keySignatureName: keySignatureBefore } = clefChange
    ? inferKeyAndTimeSignature(signatureBlobs, chord.heads, intervalBetweenStaveLines)
    : { keySignatureName: null }
  const stem = nearestStem(chord, stems, intervalBetweenStaveLines)
  const keyBlobs = chord.heads.flatMap((head) => accidentalsOf(head, staveBlobs, intervalBetweenStaveLines))
  const dotBlobs = dotsOf(chord, staveBlobs, intervalBetweenStaveLines)
  const markBlobs = marksOf(chord, staveBlobs, intervalBetweenStaveLines)
  const notes = chord.heads.map((head) => ({
    ...assignPitchByPositionNumber(head.positionNumber, effectiveClef),
    positionNumber: head.positionNumber,
    keys: accidentalsOf(head, staveBlobs, intervalBetweenStaveLines)
      .map((blob) => KEY_TYPES[blob.className])
      .filter(Boolean),
    ...(head.className === 'ghost-head' ? { isGhost: true } : {})
  }))
  const isOpenHead = chord.heads.every((head) => head.className === 'notehead-open')
  const isOrdinaryGrace = chord.heads.every((head) =>
    head.box.w <= 0.95 * intervalBetweenStaveLines && head.box.h <= 0.8 * intervalBetweenStaveLines
  )
  const hasGraceCrushLine = markBlobs.some((blob) => blob.className === 'grace-slash')
  const articulationParams = markBlobs.filter((blob) => UNIT_ARTICULATIONS[blob.className]).map((blob) => ({
    name: UNIT_ARTICULATIONS[blob.className],
    direction: DOWNWARD_ARTICULATIONS.has(blob.className) || centerY(blob) >= mean(chord.heads.map(centerY)) ? 'down' : 'up',
    ...(INVERTED_ORNAMENTS.has(blob.className) ? { inverted: true } : {})
  }))
  const breathMark = markBlobs.find((blob) => [ 'breath-mark', 'breath-mark-double-slash' ].includes(blob.className))
  return {
    x: chord.x,
    notes,
    isRest: false,
    unitDuration: inferDurationFromNoteShapes({
      isOpenHead,
      hasStem: Boolean(stem),
      beamCount: stem ? stem.beamCount : 0,
      flagCount: stem ? stem.flagCount : 0,
      headClassName: chord.heads[0].className
    }),
    numberOfDots: dotBlobs.length,
    stemDirection: stem ? stem.stemDirection : 'up',
    beamedWithNext: false,
    ...(articulationParams.length ? { articulationParams } : {}),
    ...((hasGraceCrushLine || isOrdinaryGrace) ? { isGrace: true } : {}),
    ...(hasGraceCrushLine ? { hasGraceCrushLine: true } : {}),
    ...(breathMark ? { breathMarkBefore: { type: breathMark.className === 'breath-mark-double-slash' ? 'double slash' : 'comma' } } : {}),
    ...(clefChange ? { clefBefore: effectiveClef } : {}),
    ...(keySignatureBefore ? { keySignatureBefore } : {}),
    sourceBlobs: [ ...chord.heads, ...keyBlobs, ...dotBlobs, ...markBlobs, ...signatureBlobs, ...(clefChange ? [ clefChange ] : []) ],
    stem
  }
}

function marksOf (chord, staveBlobs, intervalBetweenStaveLines) {
  const headCenterY = mean(chord.heads.map(centerY))
  return staveBlobs.filter((blob) => {
    const isMark = UNIT_ARTICULATIONS[blob.className] || blob.className === 'grace-slash' ||
      [ 'breath-mark', 'breath-mark-double-slash' ].includes(blob.className)
    return isMark && Math.abs(centerX(blob) - chord.x) <= 1.25 * intervalBetweenStaveLines &&
      Math.abs(centerY(blob) - headCenterY) <= 3 * intervalBetweenStaveLines
  })
}

function centerX (blob) {
  return blob.box.x + (blob.box.w - 1) / 2
}

function centerY (blob) {
  return blob.box.y + (blob.box.h - 1) / 2
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function nearestStem (chord, stems, intervalBetweenStaveLines) {
  const near = stems
    .filter((stem) => chord.heads.some((head) => {
      const center = centerY(head)
      const touchesEnd = Math.abs(stem.y1 - center) <= head.box.h || Math.abs(stem.y2 - center) <= head.box.h
      return stem.staveIndex === head.staveIndex && touchesEnd && Math.abs(stem.x - chord.x) <= 0.8 * intervalBetweenStaveLines
    }))
    .sort((first, second) => Math.abs(first.x - chord.x) - Math.abs(second.x - chord.x))
  return near[0] || null
}

// An accidental hugs the head it alters: close on the left, at its height.
function accidentalsOf (head, staveBlobs, intervalBetweenStaveLines) {
  return staveBlobs.filter((blob) => {
    const closingParenthesisBetween = staveBlobs.some((candidate) => candidate.className === 'parenthesis-close' &&
      candidate.box.x >= blob.box.x + blob.box.w && candidate.box.x + candidate.box.w <= head.box.x)
    return roleOf(blob.className) === 'accidental' &&
      KEY_TYPES[blob.className] &&
      blob.box.x + blob.box.w / 2 < head.box.x &&
      head.box.x - (blob.box.x + blob.box.w) <= (closingParenthesisBetween ? 1.5 : 0.9) * intervalBetweenStaveLines &&
      Math.abs(blob.positionNumber - head.positionNumber) <= 1
  })
}

function dotsOf (chord, staveBlobs, intervalBetweenStaveLines) {
  return staveBlobs.filter((blob) =>
    roleOf(blob.className) === 'dot' &&
    blob.box.x > chord.x &&
    blob.box.x - chord.x <= 1.1 * intervalBetweenStaveLines &&
    chord.heads.some((head) => Math.abs(blob.positionNumber - head.positionNumber) <= 2)
  )
}

// A beam reaches from one stem's end to the next stem's end: the earlier unit
// of the pair is the beamed one.
function markBeamedWithNext (voices, intervalBetweenStaveLines) {
  for (const voice of voices) {
    const withStems = voice.filter((unit) => unit.stem)
    for (let index = 1; index < withStems.length; index++) {
      const previous = withStems[index - 1]
      const current = withStems[index]
      const sharesBeam = previous.stem.beamCount > 0 && current.stem.beamCount > 0 &&
        previous.stem.beamRows.some((row) => current.stem.beamRows.some((other) => Math.abs(other - row) <= 0.25 * intervalBetweenStaveLines))
      if (sharesBeam) {
        previous.beamedWithNext = true
        if (previous.stem.beamCount === 1 && current.stem.beamCount > 1) {
          previous.beamedWithNextWithJustOneBeam = true
        }
      }
    }
  }
}

function timeInWholeNotes (timeSignatureParams) {
  if (!timeSignatureParams) {
    return 1
  }
  return Number(timeSignatureParams.numerator) / Number(timeSignatureParams.denominator)
}

export default buildMusicModel
