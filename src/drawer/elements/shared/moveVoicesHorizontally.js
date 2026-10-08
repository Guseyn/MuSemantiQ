'use strict'

import updateSingleUnitPartsCoordinatesInVoices from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinatesInVoices.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (voices, singleUnitsInVoices, xDistanceToMove) {
  moveElement(voices, xDistanceToMove)
  updateSingleUnitPartsCoordinatesInVoices(singleUnitsInVoices, xDistanceToMove)
}
