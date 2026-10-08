'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveCrossStaveElementsThatAttachedToCrossStaveUnit from '#msq/drawer/elements/shared/moveCrossStaveElementsThatAttachedToCrossStaveUnit.js'

export default function (
  lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem,
  voices,
  styles
) {
  const { minXDistanceBetweenLyricsWords, minXDistanceBetweenLyricsWordsWithDashOrUnderscoreBetweenThem, lyricsFontOptions } = styles
  const {
    midMeasureClefsForCrossStaveUnits,
    midMeasureKeySignaturesForCrossStaveUnits,
    breathMarksBeforeCrossStaveUnits,
    onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits,
    arpeggiatedWavesForCrossStaveUnits,
    keysForCrossStaveUnits,
    crossStaveUnits
  } = voices
  for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < crossStaveUnits.length; crossStaveUnitIndex++) {
    const currentCrossStaveUnit = crossStaveUnits[crossStaveUnitIndex]
    const xCenterOfCurrentCrossStaveUnit = (currentCrossStaveUnit.left + currentCrossStaveUnit.right) / 2
    const relatedLyrics = currentCrossStaveUnit.lyrics
    const prevLyricsWordOnPageLine = lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem[lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem.length - 1]
    if (relatedLyrics) {
      let lyricsWithMaxWidth
      for (let lyricsIndex = 0; lyricsIndex < relatedLyrics.length; lyricsIndex++) {
        if (relatedLyrics[lyricsIndex].textValue) {
          const lyricsText = createText(relatedLyrics[lyricsIndex].textValue, lyricsFontOptions)(
            styles, xCenterOfCurrentCrossStaveUnit, 0
          )
          const lyricsTextWidth = lyricsText.right - lyricsText.left
          if ((lyricsWithMaxWidth === undefined) || (lyricsTextWidth > lyricsWithMaxWidth)) {
            lyricsWithMaxWidth = lyricsText
            if (relatedLyrics[lyricsIndex].dashAfter || relatedLyrics[lyricsIndex].underscoreStarts) {
              lyricsWithMaxWidth.dashAfterOrUnderscoreStarts = true
            }
          }
        }
      }
      if (lyricsWithMaxWidth) {
        if (prevLyricsWordOnPageLine) {
          if ((lyricsWithMaxWidth.left - prevLyricsWordOnPageLine.right) < minXDistanceBetweenLyricsWords) {
            const xDistanceToMove = prevLyricsWordOnPageLine.right - lyricsWithMaxWidth.left + (prevLyricsWordOnPageLine.dashAfterOrUnderscoreStarts ? minXDistanceBetweenLyricsWordsWithDashOrUnderscoreBetweenThem : minXDistanceBetweenLyricsWords)
            moveElement(lyricsWithMaxWidth, xDistanceToMove)
            for (let crossStaveUnitIndexAfter = crossStaveUnitIndex; crossStaveUnitIndexAfter < crossStaveUnits.length; crossStaveUnitIndexAfter++) {
              moveCrossStaveElementsThatAttachedToCrossStaveUnit(
                midMeasureClefsForCrossStaveUnits[crossStaveUnitIndexAfter],
                midMeasureKeySignaturesForCrossStaveUnits[crossStaveUnitIndexAfter],
                breathMarksBeforeCrossStaveUnits[crossStaveUnitIndexAfter],
                onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits[crossStaveUnitIndexAfter],
                arpeggiatedWavesForCrossStaveUnits[crossStaveUnitIndexAfter],
                keysForCrossStaveUnits[crossStaveUnitIndexAfter],
                crossStaveUnits[crossStaveUnitIndexAfter],
                xDistanceToMove
              )
            }
            voices.voicesBody.right += xDistanceToMove
            voices.right += xDistanceToMove
          }
        }
        lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem.push(lyricsWithMaxWidth)
      }
    }
  }
}
