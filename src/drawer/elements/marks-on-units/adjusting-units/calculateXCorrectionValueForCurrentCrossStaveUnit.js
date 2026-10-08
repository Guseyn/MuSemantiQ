'use strict'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, intervalBetweenStaveLines) {
  let value = 0
  for (let singleUnitParamIndex = 0; singleUnitParamIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex]
    if (currentSingleUnitParams.relatedXCorrection) {
      value += currentSingleUnitParams.relatedXCorrection
    }
  }
  return value * intervalBetweenStaveLines
}
