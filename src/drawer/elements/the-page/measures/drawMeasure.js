'use strict'

import drawClefsOnStaves from '#msq/drawer/elements/the-page/clefs/drawClefsOnStaves.js'
import drawKeySignaturesOnStaves from '#msq/drawer/elements/the-page/key-signatures/drawKeySignaturesOnStaves.js'
import drawTimeSignaturesOnStaves from '#msq/drawer/elements/the-page/time-signatures/drawTimeSignaturesOnStaves.js'
import drawVoicesOnMultipleStavesWithStavesPiece from '#msq/drawer/elements/the-page/voices/drawVoicesOnMultipleStavesWithStavesPiece.js'
import drawMultiMeasureRest from '#msq/drawer/elements/the-page/measures/drawMultiMeasureRest.js'
import drawSimilePreviousMeasure from '#msq/drawer/elements/measure-furniture/similes/drawSimilePreviousMeasure.js'
import drawSimileTwoPreviousMeasure from '#msq/drawer/elements/measure-furniture/similes/drawSimileTwoPreviousMeasure.js'
import drawBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawBarLine.js'
import drawBoldDoubleBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawBoldDoubleBarLine.js'
import drawDottedBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawDottedBarLine.js'
import drawDoubleBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawDoubleBarLine.js'
import drawStartBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawStartBarLine.js'
import drawStartBoldDoubleBarLine from '#msq/drawer/elements/measure-furniture/barlines/drawStartBoldDoubleBarLine.js'
import drawMeasureNumber from '#msq/drawer/elements/measure-furniture/measure-numbers/drawMeasureNumber.js'
import drawRepeatDots from '#msq/drawer/elements/measure-furniture/repeat-signs/drawRepeatDots.js'
import drawCombinedConnections from '#msq/drawer/elements/measure-furniture/cross-stave-connections/drawCombinedConnections.js'
import drawCombinedInstrumentTitles from '#msq/drawer/elements/measure-furniture/instrument-titles/drawCombinedInstrumentTitles.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

const barLines = {
  barLine: drawBarLine,
  boldDoubleBarLine: drawBoldDoubleBarLine,
  dottedBarLine: drawDottedBarLine,
  doubleBarLine: drawDoubleBarLine,
  startBarLine: drawStartBarLine,
  startBoldDoubleBarLine: drawStartBoldDoubleBarLine
}

const KEY_SIGNATURE_WITHOUT_KEYS = 'c major|a minor'

