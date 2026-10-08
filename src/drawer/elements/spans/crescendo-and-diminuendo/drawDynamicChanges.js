'use strict'

import drawDynamicChange from '#msq/drawer/elements/spans/crescendo-and-diminuendo/drawDynamicChange.js'
import calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex from '#msq/drawer/elements/shared/calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.js'

const generateStaveVoiceKey = (staveIndex, voiceIndex) => {
  return `${staveIndex}-${voiceIndex}`
}

export default function (voicesOnPageLine, measuresOnPageLine, styles) {
  const dynamicChanges = []
  const dynamicChangesStack = {}
  if (voicesOnPageLine) {
    for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
      if (voicesOnPageLine[measureIndex]) {
        const { singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, withoutVoices } = voicesOnPageLine[measureIndex]
        if (!withoutVoices) {
          for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
            if (singleUnitsInVoices[staveIndex]) {
              for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
                if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                  for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                    const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                    const currentMeasure = measuresOnPageLine[currentSingleUnit.measureIndexOnPageLine]
                    const keyForDynamicChange = generateStaveVoiceKey(staveIndex, voiceIndex)
                    if (currentSingleUnit.dynamicChangeMark) {
                      if (!dynamicChangesStack[keyForDynamicChange] && !currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                        const minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                        dynamicChangesStack[keyForDynamicChange] = {
                          leftSingleUnit: currentSingleUnit,
                          measureIndexes: [ currentMeasure.measureIndexOnPageLine ],
                          chords: [ currentSingleUnit ],
                          key: currentSingleUnit.dynamicChangeMark.key,
                          type: currentSingleUnit.dynamicChangeMark.type,
                          direction: currentSingleUnit.dynamicChangeMark.direction,
                          valueBefore: currentSingleUnit.dynamicChangeMark.valueBefore,
                          valueAfter: currentSingleUnit.dynamicChangeMark.valueAfter,
                          yCorrection: currentSingleUnit.dynamicChangeMark.yCorrection,
                          startYPosition: currentSingleUnit.dynamicChangeMark.direction === 'up'
                            ? minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min
                            : minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max
                        }
                        if (!currentSingleUnit.dynamicChangeMark.type) {
                          dynamicChangesStack[keyForDynamicChange].rightSingleUnit = currentSingleUnit
                          dynamicChanges.push(
                            drawDynamicChange(dynamicChangesStack[keyForDynamicChange], styles)
                          )
                          delete dynamicChangesStack[keyForDynamicChange]
                        }
                      } else if (currentSingleUnit.dynamicChangeMark.finish && dynamicChangesStack[keyForDynamicChange]) {
                        dynamicChangesStack[keyForDynamicChange].rightSingleUnit = currentSingleUnit
                        dynamicChangesStack[keyForDynamicChange].chords.push(currentSingleUnit)
                        if (dynamicChangesStack[keyForDynamicChange].measureIndexes.indexOf(currentSingleUnit.measureIndexOnPageLine) === -1) {
                          dynamicChangesStack[keyForDynamicChange].measureIndexes.push(currentMeasure.measureIndexOnPageLine)
                        }
                        const minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                        dynamicChangesStack[keyForDynamicChange].startYPosition = dynamicChangesStack[keyForDynamicChange].direction === 'up'
                          ? Math.min(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min)
                          : Math.max(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max)
                        dynamicChanges.push(
                          drawDynamicChange(dynamicChangesStack[keyForDynamicChange], styles)
                        )
                        delete dynamicChangesStack[keyForDynamicChange]
                      }
                    } else {
                      if (dynamicChangesStack[keyForDynamicChange]) {
                        if (currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                          dynamicChangesStack[keyForDynamicChange].rightSingleUnit = currentSingleUnit
                          dynamicChangesStack[keyForDynamicChange].chords.push(currentSingleUnit)
                          if (dynamicChangesStack[keyForDynamicChange].measureIndexes.indexOf(currentSingleUnit.measureIndexOnPageLine) === -1) {
                            dynamicChangesStack[keyForDynamicChange].measureIndexes.push(currentMeasure.measureIndexOnPageLine)
                          }
                          const minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                          dynamicChangesStack[keyForDynamicChange].startYPosition = dynamicChangesStack[keyForDynamicChange].direction === 'up'
                            ? Math.min(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min)
                            : Math.max(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max)
                          dynamicChanges.push(
                            drawDynamicChange(dynamicChangesStack[keyForDynamicChange], styles)
                          )
                          delete dynamicChangesStack[keyForDynamicChange]
                        } else {
                          dynamicChangesStack[keyForDynamicChange].chords.push(currentSingleUnit)
                          if (dynamicChangesStack[keyForDynamicChange].measureIndexes.indexOf(currentSingleUnit.measureIndexOnPageLine) === -1) {
                            const minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                            dynamicChangesStack[keyForDynamicChange].startYPosition = dynamicChangesStack[keyForDynamicChange].direction === 'up'
                              ? Math.min(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min)
                              : Math.max(dynamicChangesStack[keyForDynamicChange].startYPosition, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max)
                            dynamicChangesStack[keyForDynamicChange].measureIndexes.push(currentMeasure.measureIndexOnPageLine)
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    dynamicChanges.forEach(dynamicChange => {
      dynamicChange.chords.forEach(singleUnit => {
        if (!dynamicChange.isEmpty) {
          singleUnit.top = Math.min(singleUnit.top, dynamicChange.top)
          singleUnit.bottom = Math.max(singleUnit.bottom, dynamicChange.bottom)
          measuresOnPageLine[singleUnit.measureIndexOnPageLine].top = Math.min(measuresOnPageLine[singleUnit.measureIndexOnPageLine].top, dynamicChange.top)
          measuresOnPageLine[singleUnit.measureIndexOnPageLine].bottom = Math.max(measuresOnPageLine[singleUnit.measureIndexOnPageLine].bottom, dynamicChange.top)
        }
      })
    })
  }
  return dynamicChanges
}
