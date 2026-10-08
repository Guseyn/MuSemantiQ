'use strict'

const calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = (singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles) => {
  const { intervalBetweenStaveLines } = styles
  const numberOfStaves = topOffsetsForEachStave.length
  if (staveIndex < 0) {
    staveIndex = 0
  }
  if (staveIndex > numberOfStaves - 1) {
    staveIndex = numberOfStaves - 1
  }
  let minTopOfCrossVoiceUnitsOnStave = topOffsetsForEachStave[staveIndex]
  let maxBottomOfCrossVoiceUnitsOnStave = topOffsetsForEachStave[staveIndex] + (numberOfStaveLines - 1) * intervalBetweenStaveLines
  if (singleUnitsInVoices[staveIndex]) {
    for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
      if (singleUnitsInVoices[staveIndex][voiceIndex]) {
        for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
          const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
          if (minTopOfCrossVoiceUnitsOnStave > currentSingleUnit.top) {
            minTopOfCrossVoiceUnitsOnStave = currentSingleUnit.top
          }
          if (maxBottomOfCrossVoiceUnitsOnStave < currentSingleUnit.bottom) {
            maxBottomOfCrossVoiceUnitsOnStave = currentSingleUnit.bottom
          }
        }
      }
    }
  }
  return {
    min: minTopOfCrossVoiceUnitsOnStave,
    max: maxBottomOfCrossVoiceUnitsOnStave
  }
}

export default calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex
