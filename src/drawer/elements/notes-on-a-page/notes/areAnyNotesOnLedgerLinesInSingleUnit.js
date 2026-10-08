'use strict'

export default function (numberOfStaveLines, sortedNotesPositionNumbers) {
  return sortedNotesPositionNumbers.some(notePosition => notePosition <= -1 || notePosition >= numberOfStaveLines)
}
