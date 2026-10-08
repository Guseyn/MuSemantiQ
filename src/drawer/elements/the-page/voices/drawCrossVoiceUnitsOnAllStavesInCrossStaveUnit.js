'use strict'

import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import placeSingleUnitsInCrossStaveUnitAmongVirtualVerticalsThatDontCollide from '#msq/drawer/elements/layout-and-styles/unit-spacing/placeSingleUnitsInCrossStaveUnitAmongVirtualVerticalsThatDontCollide.js'
import moveSingleUnitsInCrossStaveUnitAccordingToVerticalsTheyBelongSoTheyDontCollideAndAlsoCentralizeAllSingleUnitsByTheirUnitBodiesInEachVerticalIfThereAreNoKeysBefore from '#msq/drawer/elements/layout-and-styles/unit-spacing/moveSingleUnitsInCrossStaveUnitAccordingToVerticalsTheyBelongSoTheyDontCollideAndAlsoCentralizeAllSingleUnitsByTheirUnitBodiesInEachVerticalIfThereAreNoKeysBefore.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (singleUnitsForCurrentCrossStaveUnit, stavesParams, containsCollidedVoices, keysForCurrentCrossStaveUnit, arpeggiatedWavesForCurrentCrossStaveUnit, isCurrentCrossStaveUnitGrace, topOffsetsForEachStave, numberOfStaveLines, styles) {
  const crossVoiceUnitsOnAllStaves = []
  const verticalsInCrossStaveUnit = []
  const areasWithLedgerLinesForNotesInTheFirstVertical = []
  const { intervalBetweenStaveLines, spaceAfterKeysForSingleUnitsBeforeCrossStaveUnitThatContainsNotesOnLedgerLines, spaceAfterKeysForSingleUnits, ledgerLinesRadiusFromNoteHead, graceElementsScaleFactor } = styles
  const halfOfIntervalBetweenStaveLines = 0.8 * intervalBetweenStaveLines
  const diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace = isCurrentCrossStaveUnitGrace ? (ledgerLinesRadiusFromNoteHead - ledgerLinesRadiusFromNoteHead * graceElementsScaleFactor) : 0
  placeSingleUnitsInCrossStaveUnitAmongVirtualVerticalsThatDontCollide(stavesParams, singleUnitsForCurrentCrossStaveUnit, verticalsInCrossStaveUnit, containsCollidedVoices, styles)
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    if (singleUnitsForCurrentCrossStaveUnit[staveIndex].length > 0) {
      for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsForCurrentCrossStaveUnit[staveIndex].length; singleUnitIndex++) {
        if (singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].verticalIndex === 0) {
          for (let noteIndex = 0; noteIndex < singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates.length; noteIndex++) {
            const actualStaveIndex = singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].staveIndexConsideringStavePosition
            if (singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].isOnTheLeftSideOfUnit) {
              if (singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].positionNumber <= -1) {
                areasWithLedgerLinesForNotesInTheFirstVertical.push({
                  actualStaveIndex: actualStaveIndex,
                  minY: singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].top,
                  maxY: topOffsetsForEachStave[actualStaveIndex] - halfOfIntervalBetweenStaveLines
                })
              } else if (singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].positionNumber >= numberOfStaveLines) {
                areasWithLedgerLinesForNotesInTheFirstVertical.push({
                  actualStaveIndex: actualStaveIndex,
                  minY: topOffsetsForEachStave[actualStaveIndex] + (numberOfStaveLines - 1) * intervalBetweenStaveLines + halfOfIntervalBetweenStaveLines,
                  maxY: singleUnitsForCurrentCrossStaveUnit[staveIndex][singleUnitIndex].notesWithCoordinates[noteIndex].bottom
                })
              }
            }
          }
        }
      }
    }
  }
  const areasWithKeysInTheFirstColumn = keysForCurrentCrossStaveUnit.areasWithKeysInTheFirstColumn
  let weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines = false
  for (let keyAreaIndex = 0; keyAreaIndex < areasWithKeysInTheFirstColumn.length; keyAreaIndex++) {
    if (weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines) {
      break
    }
    for (let noteAreaIndex = 0; noteAreaIndex < areasWithLedgerLinesForNotesInTheFirstVertical.length; noteAreaIndex++) {
      if (
        (areasWithLedgerLinesForNotesInTheFirstVertical[noteAreaIndex].minY < areasWithKeysInTheFirstColumn[keyAreaIndex].maxY) &&
        (areasWithKeysInTheFirstColumn[keyAreaIndex].minY < areasWithLedgerLinesForNotesInTheFirstVertical[noteAreaIndex].maxY)
      ) {
        weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines = true
        break
      }
    }
  }
  const thereAreKeysBefore = keysForCurrentCrossStaveUnit.numberOfKeys > 0
  const thereAreArpeggiatedWavesBefore = arpeggiatedWavesForCurrentCrossStaveUnit.numberOfWaves > 0
  const weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithArpeggiatedWavesAndNotKeysBeforeBecauseOfLedgerLines = areasWithLedgerLinesForNotesInTheFirstVertical.length > 0 && thereAreArpeggiatedWavesBefore && !thereAreKeysBefore
  moveSingleUnitsInCrossStaveUnitAccordingToVerticalsTheyBelongSoTheyDontCollideAndAlsoCentralizeAllSingleUnitsByTheirUnitBodiesInEachVerticalIfThereAreNoKeysBefore(verticalsInCrossStaveUnit, weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines, weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithArpeggiatedWavesAndNotKeysBeforeBecauseOfLedgerLines, thereAreKeysBefore, thereAreArpeggiatedWavesBefore, isCurrentCrossStaveUnitGrace, styles)
  if (thereAreKeysBefore && weNeedToMoveSingleUnitsInCrossStaveUnitSoTheyDontCollideWithKeysBeforeBecauseOfLedgerLines) {
    for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
      let weNeedToMoveKeysBeforeCrossUnitCloserOnCurrentStave = true
      for (let keyAreaIndex = 0; keyAreaIndex < areasWithKeysInTheFirstColumn.length; keyAreaIndex++) {
        if (!weNeedToMoveKeysBeforeCrossUnitCloserOnCurrentStave) {
          break
        }
        if (areasWithKeysInTheFirstColumn[keyAreaIndex].actualStaveIndex === staveIndex) {
          for (let noteAreaIndex = 0; noteAreaIndex < areasWithLedgerLinesForNotesInTheFirstVertical.length; noteAreaIndex++) {
            if (areasWithLedgerLinesForNotesInTheFirstVertical[noteAreaIndex].actualStaveIndex === staveIndex) {
              if (
                (areasWithLedgerLinesForNotesInTheFirstVertical[noteAreaIndex].minY < areasWithKeysInTheFirstColumn[keyAreaIndex].maxY) &&
                (areasWithKeysInTheFirstColumn[keyAreaIndex].minY < areasWithLedgerLinesForNotesInTheFirstVertical[noteAreaIndex].maxY)
              ) {
                weNeedToMoveKeysBeforeCrossUnitCloserOnCurrentStave = false
                break
              }
            }
          }
        }
      }
      if (weNeedToMoveKeysBeforeCrossUnitCloserOnCurrentStave) {
        moveElement(
          keysForCurrentCrossStaveUnit.groupsOfKeysOnAllStaves.find(groupOfKeysOnStave => groupOfKeysOnStave.staveIndex === staveIndex),
          (spaceAfterKeysForSingleUnitsBeforeCrossStaveUnitThatContainsNotesOnLedgerLines - spaceAfterKeysForSingleUnits) * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1) - diffBetweenLedgerLinesRadiusFromNoteHeadForNormalAndGraceUnitsInCaseIfCurrentCrossStaveUnitIsGrace
        )
      }
    }
  }
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    if (singleUnitsForCurrentCrossStaveUnit[staveIndex].length > 0) {
      const crossVoiceUnitOnOneStave = createElementWithAdditionalInformation(
        createGroup(
          'crossVoiceUnitOnOneStave',
          singleUnitsForCurrentCrossStaveUnit[staveIndex]
        ),
        {
          areasWithLedgerLinesForNotesInTheFirstVertical
        }
      )
      crossVoiceUnitsOnAllStaves.push(
        crossVoiceUnitOnOneStave
      )
    }
  }
  return crossVoiceUnitsOnAllStaves
}
