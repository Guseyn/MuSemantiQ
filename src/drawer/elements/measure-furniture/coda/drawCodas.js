'use strict'

import drawCoda from '#msq/drawer/elements/measure-furniture/coda/drawCoda.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, styles) {
  const codas = []
  measuresOnPageLine.forEach(measure => {
    if (measure.coda) {
      const coda = drawCoda(measure, styles)
      addPropertiesToElement(
        coda,
        {
          'ref-ids': `coda-${measure.measureIndexInGeneral + 1}`
        }
      )
      codas.push(coda)
    }
  })
  return codas
}
