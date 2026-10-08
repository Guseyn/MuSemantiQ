'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import isAnyCounterForEachVoiceLessThanItsMaxValue from '#msq/drawer/elements/the-page/voices/isAnyCounterForEachVoiceLessThanItsMaxValue.js'
import calculateMinDurationAmongAccumulatorsForEachVoice from '#msq/drawer/elements/the-page/voices/calculateMinDurationAmongAccumulatorsForEachVoice.js'
import releaseDurationsAccumulatorsForEachVoiceWithMinDurationAmongThem from '#msq/drawer/elements/the-page/voices/releaseDurationsAccumulatorsForEachVoiceWithMinDurationAmongThem.js'
import drawMidMeasureClefsForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/mid-measure-clefs/drawMidMeasureClefsForCurrentCrossStaveUnit.js'
import drawMidMeasureKeySignaturesForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/mid-measure-key-signatures/drawMidMeasureKeySignaturesForCurrentCrossStaveUnit.js'
import drawBreathMarkBeforeCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/breath-marks/drawBreathMarkBeforeCurrentCrossStaveUnit.js'
import drawArpeggiatedWavesForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/arpeggiated-chords/drawArpeggiatedWavesForCurrentCrossStaveUnit.js'
import drawKeysForCurrentCrossStaveUnit from '#msq/drawer/elements/notes-on-a-page/accidentals/drawKeysForCurrentCrossStaveUnit.js'
import drawSingleUnitsForCurrentCrossStaveUnit from '#msq/drawer/elements/the-page/voices/drawSingleUnitsForCurrentCrossStaveUnit.js'
import drawCrossVoiceUnitsOnAllStavesInCrossStaveUnit from '#msq/drawer/elements/the-page/voices/drawCrossVoiceUnitsOnAllStavesInCrossStaveUnit.js'
import moveVoicesBodyHorizontally from '#msq/drawer/elements/shared/moveVoicesBodyHorizontally.js'
import selectSingleUnitsParamsToBeIncludedInNextCrossStaveUnit from '#msq/drawer/elements/the-page/voices/selectSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.js'
import findChordLetterValueForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/chord-letters/findChordLetterValueForCurrentCrossStaveUnit.js'
import findLyricsValueForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/lyrics/findLyricsValueForCurrentCrossStaveUnit.js'
import calculateXCorrectionValueForCurrentCrossStaveUnit from '#msq/drawer/elements/marks-on-units/adjusting-units/calculateXCorrectionValueForCurrentCrossStaveUnit.js'
import adjustNotesPositionNumbersInSelectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnitByTheirNoteNamesAndOctaveNumbersAndClefNamesByStaveIndexIfNoteNamesArePresentedInNotes from '#msq/drawer/elements/notes-on-a-page/octaves/adjustNotesPositionNumbersInSelectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnitByTheirNoteNamesAndOctaveNumbersAndClefNamesByStaveIndexIfNoteNamesArePresentedInNotes.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import moveCrossStaveElementsThatAttachedToCrossStaveUnit from '#msq/drawer/elements/shared/moveCrossStaveElementsThatAttachedToCrossStaveUnit.js'

