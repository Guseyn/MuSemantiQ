'use strict'

import correctStaveIndexOfNoteOrKey from '#msq/drawer/elements/measure-furniture/cross-stave-chords/correctStaveIndexOfNoteOrKey.js'

const compareTwoNotes = (note1, note2) => {
  const staveIndex1 = correctStaveIndexOfNoteOrKey(note1)
  const staveIndex2 = correctStaveIndexOfNoteOrKey(note2)
  if (staveIndex1 < staveIndex2) {
    return -1
  }
  if (staveIndex1 > staveIndex2) {
    return +1
  }
  return note1.positionNumber - note2.positionNumber
}

export default function (notes) {
  return notes.slice(0).sort((note1, note2) => compareTwoNotes(note1, note2))
}
