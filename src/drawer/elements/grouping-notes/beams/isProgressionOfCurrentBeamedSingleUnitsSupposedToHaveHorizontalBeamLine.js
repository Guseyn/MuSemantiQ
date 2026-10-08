'use strict'

export default function (currentBeamedSingleUnits, anyStemDirectionChangesInBeamedSingleUnits) {
  if (!anyStemDirectionChangesInBeamedSingleUnits) {
    if (currentBeamedSingleUnits.length <= 2) {
      return false
    }
    let currentProgressionSign
    let currentExtremeNotePositionNumber
    for (let singleUnitIndex = 0; singleUnitIndex < currentBeamedSingleUnits.length; singleUnitIndex++) {
      const currentBeamedSingleUnit = currentBeamedSingleUnits[singleUnitIndex]
      if (currentExtremeNotePositionNumber === undefined) {
        currentExtremeNotePositionNumber = currentBeamedSingleUnit.stemDirection === 'up'
          ? currentBeamedSingleUnit.sortedNotesPositionNumbers[currentBeamedSingleUnit.sortedNotesPositionNumbers.length - 1]
          : currentBeamedSingleUnit.sortedNotesPositionNumbers[0]
        continue
      }
      if (currentProgressionSign === undefined) {
        const prevExtremeNotePositionNumber = currentExtremeNotePositionNumber
        currentExtremeNotePositionNumber = currentBeamedSingleUnit.stemDirection === 'up'
          ? currentBeamedSingleUnit.sortedNotesPositionNumbers[currentBeamedSingleUnit.sortedNotesPositionNumbers.length - 1]
          : currentBeamedSingleUnit.sortedNotesPositionNumbers[0]
        currentProgressionSign = currentExtremeNotePositionNumber >= prevExtremeNotePositionNumber ? 1 : -1
        continue
      }
      const prevExtremeNotePositionNumber = currentExtremeNotePositionNumber
      const prevProgressionSign = currentProgressionSign
      currentExtremeNotePositionNumber = currentBeamedSingleUnit.stemDirection === 'up'
        ? currentBeamedSingleUnit.sortedNotesPositionNumbers[currentBeamedSingleUnit.sortedNotesPositionNumbers.length - 1]
        : currentBeamedSingleUnit.sortedNotesPositionNumbers[0]
      if (currentExtremeNotePositionNumber === prevExtremeNotePositionNumber) {
        return true
      }
      currentProgressionSign = currentExtremeNotePositionNumber >= prevExtremeNotePositionNumber ? 1 : -1
      if (prevProgressionSign !== currentProgressionSign) {
        return true
      }
      continue
    }
    return false
  }
  return true
}
