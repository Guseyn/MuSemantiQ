'use strict'

const setUpParamsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit = (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit, measureIndexInGeneral, staveIndex, voiceIndex, singleUnitIndex) => {
  paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams = paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams || []
  paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.measureIndexInGeneral = measureIndexInGeneral
  paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.staveIndex = staveIndex
  paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.voiceIndex = voiceIndex
  paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.singleUnitIndex = singleUnitIndex
  for (let noteIndex = 0; noteIndex < paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes.length; noteIndex++) {
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].measureIndexInGeneral = measureIndexInGeneral
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].staveIndex = staveIndex
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].voiceIndex = voiceIndex
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].singleUnitIndex = singleUnitIndex
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].stave === 'current') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsNotesOnCurrentStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].staveIndexConsideringStavePosition = staveIndex
    }
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].stave === 'prev') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsNotesOnPrevStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].staveIndexConsideringStavePosition = staveIndex - 1
    }
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].stave === 'next') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsNotesOnNextStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.notes[noteIndex].staveIndexConsideringStavePosition = staveIndex + 1
    }
  }
  for (let keyIndex = 0; keyIndex < paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams.length; keyIndex++) {
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].measureIndexInGeneral = measureIndexInGeneral
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].staveIndex = staveIndex
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].voiceIndex = voiceIndex
    paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].singleUnitIndex = singleUnitIndex
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].stave === 'current') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsKeysOnCurrentStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].staveIndexConsideringStavePosition = staveIndex
    }
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].stave === 'prev') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsKeysOnPrevStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].staveIndexConsideringStavePosition = staveIndex - 1
    }
    if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].stave === 'next') {
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.containsKeysOnNextStave = true
      paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.keysParams[keyIndex].staveIndexConsideringStavePosition = staveIndex + 1
    }
  }
}

const calculateGraceUnitsAccumulatorValueForEachStaveAndVoice = (stavesParams, countersForEachVoice) => {
  const graceUnitsAccumulatorForEachStaveAndVoiceValue = {}
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    const voicesOnCurrentStave = stavesParams[staveIndex]
    for (let voiceIndex = 0; voiceIndex < voicesOnCurrentStave.length; voiceIndex++) {
      const key = `${staveIndex}-${voiceIndex}`
      const currentVoiceOnCurrentStave = voicesOnCurrentStave[voiceIndex]
      for (let countIndex = countersForEachVoice[staveIndex][voiceIndex]; countIndex < currentVoiceOnCurrentStave.length; countIndex++) {
        if (graceUnitsAccumulatorForEachStaveAndVoiceValue[key] === undefined) {
          graceUnitsAccumulatorForEachStaveAndVoiceValue[key] = {
            numberOfGraceUnitsInRow: 0
          }
        }
        if (currentVoiceOnCurrentStave[countIndex] && currentVoiceOnCurrentStave[countIndex].isGrace) {
          graceUnitsAccumulatorForEachStaveAndVoiceValue[key].numberOfGraceUnitsInRow += 1
          if (countIndex === (currentVoiceOnCurrentStave.length - 1)) {
            graceUnitsAccumulatorForEachStaveAndVoiceValue[key].countDownOfGraceUnits = graceUnitsAccumulatorForEachStaveAndVoiceValue[key].numberOfGraceUnitsInRow
            break
          }
        } else {
          graceUnitsAccumulatorForEachStaveAndVoiceValue[key].countDownOfGraceUnits = graceUnitsAccumulatorForEachStaveAndVoiceValue[key].numberOfGraceUnitsInRow
          break
        }
      }
    }
  }
  let totalNumberOfGraceUnitsInRow = 0
  for (const key in graceUnitsAccumulatorForEachStaveAndVoiceValue) {
    if (key.split('-').length > 1) {
      if (totalNumberOfGraceUnitsInRow < graceUnitsAccumulatorForEachStaveAndVoiceValue[key].numberOfGraceUnitsInRow) {
        totalNumberOfGraceUnitsInRow = graceUnitsAccumulatorForEachStaveAndVoiceValue[key].numberOfGraceUnitsInRow
      }
    }
  }
  graceUnitsAccumulatorForEachStaveAndVoiceValue.totalNumberOfGraceUnitsInRow = totalNumberOfGraceUnitsInRow
  graceUnitsAccumulatorForEachStaveAndVoiceValue.totalCountDownOfGraceUnits = totalNumberOfGraceUnitsInRow
  return graceUnitsAccumulatorForEachStaveAndVoiceValue
}

