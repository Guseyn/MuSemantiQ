'use strict'

import calculateStaveIndexOfNoteConsideringItsStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/calculateStaveIndexOfNoteConsideringItsStave.js'

export default function (singleUnit) {
  const secondDelta = 0.5
  const lastSortedNote = singleUnit.sortedNotes[singleUnit.sortedNotes.length - 1]
  const noteBeforeLastSortedNote = singleUnit.sortedNotes[singleUnit.sortedNotes.length - 2]
  if (!noteBeforeLastSortedNote) {
    return false
  }
  const staveIndexOfLastSortedNoteConsideringItsStave = calculateStaveIndexOfNoteConsideringItsStave(lastSortedNote)
  const staveIndexOfNoteBeforeLastSortedNoteConsideringItsStave = calculateStaveIndexOfNoteConsideringItsStave(noteBeforeLastSortedNote)
  return (lastSortedNote.positionNumber - noteBeforeLastSortedNote.positionNumber === secondDelta) &&
    (staveIndexOfLastSortedNoteConsideringItsStave === staveIndexOfNoteBeforeLastSortedNoteConsideringItsStave)
}
