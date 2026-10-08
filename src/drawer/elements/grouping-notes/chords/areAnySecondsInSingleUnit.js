'use strict'

export default function (sortedNotes) {
  const deltaInPositionForSecond = 0.5
  return sortedNotes.some((note, index) => {
    if (sortedNotes[index + 1]) {
      return sortedNotes[index + 1].positionNumber - note.positionNumber === deltaInPositionForSecond &&
        sortedNotes[index + 1].stave === sortedNotes[index].stave
    }
    return false
  })
}
