'use strict'

export default function (staveIndex, currentSingleUnit, topOffsetsForEachStave) {
  let staveIndexOfLastNoteInCurrentSingleUnit = staveIndex
  if (currentSingleUnit.sortedNotes[currentSingleUnit.sortedNotes.length - 1].stave === 'prev') {
    staveIndexOfLastNoteInCurrentSingleUnit -= 1
  } else if (currentSingleUnit.sortedNotes[currentSingleUnit.sortedNotes.length - 1].stave === 'next') {
    staveIndexOfLastNoteInCurrentSingleUnit += 1
  }
  let topOfStaveForLastNoteInCurrentSingleUnit
  if (topOffsetsForEachStave[staveIndexOfLastNoteInCurrentSingleUnit] !== undefined) {
    topOfStaveForLastNoteInCurrentSingleUnit = topOffsetsForEachStave[staveIndexOfLastNoteInCurrentSingleUnit]
  } else {
    topOfStaveForLastNoteInCurrentSingleUnit = topOffsetsForEachStave[staveIndex]
  }
  return topOfStaveForLastNoteInCurrentSingleUnit
}
