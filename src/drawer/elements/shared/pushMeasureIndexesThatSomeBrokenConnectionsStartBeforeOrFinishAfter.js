'use strict'

export default function (singleUnitParams, measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore, measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter) {
  if (singleUnitParams.tiedBeforeMeasure) {
    const newMeasureIndex = (singleUnitParams.tiedBeforeMeasure.index || 1) - 1
    if (measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.indexOf(newMeasureIndex) === -1) {
      measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.push(newMeasureIndex)
    }
  }
  if (singleUnitParams.tiedAfterMeasure) {
    const newMeasureIndex = (singleUnitParams.tiedAfterMeasure.index || 1) - 1
    if (measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.indexOf(newMeasureIndex) === -1) {
      measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.push(newMeasureIndex)
    }
  }
  if (singleUnitParams.glissandoMarks) {
    singleUnitParams.glissandoMarks.forEach(glissandoMark => {
      if (glissandoMark.beforeMeasure) {
        const newMeasureIndex = glissandoMark.beforeMeasure - 1
        if (measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.indexOf(newMeasureIndex) === -1) {
          measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.push(newMeasureIndex)
        }
      } else if (glissandoMark.afterMeasure) {
        const newMeasureIndex = glissandoMark.afterMeasure - 1
        if (measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.indexOf(newMeasureIndex) === -1) {
          measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.push(newMeasureIndex)
        }
      }
    })
  }
}
