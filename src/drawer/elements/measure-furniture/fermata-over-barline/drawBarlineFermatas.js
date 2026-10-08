'use strict'

import drawBarlineFermata from '#msq/drawer/elements/measure-furniture/fermata-over-barline/drawBarlineFermata.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, styles) {
  const barlineFermatas = []
  measuresOnPageLine.forEach((measure) => {
    if (measure.measureContainsFermataOverBarline && measure.finishBarline) {
      const barlineFermata = drawBarlineFermata(measure.finishBarline, measure.isLastMeasureOnPageLine, styles)
      addPropertiesToElement(
        barlineFermata,
        {
          'ref-ids': `measure-fermata-${measure.measureIndexInGeneral + 1}`
        }
      )
      barlineFermatas.push(barlineFermata)
    }
  })
  return barlineFermatas
}
