'use strict'

export default function (unitHasNotesOnDifferentStaves, note, staveIndex) {
  let staveIndexWhereClefBeforeIsConsidered
  if (unitHasNotesOnDifferentStaves) {
    staveIndexWhereClefBeforeIsConsidered = staveIndex
  } else {
    if ((staveIndexWhereClefBeforeIsConsidered === undefined) || (staveIndexWhereClefBeforeIsConsidered === note.staveIndexConsideringStavePosition)) {
      staveIndexWhereClefBeforeIsConsidered = note.staveIndexConsideringStavePosition
    } else {
      staveIndexWhereClefBeforeIsConsidered = staveIndex
      unitHasNotesOnDifferentStaves = true
    }
  }

  if (staveIndexWhereClefBeforeIsConsidered === undefined) {
    staveIndexWhereClefBeforeIsConsidered = staveIndex
  }

  return staveIndexWhereClefBeforeIsConsidered
}
