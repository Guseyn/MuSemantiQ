'use strict'

import drawVolta from '#msq/drawer/elements/measure-furniture/volta-brackets/drawVolta.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (measuresOnPageLine, voicesBodiesOnPageLine, styles) {
  const { yOffsetOfVolta } = styles
  let currentVoltaStructure
  const voltas = []
  for (let measureIndexOnPageLine = 0; measureIndexOnPageLine < measuresOnPageLine.length; measureIndexOnPageLine++) {
    const isLastMeasureOnPageLine = measureIndexOnPageLine === measuresOnPageLine.length - 1
    const currentMeasure = measuresOnPageLine[measureIndexOnPageLine]
    const currentVoicesBody = voicesBodiesOnPageLine[measureIndexOnPageLine]
    if (currentMeasure.voltaMark) {
      if (!currentVoltaStructure && (currentMeasure.voltaMark.startsHere || currentMeasure.voltaMark.startsBefore)) {
        currentVoltaStructure = {
          left: (!currentVoicesBody || currentVoicesBody.isEmpty) ? currentMeasure.left : currentVoicesBody.left,
          top: currentMeasure.top - yOffsetOfVolta,
          value: currentMeasure.voltaMark.value,
          key: currentMeasure.voltaMark.key,
          withLeftColumn: currentMeasure.voltaMark.startsHere,
          yCorrection: currentMeasure.voltaMark.yCorrection,
          measures: [ ]
        }
      }
    }
    if (currentVoltaStructure) {
      currentVoltaStructure.top = Math.min(currentVoltaStructure.top, currentMeasure.top - yOffsetOfVolta)
      currentVoltaStructure.measures.push(currentMeasure)
      if (currentMeasure.voltaMark) {
        if (currentMeasure.voltaMark.finishesHere || currentMeasure.voltaMark.finishesAfter || isLastMeasureOnPageLine) {
          currentVoltaStructure.right = (!currentVoicesBody || currentVoicesBody.isEmpty) ? currentMeasure.right : currentVoicesBody.right
          currentVoltaStructure.withRightColumn = currentMeasure.voltaMark.finishesHere
          const volta = drawVolta(currentVoltaStructure, styles)
          addPropertiesToElement(
            volta,
            {
              'ref-ids': currentVoltaStructure.key
            }
          )
          voltas.push(volta)
          currentVoltaStructure.measures.forEach(measure => {
            measure.top = Math.min(measure.top, volta.top)
            measure.bottom = Math.max(measure.bottom, volta.bottom)
          })
          currentVoltaStructure = undefined
        }
      }
    }
  }
  return voltas
}
