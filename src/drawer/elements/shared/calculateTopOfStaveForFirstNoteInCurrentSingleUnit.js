'use strict'

export default function (staveIndex, currentSingleUnit, topOffsetsForEachStave) {
  let staveIndexOfFirstNoteInCurrentSingleUnit = staveIndex
  if (currentSingleUnit.sortedNotes[0].stave === 'prev') {
    staveIndexOfFirstNoteInCurrentSingleUnit -= 1
  } else if (currentSingleUnit.sortedNotes[0].stave === 'next') {
    staveIndexOfFirstNoteInCurrentSingleUnit += 1
  }
  let topOfStaveForFirstNoteInCurrentSingleUnit
  if (topOffsetsForEachStave[staveIndexOfFirstNoteInCurrentSingleUnit] !== undefined) {
    topOfStaveForFirstNoteInCurrentSingleUnit = topOffsetsForEachStave[staveIndexOfFirstNoteInCurrentSingleUnit]
  } else {
    topOfStaveForFirstNoteInCurrentSingleUnit = topOffsetsForEachStave[staveIndex]
  }
  return topOfStaveForFirstNoteInCurrentSingleUnit
}
