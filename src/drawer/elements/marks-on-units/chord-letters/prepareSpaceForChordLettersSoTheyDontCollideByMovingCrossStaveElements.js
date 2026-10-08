'use strict'

import drawChordLetterText from '#msq/drawer/elements/marks-on-units/chord-letters/drawChordLetterText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveCrossStaveElementsThatAttachedToCrossStaveUnit from '#msq/drawer/elements/shared/moveCrossStaveElementsThatAttachedToCrossStaveUnit.js'

export default function (
  chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem,
  voices,
  styles
) {
  const { minXDistanceBetweenChordLetters } = styles
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
    const relatedChordLetter = currentCrossStaveUnit.chordLetter
    const prevChordLetterOnPageLine = chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem[chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem.length - 1]
    if (relatedChordLetter) {
      if (relatedChordLetter.textValue) {
        const chordLetterText = drawChordLetterText(relatedChordLetter.textValue)(styles, currentCrossStaveUnit.left, 0)
        if (prevChordLetterOnPageLine) {
          if ((chordLetterText.left - prevChordLetterOnPageLine.right) < minXDistanceBetweenChordLetters) {
            const xDistanceToMove = prevChordLetterOnPageLine.right - chordLetterText.left + minXDistanceBetweenChordLetters
            moveElement(chordLetterText, xDistanceToMove)
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
        chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem.push(chordLetterText)
      }
    }
  }
}
