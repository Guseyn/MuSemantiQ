'use strict'

import calculateMidiTremoloDurationFactor from '#msq/midi/calculateMidiTremoloDurationFactor.js'

const DEFAULT_TUPLET_RATIOS = {
  '1': 1,
  '3': 2,
  '2': 3,
  '5': 4,
  '6': 4,
  '7': 4,
  '9': 8,
  '12': 8
}

export default function (tupletValuesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey) {
  let tupletRatio = 1 / 1
  if (tupletValuesAuraForEachVoiceInEachStave && tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey]) {
    for (let tupletIndex = 0; tupletIndex < tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey].length; tupletIndex++) {
      const tupletValue = tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey][tupletIndex]
      const tupletValueParts = tupletValue.split(':')
      let numerator = tupletValueParts[0]
      let denominator = tupletValueParts[1]
      if (isNaN(numerator)) {
        numerator = '1'
      }
      if (denominator === undefined) {
        denominator = DEFAULT_TUPLET_RATIOS[numerator]
        if (denominator === undefined) {
          denominator = numerator - 1
        }
        if (denominator === 0) {
          denominator = 1
        }
      }
      tupletRatio *= (numerator / denominator)
    }
  }
  const tremoloDurationFactor = unitParams.tremoloParams
    ? calculateMidiTremoloDurationFactor(unitParams.tremoloParams)
    : 1
  const graceDurationFactor = unitParams.isGrace ? 1 / 4 : 1
  return (((unitParams.unitDuration || 0.25) * (2 - Math.pow(2, (-unitParams.numberOfDots || 0)))) * tremoloDurationFactor) / tupletRatio * graceDurationFactor
}
