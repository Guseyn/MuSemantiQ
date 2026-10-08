'use strict'

import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveSingleUnit from '#msq/drawer/elements/shared/moveSingleUnit.js'

export default function (verticalsInCrossStaveUnit, weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines, weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithArpeggiatedWavesAndNotKeysBeforeBecauseOfLedgerLines, thereAreKeysBefore, thereAreArpeggiatedWavesBefore, isCurrentCrossStaveUnitGrace, styles) {
  const { xDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollide, additionalXDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollideForVerticalsWithDots, spaceAfterKeysForSingleUnitsBeforeCrossStaveUnitThatContainsNotesOnLedgerLines, spaceAfterKeysForSingleUnits, spaceAfterArpeggiatedWaveForCrossStaveUnit, spaceAfterArpeggiatedWaveForCrossStaveUnitWithNotesOnLedgerLines, ledgerLinesRadiusFromNoteHead, graceElementsScaleFactor } = styles
  const diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace = isCurrentCrossStaveUnitGrace ? (ledgerLinesRadiusFromNoteHead - ledgerLinesRadiusFromNoteHead * graceElementsScaleFactor) : 0
  for (let verticalIndex = 0; verticalIndex < verticalsInCrossStaveUnit.length; verticalIndex++) {
    const allSingleUnitsInCurrentVertical = verticalsInCrossStaveUnit[verticalIndex].singleUnits
    for (let singleUnitIndex = 0; singleUnitIndex < verticalsInCrossStaveUnit[verticalIndex].singleUnits.length; singleUnitIndex++) {
      const currentSingleUnitInCurrentVertical = allSingleUnitsInCurrentVertical[singleUnitIndex]
      const staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes = {}
      if (currentSingleUnitInCurrentVertical.containsNotesOnCurrentStave) {
        staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[currentSingleUnitInCurrentVertical.staveIndex] = true
      }
      if (currentSingleUnitInCurrentVertical.containsNotesOnPrevStave) {
        staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[currentSingleUnitInCurrentVertical.staveIndex - 1] = true
      }
      if (currentSingleUnitInCurrentVertical.containsNotesOnNextStave) {
        staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[currentSingleUnitInCurrentVertical.staveIndex + 1] = true
      }
      const newVerticalStarted = singleUnitIndex === 0 && verticalIndex > 0
      const weAreInTheSameVerticalAsOnPreviousIteration = singleUnitIndex !== 0
      const weAreInTheSameVerticalAsOnPreviousIterationAndVerticalIndexIsMoreThanZero = weAreInTheSameVerticalAsOnPreviousIteration && verticalIndex > 0
      if (newVerticalStarted) {
        const allSingleUnitsBeforeInVerticals = verticalsInCrossStaveUnit.slice(0, verticalIndex).flatMap(verticalInCrossStaveUnit => verticalInCrossStaveUnit.singleUnits)
        const allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical = allSingleUnitsBeforeInVerticals.filter(singleUnitBefore => {
          if (
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex] && singleUnitBefore.containsNotesOnCurrentStave) ||
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex - 1] && singleUnitBefore.containsNotesOnPrevStave) ||
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex + 1] && singleUnitBefore.containsNotesOnNextStave)
          ) {
            return true
          }
          return false
        })
        const groupedSingleUnitsInVerticalsTillCurrentVerticalIndexInclusivelyInCrossStaveUnit = createGroup(
          'singleUnitsInVerticalsTillCurrentVerticalIndexInclusivelyInCrossStaveUnit',
          (allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical.length > 0)
            ? allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical
            : allSingleUnitsBeforeInVerticals
        )
        const xDistanceToMove = groupedSingleUnitsInVerticalsTillCurrentVerticalIndexInclusivelyInCrossStaveUnit.right - Math.min(groupedSingleUnitsInVerticalsTillCurrentVerticalIndexInclusivelyInCrossStaveUnit.left, currentSingleUnitInCurrentVertical.bodyLeft)
        moveSingleUnit(
          currentSingleUnitInCurrentVertical,
          xDistanceToMove + xDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollide + (verticalsInCrossStaveUnit[verticalIndex - 1].containsSingleUnitsWithDots ? additionalXDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollideForVerticalsWithDots : 0)
        )
      } else if (weAreInTheSameVerticalAsOnPreviousIterationAndVerticalIndexIsMoreThanZero) {
        const allSingleUnitsBeforeInVerticals = verticalsInCrossStaveUnit.slice(0, verticalIndex).flatMap(verticalInCrossStaveUnit => verticalInCrossStaveUnit.singleUnits)
        const allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical = allSingleUnitsBeforeInVerticals.filter(singleUnitBefore => {
          if (
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex] && singleUnitBefore.containsNotesOnCurrentStave) ||
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex - 1] && singleUnitBefore.containsNotesOnPrevStave) ||
            (staveIndexesWhereCurrentSingleUnitInCurrentVerticalHasNotes[singleUnitBefore.staveIndex + 1] && singleUnitBefore.containsNotesOnNextStave)
          ) {
            return true
          }
          return false
        })
        const groupedSingleUnitsInVerticalsTillCurrentVerticalIndexNonInclusivelyInCrossStaveUnit = createGroup(
          'singleUnitsInVerticalsTillCurrentVerticalIndexNonInclusivelyInCrossStaveUnit',
          (allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical.length > 0)
            ? allSingleUnitsBeforeInVerticalsConsideringStavesThatContainNotesOnTheSameStavesThatContainNotesForCurrentSingleUnitInCurrentVertical
            : allSingleUnitsBeforeInVerticals
        )
        const xDistanceToMove = groupedSingleUnitsInVerticalsTillCurrentVerticalIndexNonInclusivelyInCrossStaveUnit.right - Math.min(groupedSingleUnitsInVerticalsTillCurrentVerticalIndexNonInclusivelyInCrossStaveUnit.left, currentSingleUnitInCurrentVertical.bodyLeft)
        moveSingleUnit(
          currentSingleUnitInCurrentVertical,
          xDistanceToMove + xDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollide + (verticalsInCrossStaveUnit[verticalIndex - 1].containsSingleUnitsWithDots ? additionalXDistanceBetweenVerticalsInCrossStaveUnitsSoTheyDontCollideForVerticalsWithDots : 0)
        )
      }
    }
    // we just need to move first vertical, other verticals will be adjusted after
    if (verticalIndex === 0) {
      for (let singleUnitIndex = 0; singleUnitIndex < allSingleUnitsInCurrentVertical.length; singleUnitIndex++) {
        if (weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines) {
          moveSingleUnit(
            allSingleUnitsInCurrentVertical[singleUnitIndex],
            spaceAfterKeysForSingleUnitsBeforeCrossStaveUnitThatContainsNotesOnLedgerLines * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1) - diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace
          )
        } else if (weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithArpeggiatedWavesAndNotKeysBeforeBecauseOfLedgerLines) {
          moveSingleUnit(
            allSingleUnitsInCurrentVertical[singleUnitIndex],
            spaceAfterArpeggiatedWaveForCrossStaveUnitWithNotesOnLedgerLines * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1) - diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace
          )
        } else if (thereAreArpeggiatedWavesBefore) {
          moveSingleUnit(
            allSingleUnitsInCurrentVertical[singleUnitIndex],
            spaceAfterArpeggiatedWaveForCrossStaveUnit * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1) - diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace
          )
        } else if (thereAreKeysBefore) {
          moveSingleUnit(
            allSingleUnitsInCurrentVertical[singleUnitIndex],
            spaceAfterKeysForSingleUnits * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1) - diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace
          )
        }
      }
    }
    let maxSingleUnitNoteHeadsXCenterInCurrentVertical
    const staveIndexesWhereWeHaveNoteKeys = {}
    for (let singleUnitIndex = 0; singleUnitIndex < allSingleUnitsInCurrentVertical.length; singleUnitIndex++) {
      const currentSingleUnitNoteHeadsCenterInCurrentVertical = (allSingleUnitsInCurrentVertical[singleUnitIndex].bodyRight + allSingleUnitsInCurrentVertical[singleUnitIndex].bodyLeft) / 2
      if ((maxSingleUnitNoteHeadsXCenterInCurrentVertical === undefined) || (maxSingleUnitNoteHeadsXCenterInCurrentVertical < currentSingleUnitNoteHeadsCenterInCurrentVertical)) {
        maxSingleUnitNoteHeadsXCenterInCurrentVertical = currentSingleUnitNoteHeadsCenterInCurrentVertical
      }
      if (allSingleUnitsInCurrentVertical[singleUnitIndex].containsKeysOnCurrentStave) {
        staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex] = true
      }
      if (allSingleUnitsInCurrentVertical[singleUnitIndex].containsKeysOnPrevStave) {
        staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex - 1] = true
      }
      if (allSingleUnitsInCurrentVertical[singleUnitIndex].containsKeysOnNextStave) {
        staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex + 1] = true
      }
    }
    for (let singleUnitIndex = 0; singleUnitIndex < allSingleUnitsInCurrentVertical.length; singleUnitIndex++) {
      if (
        (
          !(allSingleUnitsInCurrentVertical[singleUnitIndex].containsNotesOnCurrentStave && staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex]) &&
          !(allSingleUnitsInCurrentVertical[singleUnitIndex].containsNotesOnPrevStave && staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex - 1]) &&
          !(allSingleUnitsInCurrentVertical[singleUnitIndex].containsNotesOnNextStave && staveIndexesWhereWeHaveNoteKeys[allSingleUnitsInCurrentVertical[singleUnitIndex].staveIndex + 1])
        ) ||
        allSingleUnitsInCurrentVertical[singleUnitIndex].isRest
      ) {
        const currentSingleUnitNoteHeadsCenterInCurrentVertical = (allSingleUnitsInCurrentVertical[singleUnitIndex].bodyRight + allSingleUnitsInCurrentVertical[singleUnitIndex].bodyLeft) / 2
        if (currentSingleUnitNoteHeadsCenterInCurrentVertical < maxSingleUnitNoteHeadsXCenterInCurrentVertical) {
          moveSingleUnit(
            allSingleUnitsInCurrentVertical[singleUnitIndex],
            maxSingleUnitNoteHeadsXCenterInCurrentVertical - currentSingleUnitNoteHeadsCenterInCurrentVertical
          )
        }
      }
    }
  }
}
