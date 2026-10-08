'use strict'

import drawOctaveSignShape from '#msq/drawer/elements/spans/octave-signs/drawOctaveSignShape.js'
import calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex from '#msq/drawer/elements/shared/calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.js'

const generateKeyForOctaveSign = (staveIndex, voiceIndex) => {
  return `${staveIndex}-${voiceIndex}`
}

export default function (voicesOnPageLine, styles) {
  const octaveSigns = []
  const octaveSignsStack = {}
  if (voicesOnPageLine) {
    for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
      if (voicesOnPageLine[measureIndex]) {
        const { singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, withoutVoices } = voicesOnPageLine[measureIndex]
        if (!withoutVoices) {
          for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
            if (singleUnitsInVoices[staveIndex]) {
              let minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex
              for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
                if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                  for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                    const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                    const keyForOctaveSign = generateKeyForOctaveSign(staveIndex, voiceIndex)
                    if (octaveSignsStack[keyForOctaveSign]) {
                      octaveSignsStack[keyForOctaveSign].chords.push(currentSingleUnit)
                      if (!minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex) {
                        minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                        octaveSignsStack[keyForOctaveSign].y = octaveSignsStack[keyForOctaveSign].direction === 'up'
                          ? Math.min(octaveSignsStack[keyForOctaveSign].y, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min)
                          : Math.max(octaveSignsStack[keyForOctaveSign].y, minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max)
                      }
                    }
                    if (currentSingleUnit.octaveSignMark) {
                      if (octaveSignsStack[keyForOctaveSign]) {
                        octaveSignsStack[keyForOctaveSign].rightSingleUnit = currentSingleUnit
                        const octaveSignShape = drawOctaveSignShape(octaveSignsStack[keyForOctaveSign], styles)
                        octaveSigns.push(octaveSignShape)
                        delete octaveSignsStack[keyForOctaveSign]
                      }
                      const octaveSignMark = currentSingleUnit.octaveSignMark
                      if (!octaveSignsStack[keyForOctaveSign] && octaveSignMark.octaveNumber && octaveSignMark.octavePostfix) {
                        const direction = octaveSignMark.direction || 'up'
                        if (!minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex) {
                          minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex = calculateMinTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex(singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, staveIndex, styles)
                        }
                        octaveSignsStack[keyForOctaveSign] = {
                          direction,
                          octaveNumber: octaveSignMark.octaveNumber,
                          octavePostfix: octaveSignMark.octavePostfix,
                          yCorrection: octaveSignMark.yCorrection,
                          y: direction === 'up'
                            ? minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.min
                            : minTopAndMaxBottomOfCrossVoiceUnitsOnStaveWithSpecifiedIndex.max,
                          leftSingleUnit: currentSingleUnit,
                          chords: [ currentSingleUnit ],
                          key: octaveSignMark.key
                        }
                      }
                      if (octaveSignMark.finish && octaveSignsStack[keyForOctaveSign]) {
                        octaveSignsStack[keyForOctaveSign].rightSingleUnit = currentSingleUnit
                        const octaveSignShape = drawOctaveSignShape(octaveSignsStack[keyForOctaveSign], styles)
                        octaveSigns.push(octaveSignShape)
                        delete octaveSignsStack[keyForOctaveSign]
                      }
                    }
                    if (octaveSignsStack[keyForOctaveSign] && currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                      octaveSignsStack[keyForOctaveSign].rightSingleUnit = currentSingleUnit
                      const octaveSignShape = drawOctaveSignShape(octaveSignsStack[keyForOctaveSign], styles)
                      octaveSigns.push(octaveSignShape)
                      delete octaveSignsStack[keyForOctaveSign]
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
  return octaveSigns
}
