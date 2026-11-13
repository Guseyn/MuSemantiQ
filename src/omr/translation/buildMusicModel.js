'use strict'

import groupChordsByHorizontalProximity from './groupChordsByHorizontalProximity.js'
import assignPitchByStaffPosition from './assignPitchByStaffPosition.js'
import inferDurationFromNoteShapes from './inferDurationFromNoteShapes.js'
import buildMeasuresFromBarLines from './buildMeasuresFromBarLines.js'
import splitVoicesByStemDirection from './splitVoicesByStemDirection.js'
import fillRestsInMeasures from './fillRestsInMeasures.js'
import inferKeyAndTimeSignature from './inferKeyAndTimeSignature.js'

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
  'rest-whole': 1,
  'rest-half': 0.5,
  'rest-quarter': 0.25,
  'rest-eighth': 0.125,
  'rest-sixteenth': 0.0625
}

const CLEF_NAMES = {
  'clef-treble': 'treble',
  'clef-bass': 'bass',
  'clef-alto': 'alto',
  'clef-tenor': 'tenor'
}

const KEY_TYPES = {
  sharp: 'sharpKey',
  flat: 'flatKey',
  natural: 'naturalKey',
  'double-sharp': 'doubleSharpKey',
  'double-flat': 'doubleFlatKey'
}

export function buildMusicModel ({ blobs, stems, barLines }, staves) {
  const staveMusic = staves.map((stave, staveIndex) =>
    buildStaveMusic(blobs, stems, stave, staveIndex)
  )
  const measureDuration = timeInWholeNotes(staveMusic[0].timeSignatureParams)
  const measureCount = Math.max(...staveMusic.map((music) =>
    buildMeasuresFromBarLines(music.units, barLines).length))
  const measures = []
  for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
    const stavesOfMeasure = staveMusic.map((music) => {
      const measuresOfStave = buildMeasuresFromBarLines(music.units, barLines)
      const units = measuresOfStave[measureIndex] || []
      const voices = fillRestsInMeasures(splitVoicesByStemDirection(units), measureDuration)
      markBeamedWithNext(voices)
      return { staveIndex: music.staveIndex, voices }
    })
    measures.push({ measureIndex, staves: stavesOfMeasure })
  }
  return {
    clefs: staveMusic.map((music) => music.clef),
    keySignatureName: staveMusic[0].keySignatureName,
    timeSignatureParams: staveMusic[0].timeSignatureParams,
    measures
  }
}

function buildStaveMusic (blobs, stems, stave, staveIndex) {
  const staffSpace = stave.staffSpaceHeightPx
  const staveBlobs = blobs.filter((blob) => blob.staveIndex === staveIndex)
  const heads = staveBlobs.filter((blob) => blob.className.startsWith('notehead'))
  const rests = staveBlobs.filter((blob) => blob.className.startsWith('rest-'))
  const clefBlob = staveBlobs.find((blob) => blob.className.startsWith('clef-'))
  const clef = clefBlob ? CLEF_NAMES[clefBlob.className] || 'treble' : 'treble'
  const { keySignatureName, timeSignatureParams } = inferKeyAndTimeSignature(staveBlobs, heads, staffSpace)
  const units = groupChordsByHorizontalProximity(heads, staffSpace).map((chord) =>
    buildNoteUnit(chord, staveBlobs, stems, clef, staffSpace)
  )
  for (const rest of rests) {
    units.push({
      x: rest.box.x,
      notes: [],
      isRest: true,
      restPosition: rest.staffPosition,
      unitDuration: REST_DURATIONS[rest.className] || 0.25,
      numberOfDots: 0,
      stemDirection: 'up',
      beamedWithNext: false,
      sourceBlobs: [ rest ]
    })
  }
  units.sort((first, second) => first.x - second.x)
  return { staveIndex, clef, keySignatureName, timeSignatureParams, units }
}

function buildNoteUnit (chord, staveBlobs, stems, clef, staffSpace) {
  const stem = nearestStem(chord, stems, staffSpace)
  const keyBlobs = chord.heads.flatMap((head) => accidentalsOf(head, staveBlobs, staffSpace))
  const dotBlobs = dotsOf(chord, staveBlobs, staffSpace)
  const notes = chord.heads.map((head) => ({
    ...assignPitchByStaffPosition(head.staffPosition, clef),
    staffPosition: head.staffPosition,
    keys: accidentalsOf(head, staveBlobs, staffSpace)
      .map((blob) => KEY_TYPES[blob.className])
      .filter(Boolean)
  }))
  const isOpenHead = chord.heads.every((head) => head.className === 'notehead-open')
  return {
    x: chord.x,
    notes,
    isRest: false,
    unitDuration: inferDurationFromNoteShapes({
      isOpenHead,
      hasStem: Boolean(stem),
      beamCount: stem ? stem.beamCount : 0,
      flagCount: stem ? stem.flagCount : 0
    }),
    numberOfDots: dotBlobs.length,
    stemDirection: stem ? stem.stemDirection : 'up',
    beamedWithNext: false,
    sourceBlobs: [ ...chord.heads, ...keyBlobs, ...dotBlobs ],
    stem
  }
}

function nearestStem (chord, stems, staffSpace) {
  const near = stems
    .filter((stem) => Math.abs(stem.x - chord.x) <= 0.8 * staffSpace)
    .sort((first, second) => Math.abs(first.x - chord.x) - Math.abs(second.x - chord.x))
  return near[0] || null
}

// An accidental hugs the head it alters: close on the left, at its height.
function accidentalsOf (head, staveBlobs, staffSpace) {
  return staveBlobs.filter((blob) =>
    KEY_TYPES[blob.className] &&
    blob.box.x + blob.box.w / 2 < head.box.x &&
    head.box.x - (blob.box.x + blob.box.w) <= 0.9 * staffSpace &&
    Math.abs(blob.staffPosition - head.staffPosition) <= 1
  )
}

function dotsOf (chord, staveBlobs, staffSpace) {
  return staveBlobs.filter((blob) =>
    blob.className === 'dot' &&
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
