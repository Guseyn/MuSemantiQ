'use strict'

// The music model uses the language's schema names wherever they exist. Only
// OMR bookkeeping is removed here; visible measure, stave, unit and note fields
// must reach the serializer instead of being lost behind a second whitelist.
export function buildPageSchemaFromMusicModel (musicModel) {
  const pageFields = withoutFields(musicModel, [ 'measures', 'clefs', 'clefsExplicit', 'keySignatureName', 'timeSignatureParams' ])
  return {
    ...pageFields,
    measuresParams: musicModel.measures.map((measure, measureIndex) => ({
      ...withoutFields(measure, [ 'measureIndex', 'systemIndex', 'staves', 'sourceBlobs' ]),
      pageIndex: 0,
      measureIndexOnPage: measureIndex,
      pageLineNumber: (measure.systemIndex ?? 0) + 1,
      isLastMeasureOnPageLine: musicModel.measures[measureIndex + 1]?.systemIndex !== measure.systemIndex,
      closingBarLineName: measure.closingBarLineName || 'barLine',
      ...(measureIndex === 0 && musicModel.keySignatureName ? { keySignatureName: musicModel.keySignatureName } : {}),
      ...(measureIndex === 0 && musicModel.timeSignatureParams ? { timeSignatureParams: musicModel.timeSignatureParams } : {}),
      stavesParams: measure.staves.map((stave) => ({
        ...withoutFields(stave, [ 'staveIndex', 'voices', 'sourceBlobs' ]),
        clef: stave.clef || musicModel.clefs[stave.staveIndex],
        voicesParams: stave.voices.map((voice) => voice.map(schemaUnit))
      }))
    }))
  }
}

function schemaUnit (unit) {
  const fields = withoutFields(unit, [ 'x', 'sourceBlobs', 'stem', 'restPosition', 'keys', 'notes', 'isRest' ])
  if (unit.isRest) {
    return {
      ...fields,
      notes: [ { positionNumber: unit.restPosition / 2, id: 0 } ],
      isRest: true,
      beamedWithNext: false
    }
  }
  const keysParams = []
  unit.notes.forEach((note) => {
    (note.keys || []).forEach((keyType) => {
      keysParams.push({
        noteName: note.noteName,
        octaveNumber: note.octaveNumber,
        positionNumber: note.positionNumber / 2,
        ...(note.stave ? { stave: note.stave } : {}),
        keyType,
        id: keysParams.length
      })
    })
  })
  return {
    ...fields,
    notes: unit.notes.map((note, id) => ({
      ...withoutFields(note, [ 'keys' ]),
      positionNumber: note.positionNumber / 2,
      id
    })),
    ...(keysParams.length ? { keysParams } : {}),
    beamedWithNext: unit.beamedWithNext
  }
}

function withoutFields (value, excluded) {
  return Object.fromEntries(Object.entries(value)
    .filter(([ key, fieldValue ]) => !excluded.includes(key) && fieldValue !== null && fieldValue !== undefined))
}

export default buildPageSchemaFromMusicModel
