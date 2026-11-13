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
      pageLineNumber: 1,
      closingBarLineName: 'barLine',
      ...(measureIndex === 0 && musicModel.keySignatureName ? { keySignatureName: musicModel.keySignatureName } : {}),
      ...(measureIndex === 0 && musicModel.timeSignatureParams ? { timeSignatureParams: musicModel.timeSignatureParams } : {}),
      stavesParams: measure.staves.map((stave, staveIndex) => ({
        clef: musicModel.clefs[staveIndex],
        voicesParams: stave.voices.map((voice) => voice.map(schemaUnit))
      }))
    }))
  }
}

function schemaUnit (unit) {
  if (unit.isRest) {
    return {
      notes: [ { positionNumber: unit.restPosition, id: 0 } ],
      isRest: true,
      unitDuration: unit.unitDuration,
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
    beamedWithNext: unit.beamedWithNext
  }
}

export default buildPageSchemaFromMusicModel
