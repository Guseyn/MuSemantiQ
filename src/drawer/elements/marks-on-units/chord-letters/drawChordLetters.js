'use strict'

import drawChordLetterText from '#msq/drawer/elements/marks-on-units/chord-letters/drawChordLetterText.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (voicesOnPageLine, measuresOnPageLine, voicesBodiesOnPageLine, styles) {
  const { intervalBetweenStaveLines } = styles
  const minTopOfMeasuresOnPageLineForChordLetters = Math.min(...measuresOnPageLine.map(measure => measure.top))
  const maxBottomOfMeasuresOnPageLineForChordLetters = Math.max(...measuresOnPageLine.map(measure => measure.bottom))
  const chordLetters = []
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { measureIndexOnPageLine, crossStaveUnits, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < crossStaveUnits.length; crossStaveUnitIndex++) {
          const currentCrossStaveUnit = crossStaveUnits[crossStaveUnitIndex]
          if (currentCrossStaveUnit.chordLetter) {
            const chordLetterDirection = currentCrossStaveUnit.chordLetter.direction || 'up'
            const chordLetterYCorrection = currentCrossStaveUnit.chordLetter.yCorrection || 0
            const chordLetterText = chordLetterDirection === 'up'
              ? drawChordLetterText(currentCrossStaveUnit.chordLetter.textValue)(styles, currentCrossStaveUnit.left, minTopOfMeasuresOnPageLineForChordLetters - styles.chordLetterUpYOffset + chordLetterYCorrection * intervalBetweenStaveLines)
              : drawChordLetterText(currentCrossStaveUnit.chordLetter.textValue)(styles, currentCrossStaveUnit.left, maxBottomOfMeasuresOnPageLineForChordLetters + styles.chordLetterDownYOffset + chordLetterYCorrection * intervalBetweenStaveLines)
            addPropertiesToElement(
              chordLetterText,
              {
                'ref-ids': `chord-letter-${currentCrossStaveUnit.chordLetter.measureIndexInGeneral + 1}-${currentCrossStaveUnit.chordLetter.staveIndex + 1}-${currentCrossStaveUnit.chordLetter.voiceIndex + 1}-${currentCrossStaveUnit.chordLetter.singleUnitIndex + 1}`
              }
            )
            chordLetters.push(chordLetterText)
            const staveIndexWhereWeAdjustTopAndBottomOfSingleUnitsInCurrentCrossStaveUnit = chordLetterDirection === 'up'
              ? 0
              : currentCrossStaveUnit.singleUnitsByStaveIndexes.length - 1
            currentCrossStaveUnit.singleUnitsByStaveIndexes[staveIndexWhereWeAdjustTopAndBottomOfSingleUnitsInCurrentCrossStaveUnit].forEach(singleUnit => {
              singleUnit.top = Math.min(chordLetterText.top, singleUnit.top)
              singleUnit.bottom = Math.max(chordLetterText.bottom, singleUnit.bottom)
            })
            voicesBodiesOnPageLine[measureIndexOnPageLine].top = Math.min(chordLetterText.top, voicesBodiesOnPageLine[measureIndexOnPageLine].top)
            voicesBodiesOnPageLine[measureIndexOnPageLine].bottom = Math.max(chordLetterText.bottom, voicesBodiesOnPageLine[measureIndexOnPageLine].bottom)
            measuresOnPageLine[measureIndexOnPageLine].top = Math.min(chordLetterText.top, measuresOnPageLine[measureIndexOnPageLine].top)
            measuresOnPageLine[measureIndexOnPageLine].bottom = Math.max(chordLetterText.bottom, measuresOnPageLine[measureIndexOnPageLine].bottom)
          }
        }
      }
    }
  }
  return chordLetters
}
