'use strict'

/**
 * The music model, written as the page schema the language produces.
 *
 * Same shapes the parser builds and the serializer prints: measures with
 * staves, staves with voices, voices with units. Key and time signatures sit
 * on the first measure — that is where the language puts them. This is the
 * hand-off: from here on it is `serialize`'s job.
 */

export function buildPageSchemaFromMusicModel (musicModel) {
  return {
    measuresParams: musicModel.measures.map((measure, measureIndex) => ({
      pageIndex: 0,
      measureIndexOnPage: measureIndex,
      pageLineNumber: (measure.systemIndex ?? 0) + 1,
      isLastMeasureOnPageLine: musicModel.measures[measureIndex + 1]?.systemIndex !== measure.systemIndex,
      closingBarLineName: 'barLine',
      ...(measure.connectionsParams ? { connectionsParams: measure.connectionsParams } : {}),
      ...(measure.coda ? { coda: measure.coda } : {}),
      ...(measure.sign ? { sign: measure.sign } : {}),
      ...(measure.repeatDotsMarkAtTheStart ? { repeatDotsMarkAtTheStart: true } : {}),
      ...(measure.repeatDotsMarkAtTheEnd ? { repeatDotsMarkAtTheEnd: true } : {}),
      ...(measureIndex === 0 && musicModel.keySignatureName ? { keySignatureName: musicModel.keySignatureName } : {}),
      ...(measureIndex === 0 && musicModel.timeSignatureParams ? { timeSignatureParams: musicModel.timeSignatureParams } : {}),
      stavesParams: measure.staves.map((stave) => ({
        clef: musicModel.clefs[stave.staveIndex],
        voicesParams: stave.voices.map((voice) => voice.map(schemaUnit))
      }))
    }))
  }
}

function schemaUnit (unit) {
  if (unit.isRest) {
    return {
      notes: [ { positionNumber: unit.restPosition / 2, id: 0 } ],
      isRest: true,
      ...(unit.isFullMeasure ? { isFullMeasure: true } : {}),
      unitDuration: unit.unitDuration,
      ...(unit.numberOfDots ? { numberOfDots: unit.numberOfDots } : {}),
      stemDirection: unit.stemDirection,
      beamedWithNext: false
    }
  }
  const keysParams = []
  unit.notes.forEach((note) => {
    note.keys.forEach((keyType) => {
      keysParams.push({ noteName: note.noteName, keyType, id: keysParams.length })
    })
  })
  return {
    notes: unit.notes.map((note, id) => ({
      noteName: note.noteName,
      octaveNumber: note.octaveNumber,
      ...(note.isGhost ? { isGhost: true } : {}),
      id
    })),
    unitDuration: unit.unitDuration,
    ...(unit.numberOfDots ? { numberOfDots: unit.numberOfDots } : {}),
    stemDirection: unit.stemDirection,
    ...(keysParams.length ? { keysParams } : {}),
    ...(unit.articulationParams ? { articulationParams: unit.articulationParams } : {}),
    ...(unit.isGrace ? { isGrace: true } : {}),
    ...(unit.hasGraceCrushLine ? { hasGraceCrushLine: true } : {}),
    ...(unit.breathMarkBefore ? { breathMarkBefore: unit.breathMarkBefore } : {}),
    ...(unit.clefBefore ? { clefBefore: unit.clefBefore } : {}),
    ...(unit.tiedWithNext ? { tiedWithNext: unit.tiedWithNext } : {}),
    ...(unit.slurMarks ? { slurMarks: unit.slurMarks } : {}),
    ...(unit.dynamicChangeMark ? { dynamicChangeMark: unit.dynamicChangeMark } : {}),
    beamedWithNext: unit.beamedWithNext
  }
}

export default buildPageSchemaFromMusicModel
