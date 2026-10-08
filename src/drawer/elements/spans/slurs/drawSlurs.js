'use strict'

import drawSlurShape from '#msq/drawer/elements/spans/slurs/drawSlurShape.js'
import createPhantomSingleUnitThatIsInSlurThatFinishesInTheMomentItChangesItsStave from '#msq/drawer/elements/spans/slurs/createPhantomSingleUnitThatIsInSlurThatFinishesInTheMomentItChangesItsStave.js'

export default function (voicesOnPageLine, styles) {
  const slurs = []
  const slursStack = {}
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { singleUnitsInAllCrossStaveUnits, voicesBody, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < singleUnitsInAllCrossStaveUnits.length; crossStaveUnitIndex++) {
          const currentCrossStaveUnit = singleUnitsInAllCrossStaveUnits[crossStaveUnitIndex]
          for (let crossVoiceUnitIndex = 0; crossVoiceUnitIndex < currentCrossStaveUnit.length; crossVoiceUnitIndex++) {
            const currentCrossVoiceUnitInCurrentCrossStaveUnit = currentCrossStaveUnit[crossVoiceUnitIndex]
            for (let singleUnitIndex = 0; singleUnitIndex < currentCrossVoiceUnitInCurrentCrossStaveUnit.length; singleUnitIndex++) {
              const currentSingleUnit = currentCrossVoiceUnitInCurrentCrossStaveUnit[singleUnitIndex]
              if (currentSingleUnit.slurMarks) {
                for (let slurIndex = 0; slurIndex < currentSingleUnit.slurMarks.length; slurIndex++) {
                  const currentSlurMark = currentSingleUnit.slurMarks[slurIndex]
                  const currentSlurMarkKey = currentSlurMark.key
                  if (!slursStack[currentSlurMarkKey]) {
                    const currentSlurDirection = currentSlurMark.direction
                    const currentSlurMarkWithSShape = currentSlurMark.sShape
                    const currentSlurMarkRoundCoefficientFactor = currentSlurMark.roundCoefficientFactor
                    const currentSlurMarkLeftYCorrection = currentSlurMark.leftYCorrection
                    const currentSlurMarkRightYCorrection = currentSlurMark.rightYCorrection
                    const rightPlacement = currentSlurMark.rightPlacement
                    let startsBefore = false
                    let voicesBodyThatSlurStartsBefore
                    if (currentSlurMark.before) {
                      startsBefore = true
                      voicesBodyThatSlurStartsBefore = voicesBody
                    }
                    const allSingleUnitsOnTheWay = []
                    if (startsBefore) {
                      const { staveIndex, voiceIndex } = currentSingleUnit
                      const { singleUnitsInVoices, withoutVoices } = voicesOnPageLine[measureIndex]
                      if (!withoutVoices) {
                        for (let singleUnitIndexBefore = 0; singleUnitIndexBefore < crossStaveUnitIndex; singleUnitIndexBefore++) {
                          if (singleUnitsInVoices[staveIndex] && singleUnitsInVoices[staveIndex][voiceIndex] && singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndexBefore]) {
                            const singleUnitBefore = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndexBefore]
                            allSingleUnitsOnTheWay.push(singleUnitBefore)
                          }
                        }
                      }
                    }
                    slursStack[currentSlurMarkKey] = {
                      startsBefore,
                      finishesAfter: false,
                      voicesBodyThatSlurStartsBefore,
                      allSingleUnitsOnTheWay,
                      defaultSlurDirection: currentSingleUnit.stemDirection === 'down' ? 'up' : 'down',
                      customSlurDirection: currentSlurDirection,
                      currentStaveIndex: currentSingleUnit.staveIndex,
                      currentVoiceIndex: currentSingleUnit.voiceIndex,
                      withSShape: currentSlurMarkWithSShape,
                      roundCoefficientFactor: currentSlurMarkRoundCoefficientFactor,
                      leftYCorrection: currentSlurMarkLeftYCorrection,
                      rightYCorrection: currentSlurMarkRightYCorrection,
                      slurMarkKey: currentSlurMarkKey,
                      rightPlacement
                    }
                  } else if (slursStack[currentSlurMarkKey]) {
                    if ((slursStack[currentSlurMarkKey].currentStaveIndex !== currentSingleUnit.staveIndex) && currentSlurMark.finish) {
                      slursStack[currentSlurMarkKey].allSingleUnitsOnTheWay.push(
                        createPhantomSingleUnitThatIsInSlurThatFinishesInTheMomentItChangesItsStave(
                          currentSingleUnit,
                          currentSlurMarkKey,
                          slursStack[currentSlurMarkKey].currentStaveIndex,
                          currentSingleUnit.staveIndex,
                          styles
                        )
                      )
                    }
                    slursStack[currentSlurMarkKey].currentStaveIndex = currentSingleUnit.staveIndex
                    if (currentSlurMark.finish) {
                      if (slursStack[currentSlurMarkKey].currentVoiceIndex === currentSingleUnit.voiceIndex) {
                        slursStack[currentSlurMarkKey].allSingleUnitsOnTheWay.push(currentSingleUnit)
                        if (currentSlurMark.after) {
                          slursStack[currentSlurMarkKey].finishesAfter = true
                          const { staveIndex, voiceIndex } = currentSingleUnit
                          const { singleUnitsInVoices, withoutVoices } = voicesOnPageLine[measureIndex]
                          if (!withoutVoices) {
                            if (singleUnitsInVoices[staveIndex] && singleUnitsInVoices[staveIndex][voiceIndex]) {
                              for (let singleUnitIndexAfter = crossStaveUnitIndex + 1; singleUnitIndexAfter < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndexAfter++) {
                                if (singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndexAfter]) {
                                  const singleUnitAfter = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndexAfter]
                                  slursStack[currentSlurMarkKey].allSingleUnitsOnTheWay.push(singleUnitAfter)
                                }
                              }
                            }
                          }
                        }
                      }
                      slurs.push(drawSlurShape(slursStack[currentSlurMarkKey], currentSlurMarkKey, voicesBody, slursStack[currentSlurMarkKey].startsBefore, slursStack[currentSlurMarkKey].finishesAfter, styles))
                      delete slursStack[currentSlurMarkKey]
                    }
                  }
                }
              }
              for (const currentSlurMarkKey in slursStack) {
                const currentMarkedSlur = slursStack[currentSlurMarkKey]
                if (currentSingleUnit.stemDirection === 'down') {
                  currentMarkedSlur.defaultSlurDirection = 'up'
                }
                let thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit = false
                let thereIsChangeOfSlurStaveIndexWithTheSameKeyInCurrentCrossStaveUnit = false
                for (let crossStaveUnitIndexAfter = crossStaveUnitIndex; crossStaveUnitIndexAfter < singleUnitsInAllCrossStaveUnits.length; crossStaveUnitIndexAfter++) {
                  if (thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit) {
                    break
                  }
                  const currentCrossStaveUnit = singleUnitsInAllCrossStaveUnits[crossStaveUnitIndexAfter]
                  const crossVoiceUnitFirstIndexAfter = (crossStaveUnitIndexAfter === crossStaveUnitIndex)
                    ? (crossVoiceUnitIndex + 1)
                    : 0
                  for (let crossVoiceUnitIndexAfter = crossVoiceUnitFirstIndexAfter; crossVoiceUnitIndexAfter < currentCrossStaveUnit.length; crossVoiceUnitIndexAfter++) {
                    if (thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit) {
                      break
                    }
                    const currentVoiceAfterInCrossStaveUnit = currentCrossStaveUnit[crossVoiceUnitIndexAfter]
                    for (let singleUnitIndexAfter = 0; singleUnitIndexAfter < currentVoiceAfterInCrossStaveUnit.length; singleUnitIndexAfter++) {
                      if (thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit) {
                        break
                      }
                      const singleUnitAfterInCurrentCrossStaveUnit = currentVoiceAfterInCrossStaveUnit[singleUnitIndexAfter]
                      if (singleUnitAfterInCurrentCrossStaveUnit.slurMarks) {
                        for (let slurMarkIndex = 0; slurMarkIndex < singleUnitAfterInCurrentCrossStaveUnit.slurMarks.length; slurMarkIndex++) {
                          if (thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit) {
                            break
                          }
                          if (
                            currentSlurMarkKey === singleUnitAfterInCurrentCrossStaveUnit.slurMarks[slurMarkIndex].key &&
                            singleUnitAfterInCurrentCrossStaveUnit.staveIndex !== currentSingleUnit.staveIndex
                          ) {
                            thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit = true
                            if (crossStaveUnitIndexAfter === crossStaveUnitIndex) {
                              thereIsChangeOfSlurStaveIndexWithTheSameKeyInCurrentCrossStaveUnit = true
                            }
                            break
                          }
                        }
                      }
                    }
                  }
                }
                if (
                  currentSingleUnit.staveIndex === currentMarkedSlur.currentStaveIndex &&
                  currentSingleUnit.voiceIndex === currentMarkedSlur.currentVoiceIndex
                ) {
                  if (!thereIsChangeOfSlurStaveIndexWithTheSameKeyInCurrentCrossStaveUnit) {
                    currentMarkedSlur.allSingleUnitsOnTheWay.push(currentSingleUnit)
                  }
                  if (currentSingleUnit.isLastSingleUnitInVoiceOnPageLine && !thereIsChangeOfSlurStaveIndexWithTheSameKeyAfterCurrentCrossStaveUnit) {
                    if (currentMarkedSlur.allSingleUnitsOnTheWay.length > 0) {
                      slurs.push(drawSlurShape(currentMarkedSlur, currentSlurMarkKey, voicesBody, currentMarkedSlur.startsBefore, true, styles))
                    }
                    delete slursStack[currentSlurMarkKey]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return slurs
}