const generateSimileKey = (staveIndex, voiceIndex) => {
  return `${staveIndex}-${voiceIndex}`
}

export default function (measureIndexInGeneral, stavesParams, durationsAccumulatorsForEachVoice, countersForEachVoice, finishedVoices, numberOfUnfinishedVoices, graceUnitsAccumulatorForEachStaveAndVoice, similesInformationByStaveAndVoiceIndexes) {
  let allDurationsAccumulatorsForEachNonFinishedVoiceAreNotEqualToZero = true
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    const voicesOnCurrentStave = stavesParams[staveIndex]
    for (let voiceIndex = 0; voiceIndex < voicesOnCurrentStave.length; voiceIndex++) {
      if (durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] === 0 && !finishedVoices[`${staveIndex}-${voiceIndex}`]) {
        allDurationsAccumulatorsForEachNonFinishedVoiceAreNotEqualToZero = false
        break
      }
    }
  }

  const filteredGraceSingleUnitParams = []
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    const voicesOnCurrentStave = stavesParams[staveIndex]
    for (let voiceIndex = 0; voiceIndex < voicesOnCurrentStave.length; voiceIndex++) {
      const key = `${staveIndex}-${voiceIndex}`
      const currentVoiceOnCurrentStave = voicesOnCurrentStave[voiceIndex]
      const paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit = currentVoiceOnCurrentStave[countersForEachVoice[staveIndex][voiceIndex]]
      if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit) {
        if (durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] === 0 || allDurationsAccumulatorsForEachNonFinishedVoiceAreNotEqualToZero) {
          const simileKey = generateSimileKey(staveIndex, voiceIndex)
          if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.isSimile && similesInformationByStaveAndVoiceIndexes[simileKey] && similesInformationByStaveAndVoiceIndexes[simileKey].duration === 0) {
            paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.isGrace = true
          }
          if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit.isGrace) {
            if (graceUnitsAccumulatorForEachStaveAndVoice.value === undefined) {
              graceUnitsAccumulatorForEachStaveAndVoice.value = calculateGraceUnitsAccumulatorValueForEachStaveAndVoice(stavesParams, countersForEachVoice)
            }
            if (graceUnitsAccumulatorForEachStaveAndVoice.value[key].countDownOfGraceUnits === graceUnitsAccumulatorForEachStaveAndVoice.value.totalCountDownOfGraceUnits) {
              setUpParamsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit(paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit, measureIndexInGeneral, staveIndex, voiceIndex, countersForEachVoice[staveIndex][voiceIndex])
              filteredGraceSingleUnitParams.push(paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit)
              graceUnitsAccumulatorForEachStaveAndVoice.value[key].countDownOfGraceUnits -= 1
            }
          }
        }
      }
    }
  }
  if (filteredGraceSingleUnitParams.length > 0) {
    graceUnitsAccumulatorForEachStaveAndVoice.value.totalCountDownOfGraceUnits -= 1
    return filteredGraceSingleUnitParams
  }

  graceUnitsAccumulatorForEachStaveAndVoice.value = undefined
  const singleUnitsParams = []
  for (let staveIndex = 0; staveIndex < stavesParams.length; staveIndex++) {
    const voicesOnCurrentStave = stavesParams[staveIndex]
    for (let voiceIndex = 0; voiceIndex < voicesOnCurrentStave.length; voiceIndex++) {
      const currentVoiceOnCurrentStave = voicesOnCurrentStave[voiceIndex]
      const paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit = currentVoiceOnCurrentStave[countersForEachVoice[staveIndex][voiceIndex]]
      if (paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit) {
        if (durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] === 0 || allDurationsAccumulatorsForEachNonFinishedVoiceAreNotEqualToZero) {
          setUpParamsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit(paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit, measureIndexInGeneral, staveIndex, voiceIndex, countersForEachVoice[staveIndex][voiceIndex])
          singleUnitsParams.push(paramsForSingleUnitCandidateToBeIncludedInCurrentCrossStaveUnit)
        }
      }
    }
  }
  return singleUnitsParams
}
