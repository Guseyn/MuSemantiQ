'use strict'

import calculateIntersectionPointOfSlurWithItsSingleUnit from '#msq/drawer/elements/spans/slurs/calculateIntersectionPointOfSlurWithItsSingleUnit.js'

export default function (singleUnits, slurSplinePoints, slurDirection, styles) {
  return singleUnits.map(
    singleUnit => calculateIntersectionPointOfSlurWithItsSingleUnit(
      singleUnit,
      slurSplinePoints,
      slurDirection,
      styles
    )
  )
}
