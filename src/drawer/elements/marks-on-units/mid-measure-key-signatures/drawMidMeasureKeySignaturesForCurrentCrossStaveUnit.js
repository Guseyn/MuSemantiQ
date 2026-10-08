'use strict'

import areAllNotesInSingleUnitParamsOnNextStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/areAllNotesInSingleUnitParamsOnNextStave.js'
import areAllNotesInSingleUnitParamsOnPrevStave from '#msq/drawer/elements/measure-furniture/cross-stave-chords/areAllNotesInSingleUnitParamsOnPrevStave.js'
import drawKeySignaturesOnStaves from '#msq/drawer/elements/the-page/key-signatures/drawKeySignaturesOnStaves.js'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, midMeasureClefsForCrossStaveUnits, numberOfStaves, numberOfStaveLines, clefNamesAuraByStaveIndexes, styles, leftOffset, topOffsetsForEachStave, containsDrawnCrossStaveElementsBesideCrossStaveUnits) {
  const { spaceAfterMidMeasureClefsForMidMeasureKeySignatures } = styles
  const clefNames = []
  let keySignatureName
  let singleUnitParamsWhereKeySignatureBeforeApplies
  for (let singleUnitParamsIndex = 0; singleUnitParamsIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamsIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamsIndex]
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
      }
      if (currentSingleUnitParams.keySignatureBefore && !keySignatureName) {
        keySignatureName = currentSingleUnitParams.keySignatureBefore
        singleUnitParamsWhereKeySignatureBeforeApplies = currentSingleUnitParams
      }
    }
  }
  if (keySignatureName) {
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      if (!clefNames[staveIndex]) {
        clefNames[staveIndex] = clefNamesAuraByStaveIndexes[staveIndex]
      }
    }
  }
  const startXPositionOfClefs = midMeasureClefsForCrossStaveUnits[midMeasureClefsForCrossStaveUnits.length - 1].right + (
    midMeasureClefsForCrossStaveUnits[midMeasureClefsForCrossStaveUnits.length - 1].isEmpty
      ? 0
      : spaceAfterMidMeasureClefsForMidMeasureKeySignatures
  )
  if (!keySignatureName) {
    return {
      isEmpty: true,
      name: 'g',
      properties: {
        'data-name': 'keySignaturesOnStaves'
      },
      transformations: [],
      top: topOffsetsForEachStave[0],
      right: startXPositionOfClefs,
      bottom: topOffsetsForEachStave[topOffsetsForEachStave.length - 1],
      left: startXPositionOfClefs
    }
  }
  containsDrawnCrossStaveElementsBesideCrossStaveUnits.value = true
  const {
    measureIndexInGeneral,
    staveIndex,
    voiceIndex,
    singleUnitIndex
  } = singleUnitParamsWhereKeySignatureBeforeApplies
  return drawKeySignaturesOnStaves(numberOfStaveLines, clefNames, keySignatureName, undefined, measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex)(styles, startXPositionOfClefs, topOffsetsForEachStave[0])
}
