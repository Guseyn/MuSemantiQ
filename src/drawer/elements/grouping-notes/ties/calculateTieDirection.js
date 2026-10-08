'use strict'

export default function (leftTieJunctionPoint, rightTieJunctionPoint) {
  if (leftTieJunctionPoint && rightTieJunctionPoint) {
    const customDirection = leftTieJunctionPoint.customDirection
    const leftNumberOfNotesPositions = leftTieJunctionPoint.singleUnit.sortedNotes.length
    const rightNumberOfNotesPositions = rightTieJunctionPoint.singleUnit.sortedNotes.length
    const maxNumberOfNotesPositions = Math.max(leftNumberOfNotesPositions, rightNumberOfNotesPositions)

    if ((leftNumberOfNotesPositions === 1 && rightNumberOfNotesPositions === 1) || (leftNumberOfNotesPositions === 1 && (rightTieJunctionPoint.isFirst || rightTieJunctionPoint.isLast))) {
      if (typeof customDirection === 'string') {
        if (customDirection === 'down' || customDirection === 'up') {
          return customDirection
        }
      }
      return (leftTieJunctionPoint.singleUnit.stemDirection === 'up') ? 'down' : 'up'
    }

    if (leftTieJunctionPoint.singleUnit.anySeconds || rightTieJunctionPoint.singleUnit.anySeconds) {
      if (leftTieJunctionPoint.isLast) {
        return 'down'
      }
      if (leftTieJunctionPoint.isFirst) {
        return 'up'
      }
      if (rightTieJunctionPoint.isFirst) {
        return 'up'
      }
      if (rightTieJunctionPoint.isLast) {
        return 'down'
      }
      if (typeof customDirection === 'string') {
        if (customDirection === 'down' || customDirection === 'up') {
          return customDirection
        }
      }
      if (leftTieJunctionPoint.positionIndex <= maxNumberOfNotesPositions / 2) {
        return 'up'
      }
      return 'down'
    }

    if (typeof customDirection === 'string') {
      if (customDirection === 'down' || customDirection === 'up') {
        return customDirection
      }
    }
    if ((leftTieJunctionPoint.isFirst && rightTieJunctionPoint.isFirst) || (leftTieJunctionPoint.positionIndex <= maxNumberOfNotesPositions / 2 && rightTieJunctionPoint.positionIndex <= maxNumberOfNotesPositions / 2 && leftTieJunctionPoint.positionIndex !== leftNumberOfNotesPositions - 1 && rightTieJunctionPoint.positionIndex !== rightNumberOfNotesPositions - 1)) {
      return 'up'
    }
    return 'down'
  }

  const tieJunctionPoint = leftTieJunctionPoint || rightTieJunctionPoint
  if (tieJunctionPoint) {
    const customDirection = tieJunctionPoint.customDirection
    const numberOfNotesPositions = tieJunctionPoint.singleUnit.sortedNotesPositionNumbers.length
    if (numberOfNotesPositions === 1) {
      if (typeof customDirection === 'string') {
        if (customDirection === 'down' || customDirection === 'up') {
          return customDirection
        }
      }
      return (tieJunctionPoint.singleUnit.stemDirection === 'up') ? 'down' : 'up'
    }
    if (tieJunctionPoint.isFirst || (tieJunctionPoint.positionIndex <= numberOfNotesPositions / 2 && tieJunctionPoint.positionIndex !== numberOfNotesPositions - 1)) {
      return 'up'
    }
  }
  return 'down'
}
