'use strict'

import calculateStaveIndexOfNoteConsideringItsStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/calculateStaveIndexOfNoteConsideringItsStave.js'
import areFirstTwoSortedNotesInSingleUnitASecondApart from '#msq/drawer/elements/grouping-notes/chords/areFirstTwoSortedNotesInSingleUnitASecondApart.js'
import areLastTwoSortedNotesInSingleUnitASecondApart from '#msq/drawer/elements/grouping-notes/chords/areLastTwoSortedNotesInSingleUnitASecondApart.js'

const doTwoUnitsHaveSuchDurationsThatTheyCanPotentiallyBeOverlapped = (firstSingleUnit, secondSingleUnit) => {
  if (
    ((firstSingleUnit.unitDuration === 4) && (secondSingleUnit.unitDuration === 4)) ||
    ((firstSingleUnit.unitDuration === 1 / 2) && (secondSingleUnit.unitDuration === 1 / 2)) ||
    ((firstSingleUnit.unitDuration < 1 / 2) && (secondSingleUnit.unitDuration < 1 / 2))
  ) {
    return true
  }
  return false
}

export default function (staveIndex, currentSingleUnit, singleUnitsBefore, styles) {
  const { defaultStemHeightForSingleUnit, graceElementsScaleFactor } = styles
  for (let singleUnitBeforeIndex = 0; singleUnitBeforeIndex < singleUnitsBefore.length; singleUnitBeforeIndex++) {
    let consideredTopPointOfCurrentSingleUnit = currentSingleUnit.top
    if (currentSingleUnit.beamed && currentSingleUnit.stemDirection === 'up') {
      consideredTopPointOfCurrentSingleUnit = Math.min(consideredTopPointOfCurrentSingleUnit, consideredTopPointOfCurrentSingleUnit - defaultStemHeightForSingleUnit * (currentSingleUnit.isGrace ? graceElementsScaleFactor : 1))
    }
    let consideredBottomPointOfCurrentSingleUnit = currentSingleUnit.bottom
    if (currentSingleUnit.beamed && currentSingleUnit.stemDirection === 'down') {
      consideredBottomPointOfCurrentSingleUnit = Math.max(consideredBottomPointOfCurrentSingleUnit, consideredBottomPointOfCurrentSingleUnit + defaultStemHeightForSingleUnit * (currentSingleUnit.isGrace ? graceElementsScaleFactor : 1))
    }
    let consideredTopPointOfSingleUnitBefore = singleUnitsBefore[singleUnitBeforeIndex].top
    if (singleUnitsBefore[singleUnitBeforeIndex].beamed && singleUnitsBefore[singleUnitBeforeIndex].stemDirection === 'up') {
      consideredTopPointOfSingleUnitBefore = Math.min(consideredTopPointOfSingleUnitBefore, consideredTopPointOfSingleUnitBefore - defaultStemHeightForSingleUnit * (singleUnitsBefore[singleUnitBeforeIndex].isGrace ? graceElementsScaleFactor : 1))
    }
    let consideredBottomPointOfSingleUnitBefore = singleUnitsBefore[singleUnitBeforeIndex].bottom
    if (singleUnitsBefore[singleUnitBeforeIndex].beamed && singleUnitsBefore[singleUnitBeforeIndex].stemDirection === 'down') {
      consideredBottomPointOfSingleUnitBefore = Math.max(consideredBottomPointOfSingleUnitBefore, consideredBottomPointOfSingleUnitBefore + defaultStemHeightForSingleUnit * (singleUnitsBefore[singleUnitBeforeIndex].isGrace ? graceElementsScaleFactor : 1))
    }
    const currentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates = (
      (consideredTopPointOfCurrentSingleUnit <= consideredBottomPointOfSingleUnitBefore) &&
      (consideredTopPointOfSingleUnitBefore <= consideredBottomPointOfCurrentSingleUnit)
    )
    const casesWhereCurrentSingleUnitActuallyDoesnotVerticallyOverlapWithSingleUnitBeforeBecauseOfErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates = (
      (currentSingleUnit.stemless && singleUnitsBefore[singleUnitBeforeIndex].stemless) &&
      (currentSingleUnit.sortedNotes.length === 1) &&
      (singleUnitsBefore[singleUnitBeforeIndex].sortedNotes.length === 1) &&
      (Math.abs(currentSingleUnit.sortedNotes[0].positionNumber - singleUnitsBefore[singleUnitBeforeIndex].sortedNotes[0].positionNumber) === 1)
    )
    if (!currentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates || casesWhereCurrentSingleUnitActuallyDoesnotVerticallyOverlapWithSingleUnitBeforeBecauseOfErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates) {
      continue
    }
    const casesWhenCurrentSingleUnitCannotFitInVerticalWithOverlappedSingleUnitsBefore = (
      (currentSingleUnit.isRest || singleUnitsBefore[singleUnitBeforeIndex].isRest || currentSingleUnit.isSimile || singleUnitsBefore[singleUnitBeforeIndex].isSimile) ||
      (currentSingleUnit.stemless || singleUnitsBefore[singleUnitBeforeIndex].stemless) ||
      (currentSingleUnit.stemDirection === singleUnitsBefore[singleUnitBeforeIndex].stemDirection) ||
      // ((currentSingleUnit.numberOfDots > 0) || (singleUnitsBefore[singleUnitBeforeIndex].numberOfDots > 0)) ||
      !doTwoUnitsHaveSuchDurationsThatTheyCanPotentiallyBeOverlapped(currentSingleUnit, singleUnitsBefore[singleUnitBeforeIndex])
    )
    if (casesWhenCurrentSingleUnitCannotFitInVerticalWithOverlappedSingleUnitsBefore) {
      return false
    }
    const firstSortedNoteInCurrentSingleUnit = currentSingleUnit.sortedNotes[0]
    const lastSortedNoteInCurrentSingleUnit = currentSingleUnit.sortedNotes[currentSingleUnit.sortedNotes.length - 1]
    const firstSortedNoteInSingleUnitBefore = singleUnitsBefore[singleUnitBeforeIndex].sortedNotes[0]
    const lastSortedNoteInSingleUnitBefore = singleUnitsBefore[singleUnitBeforeIndex].sortedNotes[singleUnitsBefore[singleUnitBeforeIndex].sortedNotes.length - 1]
    const firstSortedNoteInCurrentSingleUnitStaveIndex = calculateStaveIndexOfNoteConsideringItsStave(firstSortedNoteInCurrentSingleUnit)
    const lastSortedNoteInCurrentSingleUnitStaveIndex = calculateStaveIndexOfNoteConsideringItsStave(lastSortedNoteInCurrentSingleUnit)
    const firstSortedNoteInSingleUnitBeforeStaveIndex = calculateStaveIndexOfNoteConsideringItsStave(firstSortedNoteInSingleUnitBefore)
    const lastSortedNoteInSingleUnitBeforeStaveIndex = calculateStaveIndexOfNoteConsideringItsStave(lastSortedNoteInSingleUnitBefore)
    const lastSortedNoteInCurrentSingleUnitAndFirstSortedNoteInSingleUnitBeforeAreOnTheSameStave = lastSortedNoteInCurrentSingleUnitStaveIndex === firstSortedNoteInSingleUnitBeforeStaveIndex
    const lastSortedNoteInSingleUnitBeforeAndFirstSortedNoteInCurrentSingleUnitAreOnTheSameStave = lastSortedNoteInSingleUnitBeforeStaveIndex === firstSortedNoteInCurrentSingleUnitStaveIndex
    const firstTwoSortedNotesInCurrentSingleUnitAreASecondApart = areFirstTwoSortedNotesInSingleUnitASecondApart(currentSingleUnit)
    const lastTwoSortedNotesInCurrentSingleUnitAreASecondApart = areLastTwoSortedNotesInSingleUnitASecondApart(currentSingleUnit)
    const firstTwoSortedNotesInSingleUnitBeforeAreASecondApart = areFirstTwoSortedNotesInSingleUnitASecondApart(singleUnitsBefore[singleUnitBeforeIndex])
    const lastTwoSortedNotesInSingleUnitBeforeAreASecondApart = areLastTwoSortedNotesInSingleUnitASecondApart(singleUnitsBefore[singleUnitBeforeIndex])
    const conditionOnPositionNumbersBetweenLastSortedNoteInCurrentSingleUnitAndFirstSortedNoteInSingleUnitBeforeThatAffectedByErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates = (lastSortedNoteInCurrentSingleUnit.positionNumber === firstSortedNoteInSingleUnitBefore.positionNumber) || (lastSortedNoteInCurrentSingleUnit.positionNumber === firstSortedNoteInSingleUnitBefore.positionNumber - 1)
    const conditionOnPositionNumbersBetweenLastSortedNoteInSingleUnitBeforeAndFirstSortedNoteInCurrentSingleUnitThatAffectedByErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates = (lastSortedNoteInSingleUnitBefore.positionNumber === firstSortedNoteInCurrentSingleUnit.positionNumber) || (lastSortedNoteInSingleUnitBefore.positionNumber === firstSortedNoteInCurrentSingleUnit.positionNumber - 1)
    const lastSortedNoteInCurrentSingleUnitCanBeOverlappedWithFirstSortedNoteInSingleUnitBefore = conditionOnPositionNumbersBetweenLastSortedNoteInCurrentSingleUnitAndFirstSortedNoteInSingleUnitBeforeThatAffectedByErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates && ((lastSortedNoteInCurrentSingleUnit.isGhost && firstSortedNoteInSingleUnitBefore.isGhost) || (!lastSortedNoteInCurrentSingleUnit.isGhost && !firstSortedNoteInSingleUnitBefore.isGhost)) && (lastSortedNoteInCurrentSingleUnit.stemDirection === 'up') && (firstSortedNoteInSingleUnitBefore.stemDirection === 'down') && lastSortedNoteInCurrentSingleUnitAndFirstSortedNoteInSingleUnitBeforeAreOnTheSameStave && !lastTwoSortedNotesInCurrentSingleUnitAreASecondApart && !firstTwoSortedNotesInSingleUnitBeforeAreASecondApart
    const lastSortedNoteInSingleUnitBeforeCanBeOverlappedWithFirstSortedNoteInCurrentSingleUnit = conditionOnPositionNumbersBetweenLastSortedNoteInSingleUnitBeforeAndFirstSortedNoteInCurrentSingleUnitThatAffectedByErrorInCalculationIfCurrentSingleUnitVerticallyOverlapsWithSingleUnitBeforeInTermsOfCoordinates && ((lastSortedNoteInSingleUnitBefore.isGhost && firstSortedNoteInCurrentSingleUnit.isGhost) || (!lastSortedNoteInSingleUnitBefore.isGhost && !firstSortedNoteInCurrentSingleUnit.isGhost)) && (lastSortedNoteInSingleUnitBefore.stemDirection === 'up') && (firstSortedNoteInCurrentSingleUnit.stemDirection === 'down') && lastSortedNoteInSingleUnitBeforeAndFirstSortedNoteInCurrentSingleUnitAreOnTheSameStave && !lastTwoSortedNotesInSingleUnitBeforeAreASecondApart && !firstTwoSortedNotesInCurrentSingleUnitAreASecondApart
    const currentSingleUnitAndSingleUnitBeforeHaveDifferentStemDirectionsButTheyCollideOnlyInOneNoteInWhichTheyCanBeOverlappedThereforeTheyCanFitInOneVertical = (
      (
        lastSortedNoteInCurrentSingleUnitCanBeOverlappedWithFirstSortedNoteInSingleUnitBefore ||
        lastSortedNoteInSingleUnitBeforeCanBeOverlappedWithFirstSortedNoteInCurrentSingleUnit
      ) &&
      !(
        lastSortedNoteInCurrentSingleUnitCanBeOverlappedWithFirstSortedNoteInSingleUnitBefore &&
        lastSortedNoteInSingleUnitBeforeCanBeOverlappedWithFirstSortedNoteInCurrentSingleUnit &&
        currentSingleUnit.sortedNotes.length === 2 && singleUnitsBefore[singleUnitBeforeIndex].sortedNotes.length === 2
      )
    )
    if (currentSingleUnitAndSingleUnitBeforeHaveDifferentStemDirectionsButTheyCollideOnlyInOneNoteInWhichTheyCanBeOverlappedThereforeTheyCanFitInOneVertical) {
      continue
    } else {
      return false
    }
  }
  return true
}
