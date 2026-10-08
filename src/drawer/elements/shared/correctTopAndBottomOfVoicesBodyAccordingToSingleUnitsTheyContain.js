'use strict'

export default function (voicesBody, singleUnitsInVoices) {
  if (voicesBody && !voicesBody.isEmpty) {
    for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
      if (singleUnitsInVoices[staveIndex]) {
        for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
          if (singleUnitsInVoices[staveIndex][voiceIndex]) {
            for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
              const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
              if (currentSingleUnit.top < voicesBody.top) {
                voicesBody.top = currentSingleUnit.top
              }
              if (currentSingleUnit.bottom > voicesBody.bottom) {
                voicesBody.bottom = currentSingleUnit.bottom
              }
            }
          }
        }
      }
    }
  }
}
