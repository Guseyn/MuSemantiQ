'use strict'

import updateSingleUnitPartsCoordinatesInVoices from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinatesInVoices.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (voicesBody, singleUnitsInVoices, xDistanceToMove, exapandVoicesBodyToTheRight = true) {
  moveElement(voicesBody, xDistanceToMove)
  if (exapandVoicesBodyToTheRight) {
    voicesBody.right += xDistanceToMove
  }
  updateSingleUnitPartsCoordinatesInVoices(singleUnitsInVoices, xDistanceToMove)
}
