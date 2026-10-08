'use strict'

import calculateIntersectionPointForOnePartOfSShapeSlurWithItsSingleUnit from '#msq/drawer/elements/spans/slurs/calculateIntersectionPointForOnePartOfSShapeSlurWithItsSingleUnit.js'

export default function (singleUnits, slurSplinePoints, slurDirection, styles) {
  return singleUnits.map(
    singleUnit => calculateIntersectionPointForOnePartOfSShapeSlurWithItsSingleUnit(
      singleUnit,
      slurSplinePoints,
      slurDirection,
      styles
    )
  )
}
