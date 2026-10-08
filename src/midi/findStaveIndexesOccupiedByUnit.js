'use strict'

export default function (unitParams, staveIndex) {
  const staveIndexes = [ staveIndex ]
  for (let noteIndex = 0; noteIndex < unitParams.notes.length; noteIndex++) {
    if (staveIndexes.indexOf(unitParams.notes[noteIndex].staveIndexConsideringStavePosition) === -1) {
      staveIndexes.push(unitParams.notes[noteIndex].staveIndexConsideringStavePosition)
    }
  }
  return staveIndexes
}
