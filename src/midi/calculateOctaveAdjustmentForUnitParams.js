'use strict'

export default function (unitParams) {
  let octaveAdjustmentForUnitParams = 0
  if (unitParams.articulationParams) {
    const singleOctaveSignForUnitParams = unitParams.articulationParams.find(articulationParam => {
      return articulationParam.name === 'octaveSign'
    })
    if (singleOctaveSignForUnitParams) {
      if (singleOctaveSignForUnitParams.direction === 'up') {
        if (singleOctaveSignForUnitParams.textValue === '8') {
          octaveAdjustmentForUnitParams = 1
        } else if (singleOctaveSignForUnitParams.textValue === '15') {
          octaveAdjustmentForUnitParams = 2
        }
      } else if (singleOctaveSignForUnitParams.direction === 'down') {
        if (singleOctaveSignForUnitParams.textValue === '8') {
          octaveAdjustmentForUnitParams = -1
        } else if (singleOctaveSignForUnitParams.textValue === '15') {
          octaveAdjustmentForUnitParams = -2
        }
      }
    }
  }
  return octaveAdjustmentForUnitParams
}
