'use strict'

import drawSign from '#msq/drawer/elements/measure-furniture/sign/drawSign.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, styles) {
  const signs = []
  measuresOnPageLine.forEach(measure => {
    if (measure.sign) {
      const sign = drawSign(measure, styles)
      signs.push(
        sign
      )
      addPropertiesToElement(
        sign,
        {
          'ref-ids': `sign-${measure.measureIndexInGeneral + 1}`
        }
      )
    }
  })
  return signs
}
