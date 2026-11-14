'use strict'

import groupChordsByHorizontalProximity from '#msq/omr/translation/groupChordsByHorizontalProximity.js'
import assignPitchByStaffPosition from '#msq/omr/translation/assignPitchByStaffPosition.js'
import inferDurationFromNoteShapes from '#msq/omr/translation/inferDurationFromNoteShapes.js'
import buildMeasuresFromBarLines from '#msq/omr/translation/buildMeasuresFromBarLines.js'
import splitVoicesByStemDirection from '#msq/omr/translation/splitVoicesByStemDirection.js'
import fillRestsInMeasures from '#msq/omr/translation/fillRestsInMeasures.js'
import inferKeyAndTimeSignature from '#msq/omr/translation/inferKeyAndTimeSignature.js'
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
  fermata: 'fermata',
  turn: 'turn',
  mordent: 'mordent',
  trill: 'trill'
}

export function buildMusicModel ({ blobs, stems, barLines, curves = [], hairpins = [] }, staves) {
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
        const voices = fillRestsInMeasures(splitVoicesByStemDirection(units, staves[music.staveIndex].staffSpaceHeightPx), measureDuration)
        markBeamedWithNext(voices)
        return { staveIndex: music.staveIndex, voices }
      })
      measures.push({ measureIndex: measures.length, systemIndex, staves: stavesOfMeasure })
    }
  }
  attachMeasureFurniture(measures, blobs, staves, barLines)
  attachCurves(measures, curves, staves)
  attachHairpins(measures, hairpins, staves)
  return {
    clefs: staveMusic.map((music) => music.clef),
    clefsExplicit: staveMusic.map((music) => music.clefExplicit),
    keySignatureName: staveMusic[0].keySignatureName,
    timeSignatureParams: staveMusic[0].timeSignatureParams,
    measures
  }
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
    const staffSpace = staves[hairpin.staveIndex].staffSpaceHeightPx
    if (Math.abs(left.x - hairpin.box.x) > 2 * staffSpace || Math.abs(right.x - (hairpin.box.x + hairpin.box.w - 1)) > 2 * staffSpace) {
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
    const staffSpace = staves[curve.staveIndex].staffSpaceHeightPx
    if (Math.abs(left.x - curve.box.x) > 1.5 * staffSpace || Math.abs(right.x - (curve.box.x + curve.box.w - 1)) > 1.5 * staffSpace) {
      continue
    }
    const leftPitch = left.notes[0]
    const rightPitch = right.notes[0]
    const isTie = curve.box.w <= 3 * staffSpace && leftPitch && rightPitch &&
      leftPitch.noteName === rightPitch.noteName && leftPitch.octaveNumber === rightPitch.octaveNumber
    if (isTie) {
      left.tiedWithNext = {}
      continue
    }
    const key = `slur-${++slurIndex}`
    left.slurMarks = [ ...(left.slurMarks || []), { key, direction: curve.depth < 0 ? 'up' : 'down' } ]
    right.slurMarks = [ ...(right.slurMarks || []), { key, finish: true } ]
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
      centerX(blob) >= Math.min(...systemStaves.map((stave) => stave.xStart)) - 4 * systemStaves[0].staffSpaceHeightPx &&
      centerX(blob) <= Math.min(...systemStaves.map((stave) => stave.xStart)) + 2 * systemStaves[0].staffSpaceHeightPx)
    if (connections.length) {
      firstMeasure.connectionsParams = connections.map((blob) => ({
        name: blob.className,
        staveStartNumber: 1,
        staveEndNumber: systemStaves.length
      }))
    }
    for (const blob of blobs.filter((item) => item.className === 'repeat-dot')) {
      const boundaries = barLines.filter((barLine) => (barLine.systemIndex ?? 0) === systemIndex)
      const nearest = boundaries.sort((first, second) => Math.abs(first.x - centerX(blob)) - Math.abs(second.x - centerX(blob)))[0]
      if (!nearest || Math.abs(nearest.x - centerX(blob)) > 2 * systemStaves[0].staffSpaceHeightPx) {
        continue
      }
      const before = boundaries.filter((barLine) => barLine.x < nearest.x && barLine.kind === 'internal').length
      if (centerX(blob) < nearest.x) {
        systemMeasures[before].repeatDotsMarkAtTheEnd = true
      } else if (systemMeasures[before + 1]) {
        systemMeasures[before + 1].repeatDotsMarkAtTheStart = true
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
      }
    }
  }
}

function buildStaveMusic (blobs, stems, stave, staveIndex) {
  const staffSpace = stave.staffSpaceHeightPx
  const staveBlobs = blobs.filter((blob) => blob.staveIndex === staveIndex)
  const heads = staveBlobs.filter((blob) => roleOf(blob.className) === 'head')
  const rests = staveBlobs.filter((blob) => roleOf(blob.className) === 'rest')
  const clefBlob = staveBlobs.find((blob) => roleOf(blob.className) === 'clef')
  const clef = clefBlob ? CLEF_NAMES[clefBlob.className] || 'treble' : 'treble'
  const { keySignatureName, timeSignatureParams } = inferKeyAndTimeSignature(staveBlobs, heads, staffSpace)
  let clefAura = clef
  const units = groupChordsByHorizontalProximity(heads, staffSpace).map((chord) => {
    const unit = buildNoteUnit(chord, staveBlobs, stems, clefAura, staffSpace, clefBlob)
    if (unit.clefBefore) {
      clefAura = unit.clefBefore
    }
    return unit
  })
  for (const rest of rests) {
    const dotBlobs = dotsOf({ x: centerX(rest), heads: [ rest ] }, staveBlobs, staffSpace)
    units.push({
      x: rest.box.x,
      notes: [],
      isRest: true,
      restPosition: rest.staffPosition,
      unitDuration: REST_DURATIONS[rest.className] || 0.25,
      numberOfDots: dotBlobs.length,
      stemDirection: 'up',
      beamedWithNext: false,
      sourceBlobs: [ rest, ...dotBlobs ]
    })
  }
  units.sort((first, second) => first.x - second.x)
  return { staveIndex, clef, clefExplicit: Boolean(clefBlob), keySignatureName, timeSignatureParams, units }
}

