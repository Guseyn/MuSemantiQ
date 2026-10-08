'use strict'

export default function (sortedNotes, stemDirection) {
  const notesForDisplacedPartOfUnit = []
  let lastSecondIsMet = false
  if (stemDirection === 'up') {
    const lastNoteIndex = sortedNotes.length - 1
    for (let i = lastNoteIndex; i >= 0; i--) {
      if (sortedNotes[i - 1] !== undefined) {
        if (sortedNotes[i].positionNumber - sortedNotes[i - 1].positionNumber === 0.5 && sortedNotes[i].stave === sortedNotes[i - 1].stave) {
          if (!lastSecondIsMet) {
            sortedNotes[i - 1].displaced = true
            notesForDisplacedPartOfUnit.push(sortedNotes[i - 1])
          } else {
            sortedNotes[i - 1].displaced = false
          }
          lastSecondIsMet = !lastSecondIsMet
        } else {
          lastSecondIsMet = false
          sortedNotes[i - 1].displaced = false
        }
      }
    }
    for (let i = 0; i < sortedNotes.length; i++) {
      if (sortedNotes[i].displaced) {
        sortedNotes[i].isOnTheRightSideOfUnit = true
        sortedNotes[i].isOnTheLeftSideOfUnit = false
      } else {
        sortedNotes[i].isOnTheRightSideOfUnit = false
        sortedNotes[i].isOnTheLeftSideOfUnit = true
      }
    }
  } else {
    for (let i = 0; i < sortedNotes.length; i++) {
      if (sortedNotes[i + 1] !== undefined) {
        if (sortedNotes[i + 1].positionNumber - sortedNotes[i].positionNumber === 0.5 && sortedNotes[i + 1].stave === sortedNotes[i].stave) {
          if (!lastSecondIsMet) {
            sortedNotes[i + 1].displaced = true
            notesForDisplacedPartOfUnit.push(sortedNotes[i + 1])
          } else {
            sortedNotes[i + 1].displaced = false
          }
          lastSecondIsMet = !lastSecondIsMet
        } else {
          lastSecondIsMet = false
          sortedNotes[i + 1].displaced = false
        }
      }
    }
    for (let i = 0; i < sortedNotes.length; i++) {
      if (notesForDisplacedPartOfUnit.length === 0) {
        sortedNotes[i].isOnTheRightSideOfUnit = false
        sortedNotes[i].isOnTheLeftSideOfUnit = true
      } else {
        if (sortedNotes[i].displaced) {
          sortedNotes[i].isOnTheRightSideOfUnit = false
          sortedNotes[i].isOnTheLeftSideOfUnit = true
        } else {
          sortedNotes[i].isOnTheRightSideOfUnit = true
          sortedNotes[i].isOnTheLeftSideOfUnit = false
        }
      }
    }
  }
  return notesForDisplacedPartOfUnit
}
