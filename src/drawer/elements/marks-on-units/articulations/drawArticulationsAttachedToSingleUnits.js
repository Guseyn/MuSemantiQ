'use strict'

import drawArticulations from '#msq/drawer/elements/marks-on-units/articulations/drawArticulations.js'

export default function (voicesOnPageLine, dontDrawDynamics, drawOnlyDynamics, styles) {
  return drawArticulations(voicesOnPageLine, true, false, dontDrawDynamics, drawOnlyDynamics, styles)
}
