'use strict'

export default function (singleUnit, beamLineCoefficients) {
  let singleUnitStemEnd = singleUnit.stemLeft * beamLineCoefficients.gradient + beamLineCoefficients.topIntercept
  if (singleUnit.stemDirection === 'up') {
    if (singleUnitStemEnd > singleUnit.stemTop) {
      singleUnitStemEnd = singleUnit.stemTop
    }
  } else {
    if (singleUnitStemEnd < singleUnit.stemBottom) {
      singleUnitStemEnd = singleUnit.stemBottom
    }
  }
  return singleUnitStemEnd
}