export default function ({
  pageLineNumber,
  measureIndexInGeneral,
  measureIndexOnPageLine,
  numberOfStaveLines,
  compressUnitsByNTimes,
  stretchUnitsByNTimes,
  containsFullMeasureUnitsThatShouldBeCentralized,
  voicesParamsForAllStaves,
  isOnLastMeasureOfPageLine,
  isOnLastMeasureInGeneral,
  minUnitDurationOnPageLine,
  durationsAccumulatorsForEachVoice,
  similesInformationByStaveAndVoiceIndexes,
  clefNamesAuraByStaveIndexes,
  beamingStatusesForEachVoiceOnPageLine,
  affectingTupletValuesByStaveAndVoiceIndexes,
  currentMeasureContainsBreakingConnectionsThatStartBefore,
  currentMeasureContainsBreakingConnectionsThatFinishAfter,
  prevMeasureContainsFermataOverBarline
}) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, intervalBetweenStaves, spaceForBreakingConnectionsThatStartBefore, additionalSpaceForBreakingConnectionsThatStartBeforeCrossStaveUnitWithCrossStaveElementsBefore, spaceForBarlineFermata, minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElements, minSpaceReservedAfterCrossStaveChordAndBeforeCrossStaveMidMeasureClefsAndBreathMarks, minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElementsForGraceCrossStaveUnit, minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWaves, minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWavesForGraceCrossStaveUnit } = styles
    const numberOfStaves = voicesParamsForAllStaves.length

    if (durationsAccumulatorsForEachVoice.length < numberOfStaves) {
      for (let staveIndex = durationsAccumulatorsForEachVoice.length; staveIndex < numberOfStaves; staveIndex++) {
        durationsAccumulatorsForEachVoice[staveIndex] = []
      }
    } else if (durationsAccumulatorsForEachVoice.length > numberOfStaves) {
      durationsAccumulatorsForEachVoice.splice(numberOfStaves)
    }
    const countersForEachVoice = new Array(numberOfStaves)
    let totalNumberOfVoices = 0
    const topOffsetsForEachStave = []
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      totalNumberOfVoices += voicesParamsForAllStaves[staveIndex].length
      if (durationsAccumulatorsForEachVoice[staveIndex].length < voicesParamsForAllStaves[staveIndex].length) {
        for (let voiceIndex = durationsAccumulatorsForEachVoice[staveIndex].length; voiceIndex < voicesParamsForAllStaves[staveIndex].length; voiceIndex++) {
          durationsAccumulatorsForEachVoice[staveIndex][voiceIndex] = 0
        }
      } else if (durationsAccumulatorsForEachVoice[staveIndex].length > voicesParamsForAllStaves[staveIndex].length) {
        durationsAccumulatorsForEachVoice[staveIndex].splice(voicesParamsForAllStaves[staveIndex].length)
      }
      countersForEachVoice[staveIndex] = new Array(voicesParamsForAllStaves[staveIndex].length).fill(0)
      topOffsetsForEachStave[staveIndex] = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
    }

    const singleUnitsInVoices = []
    const crossStaveUnits = []
    const keysForCrossStaveUnits = []
    const arpeggiatedWavesForCrossStaveUnits = []
    const midMeasureClefsForCrossStaveUnits = []
    const midMeasureKeySignaturesForCrossStaveUnits = []
    const breathMarksBeforeCrossStaveUnits = []
    const onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits = []
    const singleUnitsInAllCrossStaveUnits = []
    const numberOfUnfinishedVoices = { value: totalNumberOfVoices }
    const containsCollidedVoices = { value: false }
    const containsDrawnCrossStaveElementsBesideCrossStaveUnits = { value: false }
    const graceUnitsAccumulatorForEachStaveAndVoice = { value: undefined }
    const finishedVoices = {}

    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      for (let voiceIndex = 0; voiceIndex < voicesParamsForAllStaves[staveIndex].length; voiceIndex++) {
        if (voicesParamsForAllStaves[staveIndex][voiceIndex].length === 0) {
          numberOfUnfinishedVoices.value -= 1
          finishedVoices[`${staveIndex}-${voiceIndex}`] = true
        }
      }
    }

    let crossStaveUnitCount = 0
    let spaceForAllCrossStaveElementsForFirstCrossStaveUnit = 0
    while (isAnyCounterForEachVoiceLessThanItsMaxValue(countersForEachVoice, voicesParamsForAllStaves)) {
      const selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit = selectSingleUnitsParamsToBeIncludedInNextCrossStaveUnit(measureIndexInGeneral, voicesParamsForAllStaves, durationsAccumulatorsForEachVoice, countersForEachVoice, finishedVoices, numberOfUnfinishedVoices, graceUnitsAccumulatorForEachStaveAndVoice, similesInformationByStaveAndVoiceIndexes)
      const isCurrentCrossStaveUnitGrace = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[0] && selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[0].isGrace
      const allCrossStaveElementsForCurrentCrossStaveUnit = []
      const midMeasureClefsForCurrentCrossStaveUnit = drawMidMeasureClefsForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, numberOfStaves, clefNamesAuraByStaveIndexes, crossStaveUnits, minUnitDurationOnPageLine, compressUnitsByNTimes, stretchUnitsByNTimes, styles, leftOffset, topOffsetsForEachStave, containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      midMeasureClefsForCrossStaveUnits.push(midMeasureClefsForCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(midMeasureClefsForCurrentCrossStaveUnit)
      adjustNotesPositionNumbersInSelectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnitByTheirNoteNamesAndOctaveNumbersAndClefNamesByStaveIndexIfNoteNamesArePresentedInNotes(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, clefNamesAuraByStaveIndexes)
      const midMeasureKeySignaturesForCurrentCrossStaveUnit = drawMidMeasureKeySignaturesForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, midMeasureClefsForCrossStaveUnits, numberOfStaves, numberOfStaveLines, clefNamesAuraByStaveIndexes, styles, leftOffset, topOffsetsForEachStave, containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      midMeasureKeySignaturesForCrossStaveUnits.push(midMeasureKeySignaturesForCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(midMeasureKeySignaturesForCurrentCrossStaveUnit)
      const breathMarkBeforeCurrentCrossStaveUnit = drawBreathMarkBeforeCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, midMeasureClefsForCrossStaveUnits, midMeasureKeySignaturesForCrossStaveUnits, numberOfStaves, styles, leftOffset, topOffsetsForEachStave, containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      breathMarksBeforeCrossStaveUnits.push(breathMarkBeforeCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(breathMarkBeforeCurrentCrossStaveUnit)
      const onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit = drawKeysForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, measureIndexInGeneral, countersForEachVoice, numberOfStaveLines, arpeggiatedWavesForCrossStaveUnits, breathMarksBeforeCrossStaveUnits, styles, leftOffset, topOffsetsForEachStave, 'before', containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits.push(onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit)
      const arpeggiatedWavesForCurrentCrossStaveUnit = drawArpeggiatedWavesForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits, styles, leftOffset, topOffsetsForEachStave, numberOfStaveLines, containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      arpeggiatedWavesForCrossStaveUnits.push(arpeggiatedWavesForCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(arpeggiatedWavesForCurrentCrossStaveUnit)
      const keysForCurrentCrossStaveUnit = drawKeysForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, measureIndexInGeneral, countersForEachVoice, numberOfStaveLines, arpeggiatedWavesForCrossStaveUnits, breathMarksBeforeCrossStaveUnits, styles, leftOffset, topOffsetsForEachStave, 'after', containsDrawnCrossStaveElementsBesideCrossStaveUnits)
      keysForCrossStaveUnits.push(keysForCurrentCrossStaveUnit)
      allCrossStaveElementsForCurrentCrossStaveUnit.push(keysForCurrentCrossStaveUnit)
      const groupedAllCrossStaveElementsForCurrentCrossStaveUnit = createGroup(
        'allCrossStaveElementsForCurrentCrossStaveUnit',
        allCrossStaveElementsForCurrentCrossStaveUnit
      )
      const singleUnitsForCurrentCrossStaveUnit = drawSingleUnitsForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, numberOfStaves, numberOfStaveLines, pageLineNumber, measureIndexInGeneral, measureIndexOnPageLine, crossStaveUnitCount, keysForCrossStaveUnits, singleUnitsInVoices, beamingStatusesForEachVoiceOnPageLine, countersForEachVoice, durationsAccumulatorsForEachVoice, similesInformationByStaveAndVoiceIndexes, affectingTupletValuesByStaveAndVoiceIndexes, isOnLastMeasureOfPageLine, styles, topOffsetsForEachStave)
      const crossVoiceUnitsOnAllStavesInCrossStaveUnit = drawCrossVoiceUnitsOnAllStavesInCrossStaveUnit(singleUnitsForCurrentCrossStaveUnit, voicesParamsForAllStaves, containsCollidedVoices, keysForCurrentCrossStaveUnit, arpeggiatedWavesForCurrentCrossStaveUnit, isCurrentCrossStaveUnitGrace, topOffsetsForEachStave, numberOfStaveLines, styles)
      if (crossVoiceUnitsOnAllStavesInCrossStaveUnit.length !== 0) {
        const calculatedMinDurationAmongAccumulatorsForEachVoice = calculateMinDurationAmongAccumulatorsForEachVoice(durationsAccumulatorsForEachVoice)
        // const calculatedMinActualDurationAmongDrawnSingleUnitsInCrossStaveUnit = minActualDurationAmongDrawnSingleUnitsInCrossStaveUnit(drawnSingleUnitsForCurrentCrossStaveUnit)
        const currentCrossStaveUnit = createElementWithAdditionalInformation(
          createGroup(
            'crossStaveUnit',
            crossVoiceUnitsOnAllStavesInCrossStaveUnit
          ),
          {
            measureIndexOnPageLine,
            singleUnitsByStaveIndexes: singleUnitsForCurrentCrossStaveUnit,
            crossVoiceUnitsOnAllStavesInCrossStaveUnit: crossVoiceUnitsOnAllStavesInCrossStaveUnit,
            minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit: isCurrentCrossStaveUnitGrace ? 0 : calculatedMinDurationAmongAccumulatorsForEachVoice,
            chordLetter: findChordLetterValueForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit),
            lyrics: findLyricsValueForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit)
          }
        )
        if (!groupedAllCrossStaveElementsForCurrentCrossStaveUnit.isEmpty) {
          if (crossStaveUnits[crossStaveUnits.length - 1]) {
            let xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = 0
            const spaceForAllCrossStaveElementsForCurrentCrossStaveUnit = currentCrossStaveUnit.left - groupedAllCrossStaveElementsForCurrentCrossStaveUnit.left
            const spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit = groupedAllCrossStaveElementsForCurrentCrossStaveUnit.left - crossStaveUnits[crossStaveUnits.length - 1].rightPositionConsideringParenthesesAndDotsAndConsideringStavesThatContainNotesForNextCrossStaveUnit
            const spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
            if (!midMeasureClefsForCurrentCrossStaveUnit.isEmpty || !midMeasureKeySignaturesForCurrentCrossStaveUnit.isEmpty || !breathMarkBeforeCurrentCrossStaveUnit.isEmpty) {
              if (spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit > minSpaceReservedAfterCrossStaveChordAndBeforeCrossStaveMidMeasureClefsAndBreathMarks) {
                xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
              } else {
                xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - minSpaceReservedAfterCrossStaveChordAndBeforeCrossStaveMidMeasureClefsAndBreathMarks
              }
            } else if (!arpeggiatedWavesForCurrentCrossStaveUnit.isEmpty && onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit.isEmpty) {
              if (isCurrentCrossStaveUnitGrace) {
                if (spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit > minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWavesForGraceCrossStaveUnit) {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
                } else {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWavesForGraceCrossStaveUnit
                }
              } else {
                if (spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit > minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWaves) {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
                } else {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - minSpaceReservedAfterCrossStaveChordAndBeforeArpeggiatedWaves
                }
              }
            } else {
              if (isCurrentCrossStaveUnitGrace) {
                if (spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit > minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElementsForGraceCrossStaveUnit) {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
                } else {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElementsForGraceCrossStaveUnit
                }
              } else {
                if (spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnitThatWouldBeLeftIfWeMoveAllCrossStaveElementsAndCurrentCrossStaveUnit > minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElements) {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceForAllCrossStaveElementsForCurrentCrossStaveUnit
                } else {
                  xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits = spaceBetweenCrossStaveElementsForCurrentCrossStaveUnitAndPreviousCrossStaveUnit - minSpaceReservedAfterCrossStaveChordAndBeforeOtherCrossStaveElements
                }
              }
            }
            moveCrossStaveElementsThatAttachedToCrossStaveUnit(
              midMeasureClefsForCurrentCrossStaveUnit,
              midMeasureKeySignaturesForCurrentCrossStaveUnit,
              breathMarkBeforeCurrentCrossStaveUnit,
              onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit,
              arpeggiatedWavesForCurrentCrossStaveUnit,
              keysForCurrentCrossStaveUnit,
              currentCrossStaveUnit,
              -1 * xDistanceToMoveAllCrossStaveElementsForCurrentCrossStaveUnitToSaveSpaceBetweenCrossStaveUnits
            )
          } else {
            spaceForAllCrossStaveElementsForFirstCrossStaveUnit = groupedAllCrossStaveElementsForCurrentCrossStaveUnit.right - groupedAllCrossStaveElementsForCurrentCrossStaveUnit.left
          }
        }
        const xCorrectionValueForCurrentCrossStaveUnit = calculateXCorrectionValueForCurrentCrossStaveUnit(selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, intervalBetweenStaveLines)
        if (xCorrectionValueForCurrentCrossStaveUnit !== 0) {
          moveCrossStaveElementsThatAttachedToCrossStaveUnit(
            midMeasureClefsForCurrentCrossStaveUnit,
            midMeasureKeySignaturesForCurrentCrossStaveUnit,
            breathMarkBeforeCurrentCrossStaveUnit,
            onlyNoteLettersBeforeArpeggiatedWavesForCurrentCrossStaveUnit,
            arpeggiatedWavesForCurrentCrossStaveUnit,
            keysForCurrentCrossStaveUnit,
            currentCrossStaveUnit,
            xCorrectionValueForCurrentCrossStaveUnit
          )
        }
        crossStaveUnits.push(currentCrossStaveUnit)
        singleUnitsInAllCrossStaveUnits.push(singleUnitsForCurrentCrossStaveUnit)
        releaseDurationsAccumulatorsForEachVoiceWithMinDurationAmongThem(crossStaveUnitCount, isCurrentCrossStaveUnitGrace, measureIndexInGeneral, voicesParamsForAllStaves, durationsAccumulatorsForEachVoice, countersForEachVoice, calculatedMinDurationAmongAccumulatorsForEachVoice, finishedVoices, numberOfUnfinishedVoices)
      }
      crossStaveUnitCount++
    }

    const voicesBody = createElementWithAdditionalInformation(
      createGroup(
        'voicesBody',
        [
          ...midMeasureClefsForCrossStaveUnits,
          ...midMeasureKeySignaturesForCrossStaveUnits,
          ...breathMarksBeforeCrossStaveUnits,
          ...onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits,
          ...arpeggiatedWavesForCrossStaveUnits,
          ...keysForCrossStaveUnits,
          ...crossStaveUnits
        ]
      ),
      {
        measureIndexOnPageLine
      }
    )

    if (currentMeasureContainsBreakingConnectionsThatStartBefore) {
      let xDistanceToMove = spaceForAllCrossStaveElementsForFirstCrossStaveUnit || spaceForBreakingConnectionsThatStartBefore
      if (xDistanceToMove > spaceForBreakingConnectionsThatStartBefore) {
        xDistanceToMove = additionalSpaceForBreakingConnectionsThatStartBeforeCrossStaveUnitWithCrossStaveElementsBefore
      } else if (spaceForBreakingConnectionsThatStartBefore > xDistanceToMove) {
        xDistanceToMove = spaceForBreakingConnectionsThatStartBefore - xDistanceToMove + additionalSpaceForBreakingConnectionsThatStartBeforeCrossStaveUnitWithCrossStaveElementsBefore
      }
      moveVoicesBodyHorizontally(voicesBody, singleUnitsInVoices, xDistanceToMove, false)
    } else if (prevMeasureContainsFermataOverBarline) {
      moveVoicesBodyHorizontally(voicesBody, singleUnitsInVoices, spaceForBarlineFermata, false)
    }

    const voices = createElementWithAdditionalInformation(
      createGroup(
        'voices',
        [
          voicesBody
        ]
      ),
      {
        measureIndexOnPageLine,
        crossStaveUnits,
        singleUnitsInVoices,
        keysForCrossStaveUnits,
        arpeggiatedWavesForCrossStaveUnits,
        onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits,
        breathMarksBeforeCrossStaveUnits,
        midMeasureClefsForCrossStaveUnits,
        midMeasureKeySignaturesForCrossStaveUnits,
        spaceForBreakingConnectionsThatStartBefore,
        singleUnitsInAllCrossStaveUnits,
        topOffsetsForEachStave,
        numberOfStaveLines,
        voicesBody,
        isOnLastMeasureOfPageLine,
        isOnLastMeasureInGeneral,
        containsFullMeasureUnitsThatShouldBeCentralized,
        containsCollidedVoices: containsCollidedVoices.value,
        containsDrawnCrossStaveElementsBesideCrossStaveUnits: containsDrawnCrossStaveElementsBesideCrossStaveUnits.value,
        minDurationAmongAccumulatorsForEachVoiceInLastCrossStaveUnitConsideringCasesWhenItIsGraceCrossStaveUnit: crossStaveUnits[crossStaveUnits.length - 1] ? crossStaveUnits[crossStaveUnits.length - 1].minDurationAmongAccumulatorsForEachVoiceConsideringCasesWhenItIsGraceCrossStaveUnit : (1 / 8)
      }
    )

    return voices
  }
}
