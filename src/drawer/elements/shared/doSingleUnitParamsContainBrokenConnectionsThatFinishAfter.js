'use strict'

export default function (singleUnitParams) {
  if (singleUnitParams.tiedAfter) {
    return true
  }
  if (singleUnitParams.slurMarks) {
    if (singleUnitParams.slurMarks.some(slurMark => slurMark.after)) {
      return true
    }
  }
  if (singleUnitParams.glissandoMarks) {
    if (singleUnitParams.glissandoMarks.some(glissandoMark => glissandoMark.after || glissandoMark.afterMeasure !== undefined)) {
      return true
    }
  }
  if (singleUnitParams.tupletMarks) {
    if (singleUnitParams.tupletMarks.some(tupletMark => tupletMark.after)) {
      return true
    }
  }
  return false
}
