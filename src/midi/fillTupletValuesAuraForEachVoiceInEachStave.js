'use strict'

export default function (tupletValuesAuraForEachVoiceInEachStave, unitParams, staveVoiceKey) {
  if (unitParams.tupletMarks) {
    for (let tupletMarkIndex = 0; tupletMarkIndex < unitParams.tupletMarks.length; tupletMarkIndex++) {
      if (!unitParams.tupletMarks[tupletMarkIndex].finish) {
        if (!tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey]) {
          tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey] = []
        }
        const tupletValue = unitParams.tupletMarks[tupletMarkIndex].value
        if (/^(\d+)(:(\d+))?$/.test(tupletValue)) {
          tupletValuesAuraForEachVoiceInEachStave[staveVoiceKey].push(
            tupletValue
          )
        }
      }
    }
  }
}
