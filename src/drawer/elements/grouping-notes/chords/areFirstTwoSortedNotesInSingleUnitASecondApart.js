'use strict'

import calculateStaveIndexOfNoteConsideringItsStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/calculateStaveIndexOfNoteConsideringItsStave.js'

export default function (singleUnit) {
  const secondDelta = 0.5
  const firstSortedNote = singleUnit.sortedNotes[0]
  const secondSortedNote = singleUnit.sortedNotes[1]
  if (!secondSortedNote) {
    return false
  }
  const staveIndexOfFirstSortedNoteConsideringItsStave = calculateStaveIndexOfNoteConsideringItsStave(firstSortedNote)
  const staveIndexOfSecondSortedNoteConsideringItsStave = calculateStaveIndexOfNoteConsideringItsStave(secondSortedNote)
  return (secondSortedNote.positionNumber - firstSortedNote.positionNumber === secondDelta) &&
    (staveIndexOfFirstSortedNoteConsideringItsStave === staveIndexOfSecondSortedNoteConsideringItsStave)
}