export default function ({
  pageLineNumber,
  pageLineMaxWidth,
  measureIndexOnPageLine,
  measureIndexInGeneral,
  maxNumberOfStavesInThisAndNextMeasures,
  numberOfStaveLines,
  connectionsParams,
  instrumentTitlesParams,
  withoutStartBarLine,
  keySignatureName,
  keySignatureNameForEachLineId,
  timeSignatureParams,
  stavesParams,
  openingBarLineName,
  closingBarLineName,
  repeatDotsMarkAtTheStart,
  repeatDotsMarkAtTheEnd,
  containsAtLeastOneVoiceWithMoreThanOneUnit,
  containsFullMeasureUnitsThatShouldBeCentralized,
  isFirstMeasureOnPageLine,
  isLastMeasureOnPageLine,
  isLastMeasureInGeneral,
  currentPageLineWidth,
  showMeasureNumber,
  directionOfMeasureNumber,
  lyricsUnderStaveIndex,
  compressUnitsByNTimes,
  stretchUnitsByNTimes,
  isHidden,
  minUnitDurationOnPageLine,
  durationsAccumulatorsForEachVoice,
  similesInformationByStaveAndVoiceIndexes,
  clefNamesAuraByStaveIndexes,
  beamingStatusesForEachVoiceOnPageLine,
  affectingTupletValuesByStaveAndVoiceIndexes,
  currentMeasureContainsBreakingConnectionsThatStartBefore,
  currentMeasureContainsBreakingConnectionsThatFinishAfter,
  measureContainsFermataOverBarline,
  prevMeasureContainsFermataOverBarline,
  voltaMark,
  repetitionNote,
  coda,
  sign,
  tempoMark,
  isMeasureRest,
  multiMeasureRestCount,
  similePreviousMeasureCount,
  simileTwoPreviousMeasuresCount,
  previousMeasure,
  measureBeforePreviousMeasure,
  simileYCorrection,
  lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem,
  chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem
}) {
  return (styles, leftOffset, topOffset) => {
    const measureStartXPosition = leftOffset
    let nextLeftOffset = leftOffset
    const numberOfStaves = stavesParams.length
    const components = []
    let finishBarline
    let finishRepeatDots
    let stavesPieceWidthOfLastMeasureToCompletePageLine = 0
    let pageLineInGreaterThanItShouldBe = false
    let positionThatCanBeConsideredAsStartOfStaves
    let voicesOnMultipleStavesWithStavesPiece
    const noSpaceNeededForBarLine = !currentMeasureContainsBreakingConnectionsThatFinishAfter && (repeatDotsMarkAtTheEnd || isMeasureRest !== undefined || similePreviousMeasureCount !== undefined)
    if (instrumentTitlesParams && instrumentTitlesParams.length !== 0) {
      const instrumentTitles = drawCombinedInstrumentTitles(instrumentTitlesParams, numberOfStaveLines, isFirstMeasureOnPageLine, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
      if (!instrumentTitles.isEmpty) {
        components.push(instrumentTitles)
        nextLeftOffset = instrumentTitles.right + styles.distanceBetweenInstrumentTitleAndConnectionLine
      }
    }
    if (connectionsParams && connectionsParams.length !== 0) {
      const connections = drawCombinedConnections(connectionsParams, numberOfStaves, numberOfStaveLines, isFirstMeasureOnPageLine, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
      components.push(connections)
      nextLeftOffset = connections.right
    }
    if (((isFirstMeasureOnPageLine && !withoutStartBarLine) || openingBarLineName) && numberOfStaves !== 0) {
      if (isFirstMeasureOnPageLine && !openingBarLineName) {
        openingBarLineName = 'startBarLine'
      }
      const openingBarLineFunction = barLines[openingBarLineName]
      if (openingBarLineFunction && !((openingBarLineName === 'startBarLine') && (measureIndexOnPageLine > 0))) {
        let startBarLineNegativeOffset = 0
        if (measureIndexOnPageLine > 0) {
          startBarLineNegativeOffset = -styles.boldBarLineWidth
        }
        const startBarLine = barLines[openingBarLineName](numberOfStaves, numberOfStaveLines)(styles, nextLeftOffset + startBarLineNegativeOffset, topOffset)
        addPropertiesToElement(
          startBarLine,
          {
            'ref-ids': `opening-barline-${measureIndexInGeneral + 1}`
          }
        )
        components.push(startBarLine)
        nextLeftOffset = startBarLine.right
        positionThatCanBeConsideredAsStartOfStaves = startBarLine.left
      }
    }
    if (repeatDotsMarkAtTheStart) {
      const repeatDots = drawRepeatDots(numberOfStaves, numberOfStaveLines)(styles, nextLeftOffset, topOffset)
      addPropertiesToElement(
        repeatDots,
        {
          'ref-ids': `repeat-sign-${measureIndexInGeneral + 1},repeat-sign-at-the-start-${measureIndexInGeneral + 1}`
        }
      )
      components.push(repeatDots)
      nextLeftOffset = repeatDots.right
      if (positionThatCanBeConsideredAsStartOfStaves === undefined) {
        positionThatCanBeConsideredAsStartOfStaves = repeatDots.left
      }
    }
    if (showMeasureNumber) {
      const measureNumber = drawMeasureNumber(measureIndexInGeneral, directionOfMeasureNumber, numberOfStaves, numberOfStaveLines)(styles, nextLeftOffset, topOffset)
      components.push(measureNumber)
      nextLeftOffset = measureNumber.right
    }
    const clefsNames = []
    const voicesParamsForAllStaves = []
    stavesParams.forEach((staveParams, staveIndex) => {
      clefNamesAuraByStaveIndexes[staveIndex] = clefNamesAuraByStaveIndexes[staveIndex] || 'treble'
      if (staveParams.clef) {
        clefsNames[staveIndex] = staveParams.clef
        clefNamesAuraByStaveIndexes[staveIndex] = staveParams.clef
      } else if (keySignatureName) {
        clefsNames[staveIndex] = clefNamesAuraByStaveIndexes[staveIndex]
      }
      voicesParamsForAllStaves.push(staveParams.voicesParams || [])
    })
    if (clefsNames.length !== 0) {
      const clefsOnStaves = drawClefsOnStaves(numberOfStaves, numberOfStaveLines, clefsNames, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
      components.push(clefsOnStaves)
      nextLeftOffset = clefsOnStaves.right
      if (positionThatCanBeConsideredAsStartOfStaves === undefined) {
        positionThatCanBeConsideredAsStartOfStaves = clefsOnStaves.left
      }
      const keySignaturesOnStaves = drawKeySignaturesOnStaves(numberOfStaveLines, clefsNames, keySignatureName, keySignatureNameForEachLineId, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
      components.push(keySignaturesOnStaves)
      nextLeftOffset = keySignaturesOnStaves.right
      if (positionThatCanBeConsideredAsStartOfStaves === undefined) {
        positionThatCanBeConsideredAsStartOfStaves = keySignaturesOnStaves.left
      }
    }
    if (timeSignatureParams && timeSignatureParams.numerator && timeSignatureParams.denominator) {
      const isClefBefore = clefsNames.length !== 0
      const isKeySignatureBefore = keySignatureName !== undefined && keySignatureName !== KEY_SIGNATURE_WITHOUT_KEYS
      const timeSignaturesOnStaves = drawTimeSignaturesOnStaves(numberOfStaves, numberOfStaveLines, timeSignatureParams.numerator, timeSignatureParams.denominator, timeSignatureParams.cMode, isClefBefore, isKeySignatureBefore, isFirstMeasureOnPageLine, measureIndexInGeneral, timeSignatureParams.forEachLineId)(styles, nextLeftOffset, topOffset)
      components.push(timeSignaturesOnStaves)
      nextLeftOffset = timeSignaturesOnStaves.right
      if (positionThatCanBeConsideredAsStartOfStaves === undefined) {
        positionThatCanBeConsideredAsStartOfStaves = timeSignaturesOnStaves.left
      }
    }
    if (!isLastMeasureOnPageLine) {
      if (isMeasureRest !== undefined) {
        const multiMeasureRest = drawMultiMeasureRest(numberOfStaves, numberOfStaveLines, multiMeasureRestCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
        components.push(multiMeasureRest)
        nextLeftOffset = multiMeasureRest.right
      } else if (similePreviousMeasureCount !== undefined) {
        const similePreviousMeasure = drawSimilePreviousMeasure(numberOfStaves, numberOfStaveLines, simileYCorrection || 0, similePreviousMeasureCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral, previousMeasure)(styles, nextLeftOffset, topOffset)
        components.push(similePreviousMeasure)
        nextLeftOffset = similePreviousMeasure.right
      } else if (simileTwoPreviousMeasuresCount !== undefined) {
        const simileTwoPreviousMeasure = drawSimileTwoPreviousMeasure(numberOfStaves, numberOfStaveLines, simileYCorrection || 0, simileTwoPreviousMeasuresCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral, previousMeasure, measureBeforePreviousMeasure)(styles, nextLeftOffset, topOffset)
        components.push(simileTwoPreviousMeasure)
        nextLeftOffset = simileTwoPreviousMeasure.right
      } else if (voicesParamsForAllStaves.length !== 0) {
        voicesOnMultipleStavesWithStavesPiece = drawVoicesOnMultipleStavesWithStavesPiece({ pageLineNumber, measureIndexInGeneral, measureIndexOnPageLine, numberOfStaveLines, noSpaceNeededForBarLine, compressUnitsByNTimes, stretchUnitsByNTimes, containsAtLeastOneVoiceWithMoreThanOneUnit, containsFullMeasureUnitsThatShouldBeCentralized, stavesPieceWidthOfLastMeasureToCompletePageLine, voicesParamsForAllStaves, isOnLastMeasureOfPageLine: isLastMeasureOnPageLine, isOnLastMeasureInGeneral: isLastMeasureInGeneral, minUnitDurationOnPageLine, durationsAccumulatorsForEachVoice, similesInformationByStaveAndVoiceIndexes, clefNamesAuraByStaveIndexes, beamingStatusesForEachVoiceOnPageLine, affectingTupletValuesByStaveAndVoiceIndexes, currentMeasureContainsBreakingConnectionsThatStartBefore, currentMeasureContainsBreakingConnectionsThatFinishAfter, prevMeasureContainsFermataOverBarline, lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem, chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem })(styles, nextLeftOffset, topOffset)
        components.push(voicesOnMultipleStavesWithStavesPiece)
        nextLeftOffset = voicesOnMultipleStavesWithStavesPiece.right
      }
      if (repeatDotsMarkAtTheEnd) {
        finishRepeatDots = drawRepeatDots(numberOfStaves, numberOfStaveLines)(styles, nextLeftOffset, topOffset)
        addPropertiesToElement(
          finishRepeatDots,
          {
            'ref-ids': `repeat-sign-${measureIndexInGeneral + 1},repeat-sign-at-the-end-${measureIndexInGeneral + 1}`
          }
        )
        components.push(finishRepeatDots)
        nextLeftOffset = finishRepeatDots.right
      }
      if (barLines[closingBarLineName]) {
        finishBarline = barLines[closingBarLineName](numberOfStaves, maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, noSpaceNeededForBarLine)(styles, nextLeftOffset, topOffset)
        addPropertiesToElement(
          finishBarline,
          {
            'ref-ids': `closing-barline-${measureIndexInGeneral + 1}`
          }
        )
        components.push(
          finishBarline
        )
        nextLeftOffset = finishBarline.right
      }
      if (voicesOnMultipleStavesWithStavesPiece) {
        voicesOnMultipleStavesWithStavesPiece.stavesPiece.elements.forEach(stave => {
          if (positionThatCanBeConsideredAsStartOfStaves !== undefined) {
            stave.left = positionThatCanBeConsideredAsStartOfStaves
          }
          stave.right = nextLeftOffset
        })
      }
    }
    if (isLastMeasureOnPageLine) {
      let rightPositionOfElementsThatSupposedToBeAtTheEndOfLastMeasureOnPageLineButDrawnFirstForPrecisePageLineWidthMeasure = nextLeftOffset
      if (repeatDotsMarkAtTheEnd) {
        finishRepeatDots = drawRepeatDots(numberOfStaves, numberOfStaveLines)(styles, nextLeftOffset, topOffset)
        addPropertiesToElement(
          finishRepeatDots,
          {
            'ref-ids': `repeat-sign-${measureIndexInGeneral + 1},repeat-sign-at-the-end-${measureIndexInGeneral + 1}`
          }
        )
        components.push(finishRepeatDots)
        // here we don't update nextLeftOffset because we don't want to have empty space after repeat dots position is adjusted
      }
      if (barLines[closingBarLineName]) {
        finishBarline = barLines[closingBarLineName](numberOfStaves, maxNumberOfStavesInThisAndNextMeasures, numberOfStaveLines, noSpaceNeededForBarLine)(styles, nextLeftOffset, topOffset)
        addPropertiesToElement(
          finishBarline,
          {
            'ref-ids': `closing-barline-${measureIndexInGeneral + 1}`
          }
        )
        components.push(finishBarline)
        // here we don't update nextLeftOffset because we don't want to have empty space after finish bar line position is adjusted
      }
      const pageLineWidthBeforeLastMeasure = currentPageLineWidth +
        (nextLeftOffset - leftOffset) +
        (finishRepeatDots ? (finishRepeatDots.right - finishRepeatDots.left) : 0) +
        (finishBarline ? (finishBarline.right - finishBarline.left) : 0)
      stavesPieceWidthOfLastMeasureToCompletePageLine = Math.max(0, pageLineMaxWidth - pageLineWidthBeforeLastMeasure)
      if (isMeasureRest !== undefined) {
        const multiMeasureRest = drawMultiMeasureRest(numberOfStaves, numberOfStaveLines, multiMeasureRestCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral)(styles, nextLeftOffset, topOffset)
        components.push(multiMeasureRest)
        nextLeftOffset = multiMeasureRest.right
      } else if (similePreviousMeasureCount !== undefined) {
        const similePreviousMeasure = drawSimilePreviousMeasure(numberOfStaves, numberOfStaveLines, simileYCorrection || 0, similePreviousMeasureCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral, previousMeasure)(styles, nextLeftOffset, topOffset)
        components.push(similePreviousMeasure)
        nextLeftOffset = similePreviousMeasure.right
      } else if (simileTwoPreviousMeasuresCount !== undefined) {
        const simileTwoPreviousMeasure = drawSimileTwoPreviousMeasure(numberOfStaves, numberOfStaveLines, simileYCorrection || 0, simileTwoPreviousMeasuresCount, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral, previousMeasure, measureBeforePreviousMeasure)(styles, nextLeftOffset, topOffset)
        components.push(simileTwoPreviousMeasure)
        nextLeftOffset = simileTwoPreviousMeasure.right
      } else if (voicesParamsForAllStaves.length !== 0) {
        voicesOnMultipleStavesWithStavesPiece = drawVoicesOnMultipleStavesWithStavesPiece({ pageLineNumber, measureIndexInGeneral, measureIndexOnPageLine, numberOfStaveLines, noSpaceNeededForBarLine, compressUnitsByNTimes, stretchUnitsByNTimes, containsAtLeastOneVoiceWithMoreThanOneUnit, containsFullMeasureUnitsThatShouldBeCentralized, stavesPieceWidthOfLastMeasureToCompletePageLine, voicesParamsForAllStaves, isOnLastMeasureOfPageLine: isLastMeasureOnPageLine, isOnLastMeasureInGeneral: isLastMeasureInGeneral, minUnitDurationOnPageLine, durationsAccumulatorsForEachVoice, similesInformationByStaveAndVoiceIndexes, clefNamesAuraByStaveIndexes, beamingStatusesForEachVoiceOnPageLine, affectingTupletValuesByStaveAndVoiceIndexes, currentMeasureContainsBreakingConnectionsThatStartBefore, currentMeasureContainsBreakingConnectionsThatFinishAfter, prevMeasureContainsFermataOverBarline, lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem, chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem })(styles, nextLeftOffset, topOffset)
        components.push(voicesOnMultipleStavesWithStavesPiece)
        nextLeftOffset = voicesOnMultipleStavesWithStavesPiece.right
      }
      if (finishRepeatDots) {
        moveElement(
          finishRepeatDots,
          nextLeftOffset - rightPositionOfElementsThatSupposedToBeAtTheEndOfLastMeasureOnPageLineButDrawnFirstForPrecisePageLineWidthMeasure
        )
        nextLeftOffset = finishRepeatDots.right
      }
      if (finishBarline) {
        const xDistanceToMove = nextLeftOffset - rightPositionOfElementsThatSupposedToBeAtTheEndOfLastMeasureOnPageLineButDrawnFirstForPrecisePageLineWidthMeasure
        moveElement(
          finishBarline,
          xDistanceToMove
        )
        finishBarline.xCenter += xDistanceToMove
        nextLeftOffset = finishBarline.right
      }
      if (voicesOnMultipleStavesWithStavesPiece) {
        voicesOnMultipleStavesWithStavesPiece.stavesPiece.elements.forEach(stave => {
          if (positionThatCanBeConsideredAsStartOfStaves !== undefined) {
            stave.left = positionThatCanBeConsideredAsStartOfStaves
          }
          stave.right = nextLeftOffset
        })
      }
      const finalPageLineWidth = currentPageLineWidth + nextLeftOffset - leftOffset
      const epsilon = 0.001
      if (finalPageLineWidth > pageLineMaxWidth + epsilon) {
        pageLineInGreaterThanItShouldBe = true
      }
    }

    const measure = createGroup(
      'measure',
      components
    )
    addPropertiesToElement(
      measure,
      {
        'ref-ids': `measure-${measureIndexInGeneral + 1},measure-${pageLineNumber + 1}-${measureIndexOnPageLine + 1},line-${pageLineNumber + 1}`
      }
    )
    if (measureIndexInGeneral > 0) {
      addPropertiesToElement(
        measure,
        {
          'ref-ids': 'every-measure'
        }
      )
    }
    addPropertiesToElement(
      measure,
      {
        'ref-ids': 'every-measure-including-index-0'
      }
    )

    if (isFirstMeasureOnPageLine) {
      if (measureIndexInGeneral > 0) {
        addPropertiesToElement(
          measure,
          {
            'ref-ids': 'first-measure,first-or-last-measure'
          }
        )
      }
      addPropertiesToElement(
        measure,
        {
          'ref-ids': 'first-measure-including-index-0'
        }
      )
    }
    if (isLastMeasureOnPageLine) {
      addPropertiesToElement(
        measure,
        {
          'ref-ids': 'last-measure,first-or-last-measure'
        }
      )
    }
    if (isLastMeasureInGeneral) {
      addPropertiesToElement(
        measure,
        {
          'ref-ids': 'last-measure-on-page'
        }
      )
    }

    measure.left = leftOffset

    return createElementWithAdditionalInformation(
      measure,
      {
        pageLineNumber,
        finishBarline,
        prevMeasureContainsFermataOverBarline,
        measureContainsFermataOverBarline,
        numberOfStaveLines,
        numberOfStaves,
        measureIndexInGeneral,
        measureIndexOnPageLine,
        isFirstMeasureOnPageLine,
        isLastMeasureOnPageLine,
        isLastMeasureInGeneral,
        pageLineInGreaterThanItShouldBe,
        voicesOnMultipleStavesWithStavesPiece,
        voltaMark,
        repetitionNote,
        coda,
        sign,
        tempoMark,
        lyricsUnderStaveIndex,
        stavesLeft: voicesOnMultipleStavesWithStavesPiece ? voicesOnMultipleStavesWithStavesPiece.stavesPiece.left : null,
        stavesRight: voicesOnMultipleStavesWithStavesPiece ? voicesOnMultipleStavesWithStavesPiece.stavesPiece.right : null,
        measureStartXPosition,
        containsFullMeasureUnitsThatShouldBeCentralized,
        isHidden
      }
    )
  }
}
