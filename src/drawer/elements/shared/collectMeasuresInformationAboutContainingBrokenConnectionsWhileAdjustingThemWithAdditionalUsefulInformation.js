'use strict'

import doSingleUnitParamsContainBrokenConnectionsThatStartBefore from '#msq/drawer/elements/shared/doSingleUnitParamsContainBrokenConnectionsThatStartBefore.js'
import doSingleUnitParamsContainBrokenConnectionsThatFinishAfter from '#msq/drawer/elements/shared/doSingleUnitParamsContainBrokenConnectionsThatFinishAfter.js'
import pushMeasureIndexesThatSomeBrokenConnectionsStartBeforeOrFinishAfter from '#msq/drawer/elements/shared/pushMeasureIndexesThatSomeBrokenConnectionsStartBeforeOrFinishAfter.js'
import calculateTremoloDurationFactor from '#msq/drawer/elements/spans/tremolo/calculateTremoloDurationFactor.js'
import calculateActualDurationConsideringDotsAndTupletsAndTremolos from '#msq/drawer/elements/notes-on-a-page/durations/calculateActualDurationConsideringDotsAndTupletsAndTremolos.js'

const removeDuplicateNotes = (notes) => {
  return notes.filter((note, index) => {
    const otherNoteIndexWithTheSameNotePositionNumberOrNoteNameAndStave = notes.findIndex(otherNote => {
      if (otherNote.positionNumber !== undefined && note.positionNumber !== undefined) {
        return (otherNote.positionNumber === note.positionNumber) &&
          (otherNote.stave === note.stave)
      }
      if (otherNote.noteName !== undefined && note.noteName !== undefined) {
        return (otherNote.noteName === note.noteName) &&
          (note.octaveNumber === otherNote.octaveNumber) &&
          (otherNote.stave === note.stave)
      }
      return false
    })
    if (otherNoteIndexWithTheSameNotePositionNumberOrNoteNameAndStave !== -1 && otherNoteIndexWithTheSameNotePositionNumberOrNoteNameAndStave < index) {
      return false
    }
    return true
  })
}

const doesMeasureContainCrossStaveUnits = (measureParams) => {
  for (let staveIndex = 0; staveIndex < measureParams.stavesParams.length; staveIndex++) {
    if (measureParams.stavesParams[staveIndex].voicesParams) {
      for (let voiceIndex = 0; voiceIndex < measureParams.stavesParams[staveIndex].voicesParams.length; voiceIndex++) {
        for (let singleUnitIndex = 0; singleUnitIndex < measureParams.stavesParams[staveIndex].voicesParams[voiceIndex].length; singleUnitIndex++) {
          const currentUnitParams = measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex]
          if (currentUnitParams.notes) {
            if (currentUnitParams.notes.some(note => (note.stave === 'next') || (note.stave === 'prev'))) {
              return true
            }
          }
        }
      }
    }
  }
  return false
}

const doesMeasureContainOnlyOneUnitOnSpecifiedStaveAndNoMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave = (measureParams, staveIndex) => {
  return (measureParams.stavesParams[staveIndex].voicesParams.length === 1) &&
    (measureParams.stavesParams[staveIndex].voicesParams[0].length === 1) &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].clefBefore &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].keySignatureBefore &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].breathMarkBefore &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].keysParams &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].relatedChordLetter &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].relatedLyrics &&
    !measureParams.stavesParams[staveIndex].voicesParams[0][0].simileMark
}

