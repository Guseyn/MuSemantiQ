'use strict'

import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import updateSingleUnitPartsCoordinates from '#msq/drawer/elements/shared/updateSingleUnitPartsCoordinates.js'

export default function (singleUnit, xDistanceToMove = 0, yDistanceToMove = 0) {
  moveElement(singleUnit, xDistanceToMove, yDistanceToMove)
  updateSingleUnitPartsCoordinates(singleUnit, xDistanceToMove, yDistanceToMove)
}
