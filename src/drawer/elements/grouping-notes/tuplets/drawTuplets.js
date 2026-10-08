'use strict'

import drawTupletShape from '#msq/drawer/elements/grouping-notes/tuplets/drawTupletShape.js'
import calculateTopOfStaveForFirstNoteInCurrentSingleUnit from '#msq/drawer/elements/shared/calculateTopOfStaveForFirstNoteInCurrentSingleUnit.js'
import calculateTopOfStaveForLastNoteInCurrentSingleUnit from '#msq/drawer/elements/shared/calculateTopOfStaveForLastNoteInCurrentSingleUnit.js'

const generateKeyForTupletStack = (staveIndex, voiceIndex) => {
  return `${staveIndex}-${voiceIndex}`
}

const areAllLeftPointsWithTupletDirectionOfTupletsWithLevelLowerThanOrEqualToSpecifiedOneFinished = (leftPointsOfTuplets, tupletDirection, tupletLevel) => leftPointsOfTuplets
  .filter(leftTupletPoint => (leftTupletPoint.tupletDirection === tupletDirection) && ((leftTupletPoint.level <= tupletLevel) || leftTupletPoint.finished))
  .every(leftTupletPoint => leftTupletPoint.finished)

export default function (voicesOnPageLine, voicesBodiesOnPageLine, styles) {
  const { intervalBetweenStaveLines, tupletNestedVerticalGradient, topOffsetOfTupletWithLevelZero } = styles
  const tuplets = []
  const tupletsStack = {}
  let yByKeyForTupletStackAndDirectionAndLevel = {}
  if (voicesOnPageLine) {
    for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
      if (voicesOnPageLine[measureIndex]) {
        const { singleUnitsInVoices, voicesBody, withoutVoices, topOffsetsForEachStave, numberOfStaveLines } = voicesOnPageLine[measureIndex]
        if (!withoutVoices) {
          for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
            if (singleUnitsInVoices[staveIndex]) {
              for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
                if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                  for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                    const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                    const keyForTupletStack = generateKeyForTupletStack(staveIndex, voiceIndex)
                    if (currentSingleUnit.tupletMarks) {
                      for (let tupletMarkIndex = 0; tupletMarkIndex < currentSingleUnit.tupletMarks.length; tupletMarkIndex++) {
                        const currentTupletMark = currentSingleUnit.tupletMarks[tupletMarkIndex]
                        if (!currentTupletMark.finish) {
                          const tupletKey = currentTupletMark.key
                          const tupletDirection = currentTupletMark.direction || 'up'
                          const tupletMustBeWithBrackets = currentTupletMark.withBrackets || false
                          const tupletValue = currentTupletMark.value
                          const tupletIsAboveOrBelowStaveLines = currentTupletMark.aboveBelowOverUnderStaveLines
                          const tupletYCorrection = (currentTupletMark.yCorrection || 0) * intervalBetweenStaveLines
                          if (/^(\d+)(:(\d+))?$/.test(tupletValue)) {
                            if (!tupletsStack[keyForTupletStack]) {
                              tupletsStack[keyForTupletStack] = {
                                leftPointsOfTuplets: []
                              }
                            }
                            const nextTupletLeftPoint = {
                              tupletKey,
                              x: currentSingleUnit.stemless
                                ? currentSingleUnit.bodyLeft
                                : (currentSingleUnit.stemDirection === tupletDirection)
                                  ? currentSingleUnit.stemLeft
                                  : currentSingleUnit.bodyLeft,
                              tupletDirection,
                              level: 0,
                              mustBeWithBrackets: tupletMustBeWithBrackets,
                              singleUnits: [ ],
                              tupletValue,
                              tupletYCorrection
                            }
                            if (currentTupletMark.before) {
                              nextTupletLeftPoint.startsBefore = true
                              nextTupletLeftPoint.voicesBodyThatTupletStartsBefore = voicesBody
                            } else {
                              nextTupletLeftPoint.startsBefore = false
                            }
                            tupletsStack[keyForTupletStack].leftPointsOfTuplets.push(nextTupletLeftPoint)
                            if (!yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack]) {
                              yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack] = {}
                            }
                            if (!yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][tupletDirection]) {
                              yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][tupletDirection] = []
                            }
                            if (yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][tupletDirection][0] === undefined) {
                              const topOfStaveForFirstNoteInCurrentSingleUnit = calculateTopOfStaveForFirstNoteInCurrentSingleUnit(staveIndex, currentSingleUnit, topOffsetsForEachStave)
                              const topOfStaveForLastNoteInCurrentSingleUnit = calculateTopOfStaveForLastNoteInCurrentSingleUnit(staveIndex, currentSingleUnit, topOffsetsForEachStave)
                              const bottomOfStaveForLastNoteInCurrentSingleUnit = topOfStaveForLastNoteInCurrentSingleUnit + (numberOfStaveLines - 1) * (intervalBetweenStaveLines)
                              yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][tupletDirection][0] = tupletDirection === 'up'
                                ? (tupletIsAboveOrBelowStaveLines ? topOfStaveForFirstNoteInCurrentSingleUnit : currentSingleUnit.top) - topOffsetOfTupletWithLevelZero
                                : (tupletIsAboveOrBelowStaveLines ? bottomOfStaveForLastNoteInCurrentSingleUnit : currentSingleUnit.bottom) + topOffsetOfTupletWithLevelZero
                            }
                            if (tupletsStack[keyForTupletStack].leftPointsOfTuplets.length > 1) {
                              for (let tupletPointIndex = tupletsStack[keyForTupletStack].leftPointsOfTuplets.length - 1; tupletPointIndex > 0; tupletPointIndex--) {
                                const currentTupletLeftPoint = tupletsStack[keyForTupletStack].leftPointsOfTuplets[tupletPointIndex]
                                const prevTupletLeftPointsWithTheSameDirectionAsForCurrentTupletLeftPoint = tupletsStack[keyForTupletStack].leftPointsOfTuplets.slice(0, tupletPointIndex).filter(prevTupletLeftPoint => prevTupletLeftPoint.tupletDirection === currentTupletLeftPoint.tupletDirection)
                                const prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint = prevTupletLeftPointsWithTheSameDirectionAsForCurrentTupletLeftPoint[prevTupletLeftPointsWithTheSameDirectionAsForCurrentTupletLeftPoint.length - 1]
                                if (prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint) {
                                  if (prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.level === currentTupletLeftPoint.level) {
                                    prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.level = currentTupletLeftPoint.level + 1
                                    const newTupletLevel = prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.level
                                    if (!yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack]) {
                                      yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack] = {}
                                    }
                                    if (!yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.tupletDirection]) {
                                      yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.tupletDirection] = []
                                    }
                                    if (
                                      yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.tupletDirection][newTupletLevel] === undefined
                                    ) {
                                      yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][prevTupletLeftPointWithTheSameDirectionAsForCurrentTupletLeftPoint.tupletDirection][newTupletLevel] = yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][currentTupletLeftPoint.tupletDirection][currentTupletLeftPoint.level] + (currentTupletLeftPoint.tupletDirection === 'up' ? -1 : +1) * tupletNestedVerticalGradient
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    if (tupletsStack[keyForTupletStack] && tupletsStack[keyForTupletStack].leftPointsOfTuplets) {
                      for (let tupletPointIndex = tupletsStack[keyForTupletStack].leftPointsOfTuplets.length - 1; tupletPointIndex >= 0; tupletPointIndex--) {
                        const leftTupletPoint = tupletsStack[keyForTupletStack].leftPointsOfTuplets[tupletPointIndex]
                        if (leftTupletPoint) {
                          if (
                            yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack] &&
                            yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection] &&
                            yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection][leftTupletPoint.level] !== undefined
                          ) {
                            let distanceToMoveTupletsSoTheyCanBeAboveOrBeneathTupletSingleUnits = 0
                            const tupletPointDirectionSign = leftTupletPoint.tupletDirection === 'up' ? -1 : +1
                            distanceToMoveTupletsSoTheyCanBeAboveOrBeneathTupletSingleUnits = leftTupletPoint.tupletDirection === 'up'
                              ? Math.max(0, yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection][leftTupletPoint.level] - currentSingleUnit.top + topOffsetOfTupletWithLevelZero)
                              : Math.max(0, currentSingleUnit.bottom - yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection][leftTupletPoint.level] + topOffsetOfTupletWithLevelZero)
                            if (distanceToMoveTupletsSoTheyCanBeAboveOrBeneathTupletSingleUnits > 0) {
                              for (let levelIndex = 0; levelIndex < yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection].length; levelIndex++) {
                                yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPoint.tupletDirection][levelIndex] += tupletPointDirectionSign * distanceToMoveTupletsSoTheyCanBeAboveOrBeneathTupletSingleUnits
                              }
                            }
                          }
                          if (!leftTupletPoint.finished) {
                            leftTupletPoint.singleUnits.push(currentSingleUnit)
                          }
                        }
                      }
                    }
                    if (currentSingleUnit.tupletMarks) {
                      for (let tupletMarkIndex = 0; tupletMarkIndex < currentSingleUnit.tupletMarks.length; tupletMarkIndex++) {
                        const currentTupletMark = currentSingleUnit.tupletMarks[tupletMarkIndex]
                        if (currentTupletMark.finish && currentTupletMark.after && singleUnitIndex !== singleUnitsInVoices[staveIndex][voiceIndex].length - 1) {
                          const lastSingleUnitInCurrentVoiceOnCurrentStave = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitsInVoices[staveIndex][voiceIndex].length - 1]
                          if (lastSingleUnitInCurrentVoiceOnCurrentStave) {
                            lastSingleUnitInCurrentVoiceOnCurrentStave.tupletMarks = lastSingleUnitInCurrentVoiceOnCurrentStave.tupletMarks || []
                            lastSingleUnitInCurrentVoiceOnCurrentStave.tupletMarks.unshift(currentTupletMark)
                            currentSingleUnit.tupletMarks.splice(tupletMarkIndex, 1)
                            tupletMarkIndex--
                            continue
                          }
                        }
                        if (currentTupletMark.finish) {
                          if (tupletsStack[keyForTupletStack]) {
                            const leftPointIndexWithTupletKeyAsInCurrentTupletMark = tupletsStack[keyForTupletStack]
                              .leftPointsOfTuplets
                              .findIndex(leftTupletPoint => leftTupletPoint.tupletKey === currentTupletMark.key)
                            if (leftPointIndexWithTupletKeyAsInCurrentTupletMark !== -1) {
                              const leftPointWithTupletKeyAsInCurrentTupletMark = tupletsStack[keyForTupletStack].leftPointsOfTuplets[leftPointIndexWithTupletKeyAsInCurrentTupletMark]
                              if (currentTupletMark.after) {
                                leftPointWithTupletKeyAsInCurrentTupletMark.finishesAfter = true
                              } else {
                                leftPointWithTupletKeyAsInCurrentTupletMark.finishesAfter = false
                              }
                              if (leftPointWithTupletKeyAsInCurrentTupletMark && leftPointWithTupletKeyAsInCurrentTupletMark.singleUnits.length > 0) {
                                leftPointWithTupletKeyAsInCurrentTupletMark.finished = true
                                if (areAllLeftPointsWithTupletDirectionOfTupletsWithLevelLowerThanOrEqualToSpecifiedOneFinished(tupletsStack[keyForTupletStack].leftPointsOfTuplets, leftPointWithTupletKeyAsInCurrentTupletMark.tupletDirection, leftPointWithTupletKeyAsInCurrentTupletMark.level)) {
                                  for (let leftTupletPointIndex = 0; leftTupletPointIndex < tupletsStack[keyForTupletStack].leftPointsOfTuplets.length; leftTupletPointIndex++) {
                                    if (
                                      (tupletsStack[keyForTupletStack].leftPointsOfTuplets[leftTupletPointIndex].tupletDirection === leftPointWithTupletKeyAsInCurrentTupletMark.tupletDirection) &&
                                      (
                                        (tupletsStack[keyForTupletStack].leftPointsOfTuplets[leftTupletPointIndex].level <= leftPointWithTupletKeyAsInCurrentTupletMark.level) ||
                                        tupletsStack[keyForTupletStack].leftPointsOfTuplets[leftTupletPointIndex].finished
                                      )
                                    ) {
                                      const leftTupletPointToBeDrawn = tupletsStack[keyForTupletStack].leftPointsOfTuplets[leftTupletPointIndex]
                                      leftTupletPointToBeDrawn.y = yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftTupletPointToBeDrawn.tupletDirection][leftTupletPointToBeDrawn.level]
                                      const belongsToComplexTuplet = tupletsStack[keyForTupletStack].leftPointsOfTuplets.length > 1
                                      const tupletShape = drawTupletShape(leftTupletPointToBeDrawn, voicesBody, belongsToComplexTuplet, leftTupletPointToBeDrawn.startsBefore, leftTupletPointToBeDrawn.finishesAfter, styles)
                                      tuplets.push(tupletShape)
                                      tupletsStack[keyForTupletStack].leftPointsOfTuplets.splice(leftTupletPointIndex, 1)
                                      leftTupletPointIndex--
                                    }
                                  }
                                  yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack][leftPointWithTupletKeyAsInCurrentTupletMark.tupletDirection].splice(0, leftPointWithTupletKeyAsInCurrentTupletMark.level)
                                  if (tupletsStack[keyForTupletStack].leftPointsOfTuplets.length === 0) {
                                    delete tupletsStack[keyForTupletStack]
                                    delete yByKeyForTupletStackAndDirectionAndLevel[keyForTupletStack]
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    if (currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                      for (const currentTupletStackKey in tupletsStack) {
                        if (currentTupletStackKey === keyForTupletStack) {
                          const currentMarkedTuplet = tupletsStack[currentTupletStackKey]
                          const initialNumberOfUnfinishedTuplets = currentMarkedTuplet.leftPointsOfTuplets.length
                          const belongsToComplexTuplet = currentMarkedTuplet.leftPointsOfTuplets.length > 1
                          for (let leftTupletPointIndex = 0; leftTupletPointIndex < initialNumberOfUnfinishedTuplets; leftTupletPointIndex++) {
                            const lastLeftTupletPoint = currentMarkedTuplet.leftPointsOfTuplets.shift()
                            if (lastLeftTupletPoint && lastLeftTupletPoint.singleUnits.length > 0) {
                              lastLeftTupletPoint.y = yByKeyForTupletStackAndDirectionAndLevel[currentTupletStackKey][lastLeftTupletPoint.tupletDirection][lastLeftTupletPoint.level]
                              const tupletShape = drawTupletShape(lastLeftTupletPoint, voicesBody, belongsToComplexTuplet, lastLeftTupletPoint.startsBefore, true, styles)
                              tuplets.push(tupletShape)
                            }
                            delete tupletsStack[currentTupletStackKey]
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
  }
  return tuplets
}