export default function (measuresParams) {
  const informationAboutBrokenConnectionsInMeasures = []
  const measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore = []
  const measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter = []
  const measuresParamsOnPageLine = []
  let measureIndexOnPageLine
  let pageLineNumber = 0
  let numberOfStavesToAdjustForDifferentCrossStaveElements = 1
  let lastIndexOfMeasureThatIsNextToTheLastOnPageLine = 0
  let minUnitDurationOnPageLine = 4
  let numberOfStavesInPreviousMeasure
  measuresParams.forEach(
    (measureParams, measureIndex) => {
      measuresParamsOnPageLine.push(measureParams)
      if (measureParams.stavesParams) {
        numberOfStavesToAdjustForDifferentCrossStaveElements = Math.max(numberOfStavesToAdjustForDifferentCrossStaveElements, measureParams.stavesParams.length)
      }
      if (measureIndexOnPageLine === undefined) {
        measureIndexOnPageLine = 0
        informationAboutBrokenConnectionsInMeasures[pageLineNumber] = []
      } else {
        measureIndexOnPageLine += 1
      }
      const isLastMeasureInGeneral = measureIndex === measuresParams.length - 1
      if (isLastMeasureInGeneral) {
        measureParams.isLastMeasureOnPageLine = true
      }
      const isLastMeasureOnPageLine = measureParams.isLastMeasureOnPageLine
      let currentMeasureContainsBreakingConnectionsThatStartBefore = false
      let currentMeasureContainsBreakingConnectionsThatFinishAfter = false
      if (!measureParams.stavesParams || measureParams.stavesParams.length === 0) {
        measureParams.stavesParams = []
        if (numberOfStavesInPreviousMeasure !== undefined) {
          numberOfStavesToAdjustForDifferentCrossStaveElements = numberOfStavesInPreviousMeasure
        } else {
          let minStaveNumberAccordingToConnectionsParams = 0
          let maxStaveNumberAccordingToConnectionsParams = 0
          let numberOfStavesAccordingToConnectionParams = 0

          let minStaveNumberAccordingToInstrumentTitlesParams = 0
          let maxStaveNumberAccordingToInstrumentTitlesParams = 0
          let numberOfStavesAccordingToInstrumentTitlesParams = 0

          if (measureParams.connectionsParams && measureParams.connectionsParams.length !== 0) {
            minStaveNumberAccordingToConnectionsParams = 0
            maxStaveNumberAccordingToConnectionsParams = Math.max(...measureParams.connectionsParams.map(params => params.staveEndNumber))
            numberOfStavesAccordingToConnectionParams = maxStaveNumberAccordingToConnectionsParams - minStaveNumberAccordingToConnectionsParams + 1
          }
          if (measureParams.instrumentTitlesParams && measureParams.instrumentTitlesParams.length !== 0) {
            minStaveNumberAccordingToInstrumentTitlesParams = 0
            maxStaveNumberAccordingToInstrumentTitlesParams = Math.max(...measureParams.instrumentTitlesParams.map(params => params.staveEndNumber === undefined ? params.staveNumber : params.staveEndNumber))
            numberOfStavesAccordingToInstrumentTitlesParams = maxStaveNumberAccordingToInstrumentTitlesParams - minStaveNumberAccordingToInstrumentTitlesParams + 1
            numberOfStavesAccordingToInstrumentTitlesParams = numberOfStavesAccordingToInstrumentTitlesParams || 0
          }
          numberOfStavesToAdjustForDifferentCrossStaveElements = Math.max(numberOfStavesAccordingToConnectionParams, numberOfStavesAccordingToInstrumentTitlesParams, numberOfStavesToAdjustForDifferentCrossStaveElements)
        }
        for (let staveIndex = 0; staveIndex < numberOfStavesToAdjustForDifferentCrossStaveElements; staveIndex++) {
          const staveParams = { voicesParams: [] }
          measureParams.stavesParams.push(
            staveParams
          )
        }
      }
      numberOfStavesInPreviousMeasure = measureParams.stavesParams.length
      measureParams.containsAtLeastOneVoiceWithMoreThanOneUnit = measureParams.stavesParams.some(
        staveParams => staveParams.voicesParams && staveParams.voicesParams.some(voiceParams => voiceParams.length > 1)
      )
      const measureDoesNotContainCrossStaveUnits = !doesMeasureContainCrossStaveUnits(measureParams)
      for (let staveIndex = 0; staveIndex < measureParams.stavesParams.length; staveIndex++) {
        if (measureParams.stavesParams[staveIndex].voicesParams) {
          const measureContainsOnlyOneUnitOnCurrentStaveAndAndDoesNotContainMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnCurrentStave = doesMeasureContainOnlyOneUnitOnSpecifiedStaveAndNoMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave(measureParams, staveIndex)
          for (let voiceIndex = 0; voiceIndex < measureParams.stavesParams[staveIndex].voicesParams.length; voiceIndex++) {
            for (let singleUnitIndex = 0; singleUnitIndex < measureParams.stavesParams[staveIndex].voicesParams[voiceIndex].length; singleUnitIndex++) {
              const currentUnitParams = measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex]
              currentUnitParams.isOnlyUnitOnStaveWithoutMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnThatStave = measureContainsOnlyOneUnitOnCurrentStaveAndAndDoesNotContainMidMeasureElementsOrLyricsOrChordLettersOrSimilesOnCurrentStave
              if (!currentUnitParams.notes || currentUnitParams.notes.length === 0) {
                const prevSingleUnitParams = measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex - 1]
                if (prevSingleUnitParams && !measuresParams[measureIndex].stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1]) {
                  if (
                    measuresParams[measureIndex].isLastMeasureOnPageLine ||
                    measureIndex === measuresParams.length - 1
                  ) {
                    prevSingleUnitParams.isLastSingleUnitInVoiceOnPageLine = true
                  } else {
                    for (let measureIndexAfter = measureIndex + 1; measureIndexAfter < measuresParams.length; measureIndexAfter++) {
                      if (
                        !measuresParams[measureIndexAfter] ||
                        !measuresParams[measureIndexAfter].stavesParams ||
                        measuresParams[measureIndexAfter].stavesParams.length === 0 ||
                        !measuresParams[measureIndexAfter].stavesParams[staveIndex] ||
                        !measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams ||
                        !measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams[voiceIndex] ||
                        measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams[voiceIndex].length === 0
                      ) {
                        prevSingleUnitParams.isLastSingleUnitInVoiceOnPageLine = true
                      } else {
                        prevSingleUnitParams.isLastSingleUnitInVoiceOnPageLine = false
                        break
                      }
                      if (
                        measuresParams[measureIndexAfter].isLastMeasureOnPageLine ||
                        measureIndexAfter === measuresParams.length - 1
                      ) {
                        break
                      }
                    }
                  }
                }
                measureParams.stavesParams[staveIndex].voicesParams[voiceIndex].splice(singleUnitIndex, 1)
                singleUnitIndex--
                continue
              }
              const nextUnitParamsInTheSameStaveAndVoice = measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1]
              if (currentUnitParams.isGrace && nextUnitParamsInTheSameStaveAndVoice && !nextUnitParamsInTheSameStaveAndVoice.isGrace) {
                currentUnitParams.isGraceUnitAndNextUnitIsNotGrace = true
              }
              currentUnitParams.notes = removeDuplicateNotes(currentUnitParams.notes)
              if (!currentUnitParams.unitDuration) {
                currentUnitParams.unitDuration = 1 / 4
              }
              if (currentUnitParams.tremoloParams) {
                if (currentUnitParams.tremoloParams.type === 'withNext') {
                  if (
                    measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1] &&
                    (currentUnitParams.unitDuration === measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1].unitDuration)
                  ) {
                    measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1].tremoloParams = Object.assign({}, currentUnitParams.tremoloParams)
                    measureParams.stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1].tremoloParams.type = 'withPrevious'
                  } else if (
                    !measuresParams[measureIndex].stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1] &&
                    measuresParams[measureIndex + 1] &&
                    measuresParams[measureIndex + 1].stavesParams &&
                    measuresParams[measureIndex + 1].stavesParams[staveIndex] &&
                    measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams &&
                    measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex] &&
                    measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex][0] &&
                    (currentUnitParams.unitDuration === measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex][0].unitDuration)
                  ) {
                    measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex][0].tremoloParams = Object.assign({}, currentUnitParams.tremoloParams)
                    measuresParams[measureIndex + 1].stavesParams[staveIndex].voicesParams[voiceIndex][0].tremoloParams.type = 'withPrevious'
                  } else {
                    currentUnitParams.tremoloParams.type = 'single'
                  }
                }
                currentUnitParams.tremoloParams.tremoloDurationFactor = calculateTremoloDurationFactor(
                  currentUnitParams.tremoloParams
                )
              }
              let actualUnitDurationIfItHasDotsOrTupletMarksOrTremolosAndEvenIfItDoesNotButStillAffectedByThoseThingsItDoesNotMatterAsWeNeedThisValueJustToDetermineMinUnitDurationOnPageLineSoItIsEnoughToHaveSomeOfSuchDurations = calculateActualDurationConsideringDotsAndTupletsAndTremolos(
                currentUnitParams.unitDuration,
                currentUnitParams.numberOfDots || 0,
                currentUnitParams.tupletMarks
                  ? currentUnitParams.tupletMarks.filter(tupletMark => tupletMark.value).map(
                    tupletMark => tupletMark.value
                  )
                  : [],
                currentUnitParams.tremoloParams
                  ? currentUnitParams.tremoloParams.tremoloDurationFactor
                  : 1
              )
              if (
                (actualUnitDurationIfItHasDotsOrTupletMarksOrTremolosAndEvenIfItDoesNotButStillAffectedByThoseThingsItDoesNotMatterAsWeNeedThisValueJustToDetermineMinUnitDurationOnPageLineSoItIsEnoughToHaveSomeOfSuchDurations < minUnitDurationOnPageLine) &&
                !currentUnitParams.isGrace
              ) {
                minUnitDurationOnPageLine = actualUnitDurationIfItHasDotsOrTupletMarksOrTremolosAndEvenIfItDoesNotButStillAffectedByThoseThingsItDoesNotMatterAsWeNeedThisValueJustToDetermineMinUnitDurationOnPageLineSoItIsEnoughToHaveSomeOfSuchDurations
              }
              if (!currentUnitParams.stemDirection) {
                currentUnitParams.stemDirection = 'up'
              }
              const notesOnPrevStave = currentUnitParams.notes ? currentUnitParams.notes.filter(note => note.stave === 'prev') : []
              const keysOnPrevStave = currentUnitParams.keysParams ? currentUnitParams.keysParams.filter(key => key.stave === 'prev') : []
              const notesOnNextStave = currentUnitParams.notes ? currentUnitParams.notes.filter(note => note.stave === 'next') : []
              const keysOnNextStave = currentUnitParams.keysParams ? currentUnitParams.keysParams.filter(key => key.stave === 'next') : []
              if (currentUnitParams.notes) {
                currentUnitParams.notes.forEach(note => {
                  if (!note.stave) {
                    note.stave = 'current'
                  }
                })
                if (currentUnitParams.keysParams) {
                  currentUnitParams.keysParams.forEach(key => {
                    if (!key.stave) {
                      key.stave = 'current'
                    }
                  })
                }
              }
              if (staveIndex === 0) {
                notesOnPrevStave.forEach(note => {
                  note.stave = 'current'
                })
                keysOnPrevStave.forEach(key => {
                  key.stave = 'current'
                })
              }
              if (staveIndex === measureParams.stavesParams.length - 1) {
                notesOnNextStave.forEach(note => {
                  note.stave = 'current'
                })
                keysOnNextStave.forEach(key => {
                  key.stave = 'current'
                })
              }
              if (currentUnitParams.notes) {
                for (let noteIndex = 0; noteIndex < currentUnitParams.notes.length; noteIndex++) {
                  currentUnitParams.notes[noteIndex].unitDuration = currentUnitParams.unitDuration
                  currentUnitParams.notes[noteIndex].stemDirection = currentUnitParams.stemDirection
                  if (currentUnitParams.isRest) {
                    currentUnitParams.notes[noteIndex].isRest = true
                  } else if (currentUnitParams.isSimile) {
                    currentUnitParams.notes[noteIndex].isSimile = true
                  }
                  if (currentUnitParams.isGrace) {
                    currentUnitParams.notes[noteIndex].isGrace = true
                  }
                }
              }
              if (currentUnitParams.isGrace) {
                if (currentUnitParams.keysParams) {
                  for (let keyIndex = 0; keyIndex < currentUnitParams.keysParams.length; keyIndex++) {
                    currentUnitParams.keysParams[keyIndex].isGrace = true
                  }
                }
                if (currentUnitParams.articulationParams) {
                  for (let articulationIndex = 0; articulationIndex < currentUnitParams.articulationParams.length; articulationIndex++) {
                    currentUnitParams.articulationParams[articulationIndex].isGrace = true
                  }
                }
              }
              if (currentUnitParams.isFullMeasure) {
                currentUnitParams.isFullMeasureAndShouldBeCentralizedBecauseOfThat = measureDoesNotContainCrossStaveUnits &&
                  (measureParams.stavesParams[staveIndex].voicesParams[voiceIndex].length === 1)
                if (currentUnitParams.isFullMeasureAndShouldBeCentralizedBecauseOfThat) {
                  measureParams.containsFullMeasureUnitsThatShouldBeCentralized = true
                }
              }
              if (!measuresParams[measureIndex].stavesParams[staveIndex].voicesParams[voiceIndex][singleUnitIndex + 1]) {
                if (
                  measuresParams[measureIndex].isLastMeasureOnPageLine ||
                  measureIndex === measuresParams.length - 1
                ) {
                  currentUnitParams.isLastSingleUnitInVoiceOnPageLine = true
                } else {
                  for (let measureIndexAfter = measureIndex + 1; measureIndexAfter < measuresParams.length; measureIndexAfter++) {
                    if (
                      !measuresParams[measureIndexAfter] ||
                      !measuresParams[measureIndexAfter].stavesParams ||
                      measuresParams[measureIndexAfter].stavesParams.length === 0 ||
                      !measuresParams[measureIndexAfter].stavesParams[staveIndex] ||
                      !measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams ||
                      !measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams[voiceIndex] ||
                      measuresParams[measureIndexAfter].stavesParams[staveIndex].voicesParams[voiceIndex].length === 0
                    ) {
                      currentUnitParams.isLastSingleUnitInVoiceOnPageLine = true
                    } else {
                      currentUnitParams.isLastSingleUnitInVoiceOnPageLine = false
                      break
                    }
                    if (
                      measuresParams[measureIndexAfter].isLastMeasureOnPageLine ||
                      measureIndexAfter === measuresParams.length - 1
                    ) {
                      break
                    }
                  }
                }
              }
              if (currentUnitParams.isLastSingleUnitInVoiceOnPageLine && currentUnitParams.beamedWithNext) {
                currentUnitParams.beamedWithNext = false
              }
              if (!currentMeasureContainsBreakingConnectionsThatStartBefore) {
                currentMeasureContainsBreakingConnectionsThatStartBefore = doSingleUnitParamsContainBrokenConnectionsThatStartBefore(currentUnitParams)
              }
              if (!currentMeasureContainsBreakingConnectionsThatFinishAfter) {
                currentMeasureContainsBreakingConnectionsThatFinishAfter = doSingleUnitParamsContainBrokenConnectionsThatFinishAfter(currentUnitParams)
              }
              pushMeasureIndexesThatSomeBrokenConnectionsStartBeforeOrFinishAfter(currentUnitParams, measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore, measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter)
            }
          }
        }
      }
      informationAboutBrokenConnectionsInMeasures[pageLineNumber][measureIndexOnPageLine] = { currentMeasureContainsBreakingConnectionsThatStartBefore, currentMeasureContainsBreakingConnectionsThatFinishAfter }
      if (isLastMeasureOnPageLine) {
        for (let index = 0; index < measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.length; index++) {
          if (informationAboutBrokenConnectionsInMeasures[pageLineNumber][measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore[index]]) {
            informationAboutBrokenConnectionsInMeasures[pageLineNumber][measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore[index]].currentMeasureContainsBreakingConnectionsThatStartBefore = true
          }
        }
        for (let index = 0; index < measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.length; index++) {
          if (informationAboutBrokenConnectionsInMeasures[pageLineNumber][measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter[index]]) {
            informationAboutBrokenConnectionsInMeasures[pageLineNumber][measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter[index]].currentMeasureContainsBreakingConnectionsThatFinishAfter = true
          }
        }
        for (let innerMeasureIndex = lastIndexOfMeasureThatIsNextToTheLastOnPageLine; innerMeasureIndex < measureIndex; innerMeasureIndex++) {
          measuresParams[innerMeasureIndex].maxNumberOfStavesInThisAndNextMeasures = Math.max(measuresParams[innerMeasureIndex].stavesParams.length, measuresParams[innerMeasureIndex + 1].stavesParams.length)
        }
        measuresParams[measureIndex].maxNumberOfStavesInThisAndNextMeasures = measureParams.stavesParams.length
        for (let innerMeasureIndex = 0; innerMeasureIndex < measuresParamsOnPageLine.length; innerMeasureIndex++) {
          measuresParamsOnPageLine[innerMeasureIndex].minUnitDurationOnPageLine = minUnitDurationOnPageLine
        }
        minUnitDurationOnPageLine = 4
        numberOfStavesToAdjustForDifferentCrossStaveElements = 0
        lastIndexOfMeasureThatIsNextToTheLastOnPageLine = measureIndex + 1
        measuresParamsOnPageLine.splice(0)
        measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatStartBefore.splice(0)
        measuresThatAlsoShouldReserveSpaceForBrokenConnectionsThatFinishAfter.splice(0)
        measureIndexOnPageLine = undefined
        pageLineNumber += 1
      }
    }
  )
  return informationAboutBrokenConnectionsInMeasures
}
