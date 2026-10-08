'use strict'

import calculateActualDurationConsideringDotsAndTremolos from '#msq/drawer/elements/notes-on-a-page/durations/calculateActualDurationConsideringDotsAndTremolos.js'

const defaultTupletRatios = {
  '1': 1,
  '3': 2,
  '2': 3,
  '5': 4,
  '6': 4,
  '7': 4,
  '9': 8,
  '12': 8
}

export default function (duration, numberOfDots, tupletValues, tremoloDurationFactor) {
  let tupletRatio = 1 / 1
  for (let index = 0; index < tupletValues.length; index++) {
    const tupletValue = tupletValues[index]
    const tupletValueParts = tupletValue.split(':')
    let numerator = tupletValueParts[0]
    let denominator = tupletValueParts[1]
    if (isNaN(numerator)) {
      numerator = '1'
    }
    if (denominator === undefined) {
      denominator = defaultTupletRatios[numerator]
      if (denominator === undefined) {
        denominator = numerator - 1
      }
      if (denominator === 0) {
        denominator = 1
      }
    }
    tupletRatio *= (numerator / denominator)
  }
  return calculateActualDurationConsideringDotsAndTremolos(duration, numberOfDots, tremoloDurationFactor) / tupletRatio
}
