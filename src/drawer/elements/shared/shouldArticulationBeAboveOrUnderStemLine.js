'use strict'

export default function (singleUnit, direction = 'up') {
  const singleUnitContainsSecondsCloseToArticulation = singleUnit.anySeconds && !singleUnit.isRest && (((direction === 'up' && singleUnit.stemDirection === 'down') || (direction === 'up' && singleUnit.stemless)) ? (singleUnit.sortedNotesPositionNumbers[1] - singleUnit.sortedNotesPositionNumbers[0] === 0.5) : (((direction === 'down' && singleUnit.stemDirection === 'up') || (direction === 'down' && singleUnit.stemless)) ? (singleUnit.sortedNotesPositionNumbers[singleUnit.sortedNotesPositionNumbers.length - 1] - singleUnit.sortedNotesPositionNumbers[singleUnit.sortedNotesPositionNumbers.length - 2] === 0.5) : false))
  const shouldBeAboveOrUnderStemLine = (singleUnit.stemDirection === direction && !singleUnit.isRest && singleUnit.unitDuration !== 1 && singleUnit.unitDuration !== 2) || singleUnitContainsSecondsCloseToArticulation
  return shouldBeAboveOrUnderStemLine
}
