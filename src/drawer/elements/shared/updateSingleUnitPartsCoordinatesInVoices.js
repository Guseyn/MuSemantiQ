'use strict'

import updateSingleUnitPartsCoordinates from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinates.js'

export default function (singleUnitsInVoices, xDistanceToMove = 0, yDistanceToMove = 0) {
  for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
    if (singleUnitsInVoices[staveIndex]) {
      for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
        if (singleUnitsInVoices[staveIndex][voiceIndex]) {
          for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
            const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
            updateSingleUnitPartsCoordinates(currentSingleUnit, xDistanceToMove, yDistanceToMove)
          }
        }
      }
    }
  }
}
