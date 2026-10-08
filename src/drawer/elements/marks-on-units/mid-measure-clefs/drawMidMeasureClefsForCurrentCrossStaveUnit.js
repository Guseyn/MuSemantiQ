'use strict'

import calculateSpaceAfterCrossStaveUnitByMinUnitDurationOnPageLineAndItsMinDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit from '#msq/drawer/elements/layout-and-styles/unit-spacing/calculateSpaceAfterCrossStaveUnitByMinUnitDurationOnPageLineAndItsMinDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit.js'
import areAllNotesInSingleUnitParamsOnNextStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/areAllNotesInSingleUnitParamsOnNextStave.js'
import areAllNotesInSingleUnitParamsOnPrevStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/areAllNotesInSingleUnitParamsOnPrevStave.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import drawClefShape from '#msq/drawer/elements/the-page/clefs/drawClefShape.js'

const MID_MEASURE_CLEF_SCALE = 2 / 3

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, numberOfStaves, clefNamesAuraByStaveIndexes, crossStaveUnits, minUnitDurationOnPageLine, compressUnitsByNTimes, stretchUnitsByNTimes, styles, leftOffset, topOffsetsForEachStave, containsDrawnCrossStaveElementsBesideCrossStaveUnits) {
  const { clefShapeNameByClefName, yCorrectionsForMidMeasureClefs, leftOffsetOfFirstCrossStaveUnit } = styles
  const clefNames = []
  const clefs = []
  let isFollowedByMidMeasureSpecifiedKeySignature = false
  let singleUnitParamsWhereClefBeforeApplies
  const staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit = {}
  for (let singleUnitParamsIndex = 0; singleUnitParamsIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamsIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamsIndex]
    if (currentSingleUnitParams.containsNotesOnCurrentStave) {
      staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[currentSingleUnitParams.staveIndex] = true
    }
    if (currentSingleUnitParams.containsNotesOnPrevStave) {
      staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[currentSingleUnitParams.staveIndex - 1] = true
    }
    if (currentSingleUnitParams.containsNotesOnNextStave) {
      staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[currentSingleUnitParams.staveIndex + 1] = true
    }
    if (currentSingleUnitParams.clefBefore) {
      let staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions = currentSingleUnitParams.staveIndex
      const areAllNotesInSingleUnitParamsAreOnNextStave = areAllNotesInSingleUnitParamsOnNextStave(currentSingleUnitParams)
      const areAllNotesInSingleUnitParamsAreOnPrevStave = areAllNotesInSingleUnitParamsOnPrevStave(currentSingleUnitParams)
      if (areAllNotesInSingleUnitParamsAreOnNextStave) {
        staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions += 1
      } else if (areAllNotesInSingleUnitParamsAreOnPrevStave) {
        staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions -= 1
      }
      if (!clefNames[staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions]) {
        clefNames[staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions] = currentSingleUnitParams.clefBefore
        clefNamesAuraByStaveIndexes[staveIndexOfCurrentSingleUnitParamsConsideringItsNotesStavePositions] = currentSingleUnitParams.clefBefore
        singleUnitParamsWhereClefBeforeApplies = currentSingleUnitParams
      }
      if (currentSingleUnitParams.keySignatureBefore && !isFollowedByMidMeasureSpecifiedKeySignature) {
        isFollowedByMidMeasureSpecifiedKeySignature = true
      }
    }
  }
  if (isFollowedByMidMeasureSpecifiedKeySignature) {
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      if (!clefNames[staveIndex]) {
        clefNames[staveIndex] = clefNamesAuraByStaveIndexes[staveIndex]
      }
    }
  }
  let rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits
  let rightOfLastCrossStaveUnitNoteHeadsConsideringAllStaves
  if (crossStaveUnits[crossStaveUnits.length - 1]) {
    const allSingleUnitsInLastCrossStaveUnit = crossStaveUnits[crossStaveUnits.length - 1].singleUnitsByStaveIndexes.flat()
    for (let singleUnitIndex = 0; singleUnitIndex < allSingleUnitsInLastCrossStaveUnit.length; singleUnitIndex++) {
      const rightPointOfSingleUnitNoteHeads = allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].parenthesesRight || allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].dotsRight || allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].bodyRight
      if (rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits === undefined || rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits < rightPointOfSingleUnitNoteHeads) {
        if (
          (staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].staveIndex] && allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].containsNotesOnCurrentStave) ||
          (staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].staveIndex - 1] && allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].containsNotesOnPrevStave) ||
          (staveIndexesWhereWeHaveSingleUnitsInNextCrossStaveUnit[allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].staveIndex + 1] && allSingleUnitsInLastCrossStaveUnit[singleUnitIndex].containsNotesOnNextStave)
        ) {
          rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits = rightPointOfSingleUnitNoteHeads
        }
        rightOfLastCrossStaveUnitNoteHeadsConsideringAllStaves = rightPointOfSingleUnitNoteHeads
      }
    }
    if (rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits === undefined) {
      rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits = rightOfLastCrossStaveUnitNoteHeadsConsideringAllStaves
    }
    crossStaveUnits[crossStaveUnits.length - 1].rightPositionConsideringParenthesesAndDotsAndConsideringStavesThatContainNotesForNextCrossStaveUnit = rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits
  }
  const startXPositionOfClefs = (crossStaveUnits.length === 0)
    ? leftOffset + leftOffsetOfFirstCrossStaveUnit
    : rightOfLastCrossStaveUnitNoteHeadsConsideringStavesThatContainNotesForLastAndCurrentCrossStaveUnits +
      calculateSpaceAfterCrossStaveUnitByMinUnitDurationOnPageLineAndItsMinDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit(crossStaveUnits[crossStaveUnits.length - 1], minUnitDurationOnPageLine, compressUnitsByNTimes, stretchUnitsByNTimes, styles)
  if (clefNames.length === 0) {
    return {
      isEmpty: true,
      name: 'g',
      properties: {
        'data-name': 'midMeasureClefsForCurrentCrossStaveUnit'
      },
      transformations: [],
      top: topOffsetsForEachStave[0],
      right: startXPositionOfClefs,
      bottom: topOffsetsForEachStave[topOffsetsForEachStave.length - 1],
      left: startXPositionOfClefs
    }
  }
  containsDrawnCrossStaveElementsBesideCrossStaveUnits.value = true
  let maxClefWidth = 0
  for (let staveIndex = 0; staveIndex < clefNames.length; staveIndex++) {
    if (styles[clefShapeNameByClefName[clefNames[staveIndex]]]) {
      const clef = drawClefShape(clefShapeNameByClefName[clefNames[staveIndex]])(styles, startXPositionOfClefs, topOffsetsForEachStave[staveIndex])
      scaleElementAroundPoint(
        clef,
        MID_MEASURE_CLEF_SCALE,
        MID_MEASURE_CLEF_SCALE,
        {
          x: clef.left,
          y: clef.top
        }
      )
      moveElement(
        clef,
        0,
        yCorrectionsForMidMeasureClefs[clefNames[staveIndex]]
      )
      const clefWidth = clef.right - clef.left
      clefs.push(clef)
      addPropertiesToElement(
        clef,
        {
          'ref-ids': `clef-before-${singleUnitParamsWhereClefBeforeApplies.measureIndexInGeneral + 1}-${singleUnitParamsWhereClefBeforeApplies.staveIndex + 1}-${singleUnitParamsWhereClefBeforeApplies.voiceIndex + 1}-${singleUnitParamsWhereClefBeforeApplies.singleUnitIndex + 1}`
        }
      )
      if (maxClefWidth < clefWidth) {
        maxClefWidth = clefWidth
      }
    }
  }
  const centerOfClefWithMaxWidth = (startXPositionOfClefs + (startXPositionOfClefs + maxClefWidth)) / 2
  clefs.forEach(clef => {
    const clefCenter = (clef.right + clef.left) / 2
    moveElement(clef, centerOfClefWithMaxWidth - clefCenter)
  })
  return createGroup(
    'midMeasureClefsForCurrentCrossStaveUnit',
    clefs
  )
}
