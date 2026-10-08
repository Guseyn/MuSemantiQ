'use strict'

import drawVoicesOnMultipleStaves from '#msq/drawer/elements/the-page/voices/drawVoicesOnMultipleStaves.js'
import calculateSpaceAtEndOfVoicesByByMinUnitDurationOnPageLineAndMinDurationAmongAccumulatorsForEachVoiceInLastCrossStaveUnitConsideringCasesWhenItIsGraceCrossStaveUnit from '#msq/drawer/elements/layout-and-styles/unit-spacing/calculateSpaceAtEndOfVoicesByByMinUnitDurationOnPageLineAndMinDurationAmongAccumulatorsForEachVoiceInLastCrossStaveUnitConsideringCasesWhenItIsGraceCrossStaveUnit.js'
import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import prepareSpaceForLyricsWordsSoTheyDontCollideByMovingCrossStaveElements from '#msq/drawer/elements/marks-on-units/lyrics/prepareSpaceForLyricsWordsSoTheyDontCollideByMovingCrossStaveElements.js'
import prepareSpaceForChordLettersSoTheyDontCollideByMovingCrossStaveElements from '#msq/drawer/elements/marks-on-units/chord-letters/prepareSpaceForChordLettersSoTheyDontCollideByMovingCrossStaveElements.js'
import centralizeSingleUnitsInVoices from '#msq/drawer/elements/marks-on-units/centralized-units/centralizeSingleUnitsInVoices.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function ({
  pageLineNumber,
  measureIndexInGeneral,
  measureIndexOnPageLine,
  numberOfStaveLines,
  compressUnitsByNTimes,
  stretchUnitsByNTimes,
  containsAtLeastOneVoiceWithMoreThanOneUnit,
  containsFullMeasureUnitsThatShouldBeCentralized,
  prevMeasureContainsFermataOverBarline,
  stavesPieceWidthOfLastMeasureToCompletePageLine,
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
  lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem,
  chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem
}) {
  return (styles, leftOffset, topOffset) => {
    const { emptyMeasureWidth } = styles
    const numberOfStaves = voicesParamsForAllStaves.length
    const voices = drawVoicesOnMultipleStaves({ pageLineNumber, measureIndexInGeneral, measureIndexOnPageLine, numberOfStaveLines, compressUnitsByNTimes, stretchUnitsByNTimes, containsFullMeasureUnitsThatShouldBeCentralized, voicesParamsForAllStaves, isOnLastMeasureOfPageLine, isOnLastMeasureInGeneral, minUnitDurationOnPageLine, durationsAccumulatorsForEachVoice, similesInformationByStaveAndVoiceIndexes, clefNamesAuraByStaveIndexes, beamingStatusesForEachVoiceOnPageLine, affectingTupletValuesByStaveAndVoiceIndexes, currentMeasureContainsBreakingConnectionsThatStartBefore, currentMeasureContainsBreakingConnectionsThatFinishAfter, prevMeasureContainsFermataOverBarline })(styles, leftOffset, topOffset)
    prepareSpaceForLyricsWordsSoTheyDontCollideByMovingCrossStaveElements(
      lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem,
      voices,
      styles
    )
    prepareSpaceForChordLettersSoTheyDontCollideByMovingCrossStaveElements(
      chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem,
      voices,
      styles
    )
    let stavesPieceWidth
    if (voices.voicesBody.isEmpty) {
      stavesPieceWidth = Math.max(stavesPieceWidthOfLastMeasureToCompletePageLine, emptyMeasureWidth)
    } else {
      stavesPieceWidth = Math.max(stavesPieceWidthOfLastMeasureToCompletePageLine, voices.right - leftOffset +
        calculateSpaceAtEndOfVoicesByByMinUnitDurationOnPageLineAndMinDurationAmongAccumulatorsForEachVoiceInLastCrossStaveUnitConsideringCasesWhenItIsGraceCrossStaveUnit(voices.minDurationAmongAccumulatorsForEachVoiceInLastCrossStaveUnitConsideringCasesWhenItIsGraceCrossStaveUnit, minUnitDurationOnPageLine, compressUnitsByNTimes, stretchUnitsByNTimes, styles))
      if (stavesPieceWidth < emptyMeasureWidth) {
        stavesPieceWidth = emptyMeasureWidth
      }
    }
    const refParams = {
      pageLineNumber,
      measureIndexInGeneral,
      measureIndexOnPageLine
    }
    const stavesPiece = drawStavesPiece(numberOfStaves, numberOfStaveLines, stavesPieceWidth, numberOfStaves, refParams)(styles, leftOffset, topOffset)
    if (containsFullMeasureUnitsThatShouldBeCentralized) {
      centralizeSingleUnitsInVoices(voices, stavesPiece, containsAtLeastOneVoiceWithMoreThanOneUnit)
    }
    voices.right = Math.max(voices.right, stavesPiece.right)
    voices.left = Math.min(voices.left, stavesPiece.left)
    voices.voicesBody.right = Math.max(voices.voicesBody.right, stavesPiece.right)
    voices.voicesBody.left = Math.min(voices.voicesBody.left, stavesPiece.left)
    return createElementWithAdditionalInformation(
      createGroup(
        'voicesWithStaveLines',
        [
          stavesPiece,
          voices
        ]
      ),
      {
        stavesPiece,
        voices
      }
    )
  }
}