function buildNoteUnit (chord, staveBlobs, stems, clef, staffSpace, initialClefBlob) {
  const clefChange = staveBlobs.filter((blob) => roleOf(blob.className) === 'clef' && blob !== initialClefBlob &&
    centerX(blob) < chord.x && chord.x - centerX(blob) <= 2 * staffSpace &&
    CLEF_NAMES[blob.className]).sort((first, second) => centerX(second) - centerX(first))[0]
  const effectiveClef = clefChange ? CLEF_NAMES[clefChange.className] : clef
  const stem = nearestStem(chord, stems, staffSpace)
  const keyBlobs = chord.heads.flatMap((head) => accidentalsOf(head, staveBlobs, staffSpace))
  const dotBlobs = dotsOf(chord, staveBlobs, staffSpace)
  const markBlobs = marksOf(chord, staveBlobs, staffSpace)
  const notes = chord.heads.map((head) => ({
    ...assignPitchByStaffPosition(head.staffPosition, effectiveClef),
    staffPosition: head.staffPosition,
    keys: accidentalsOf(head, staveBlobs, staffSpace)
      .map((blob) => KEY_TYPES[blob.className])
      .filter(Boolean),
    ...(head.className === 'ghost-head' ? { isGhost: true } : {})
  }))
  const isOpenHead = chord.heads.every((head) => head.className === 'notehead-open')
  const hasGraceCrushLine = markBlobs.some((blob) => blob.className === 'grace-slash')
  const articulationParams = markBlobs.filter((blob) => UNIT_ARTICULATIONS[blob.className]).map((blob) => ({
    name: UNIT_ARTICULATIONS[blob.className],
    direction: centerY(blob) < mean(chord.heads.map(centerY)) ? 'up' : 'down'
  }))
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
    ...(hasGraceCrushLine ? { isGrace: true, hasGraceCrushLine: true } : {}),
    ...(markBlobs.some((blob) => blob.className === 'breath-mark') ? { breathMarkBefore: 'comma' } : {}),
    ...(clefChange ? { clefBefore: effectiveClef } : {}),
    sourceBlobs: [ ...chord.heads, ...keyBlobs, ...dotBlobs, ...markBlobs, ...(clefChange ? [ clefChange ] : []) ],
    stem
  }
}

function marksOf (chord, staveBlobs, staffSpace) {
  const headCenterY = mean(chord.heads.map(centerY))
  return staveBlobs.filter((blob) => {
    const isMark = UNIT_ARTICULATIONS[blob.className] || blob.className === 'grace-slash' || blob.className === 'breath-mark'
    return isMark && Math.abs(centerX(blob) - chord.x) <= 1.25 * staffSpace &&
      Math.abs(centerY(blob) - headCenterY) <= 3 * staffSpace
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

function nearestStem (chord, stems, staffSpace) {
  const near = stems
    .filter((stem) => chord.heads.some((head) => {
      const center = centerY(head)
      const touchesEnd = Math.abs(stem.y1 - center) <= head.box.h || Math.abs(stem.y2 - center) <= head.box.h
      return stem.staveIndex === head.staveIndex && touchesEnd && Math.abs(stem.x - chord.x) <= 0.8 * staffSpace
    }))
    .sort((first, second) => Math.abs(first.x - chord.x) - Math.abs(second.x - chord.x))
  return near[0] || null
}

// An accidental hugs the head it alters: close on the left, at its height.
function accidentalsOf (head, staveBlobs, staffSpace) {
  return staveBlobs.filter((blob) =>
    roleOf(blob.className) === 'accidental' &&
    KEY_TYPES[blob.className] &&
    blob.box.x + blob.box.w / 2 < head.box.x &&
    head.box.x - (blob.box.x + blob.box.w) <= 0.9 * staffSpace &&
    Math.abs(blob.staffPosition - head.staffPosition) <= 1
  )
}

function dotsOf (chord, staveBlobs, staffSpace) {
  return staveBlobs.filter((blob) =>
    roleOf(blob.className) === 'dot' &&
    blob.box.x > chord.x &&
    blob.box.x - chord.x <= 1.1 * staffSpace &&
    chord.heads.some((head) => Math.abs(blob.staffPosition - head.staffPosition) <= 2)
  )
}

// A beam reaches from one stem's end to the next stem's end: the earlier unit
// of the pair is the beamed one.
function markBeamedWithNext (voices) {
  for (const voice of voices) {
    const withStems = voice.filter((unit) => unit.stem)
    for (let index = 1; index < withStems.length; index++) {
      const previous = withStems[index - 1]
      const current = withStems[index]
      const sharesBeam = previous.stem.beamCount > 0 && current.stem.beamCount > 0 &&
        previous.stem.beamRows.some((row) => current.stem.beamRows.some((other) => Math.abs(other - row) <= 3))
      if (sharesBeam) {
        previous.beamedWithNext = true
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
