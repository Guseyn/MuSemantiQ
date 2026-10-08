'use strict'

export default function (singleUnitParams) {
  if (singleUnitParams.tiedBefore) {
    return true
  }
  if (singleUnitParams.slurMarks) {
    if (singleUnitParams.slurMarks.some(slurMark => slurMark.before)) {
      return true
    }
  }
  if (singleUnitParams.glissandoMarks) {
    if (singleUnitParams.glissandoMarks.some(glissandoMark => glissandoMark.before || glissandoMark.beforeMeasure !== undefined)) {
      return true
    }
  }
  if (singleUnitParams.tupletMarks) {
    if (singleUnitParams.tupletMarks.some(tupletMark => tupletMark.before)) {
      return true
    }
  }
  return false
}
