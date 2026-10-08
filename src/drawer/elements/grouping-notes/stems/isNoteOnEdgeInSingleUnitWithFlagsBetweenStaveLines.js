'use strict'

export default function (numberOfStaveLines, sortedNotes, withFlags, stemDirection) {
  return withFlags && (
    (stemDirection === 'up' && Math.abs(sortedNotes[0].positionNumber * 10 % 2) !== 0) ||
    (stemDirection === 'down' && Math.abs(sortedNotes[sortedNotes.length - 1].positionNumber * 10 % 2) !== 0)
  )
}
