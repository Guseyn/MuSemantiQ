'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import createPathWithOutline from '#msq/drawer/elements/basic/createPathWithOutline.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (positionNumber, textValue = '?') {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, noteLetterKeysFontOptions, noteLetters, fontColor } = styles
    const isOnStaveLine = Math.abs(positionNumber * 10 % 2) === 0
    const yCenterOfStaveLine = topOffset + positionNumber * intervalBetweenStaveLines
    const yCenterBetweenPrevAndNextStavesLine = (
      (topOffset + (positionNumber - 0.5) * intervalBetweenStaveLines) +
      (topOffset + (positionNumber + 0.5) * intervalBetweenStaveLines)
    ) / 2
    const noteLetterWithCoordinates = noteLetters[textValue]
      ? createPathWithOutline(
        noteLetters[textValue].points,
        null,
        fontColor,
        noteLetterKeysFontOptions.outlinePadding,
        noteLetterKeysFontOptions.outlineColor,
        noteLetterKeysFontOptions.outlineRadius,
        leftOffset,
        isOnStaveLine ? yCenterOfStaveLine : yCenterBetweenPrevAndNextStavesLine
      )
      : createText(
        textValue,
        noteLetterKeysFontOptions
      )(
        styles,
        leftOffset,
        isOnStaveLine ? yCenterOfStaveLine : yCenterBetweenPrevAndNextStavesLine
      )
    const yCenterOfDrawnNoteLetter = (noteLetterWithCoordinates.top + noteLetterWithCoordinates.bottom) / 2
    if (isOnStaveLine) {
      moveElement(
        noteLetterWithCoordinates,
        0,
        yCenterOfStaveLine - yCenterOfDrawnNoteLetter
      )
    } else {
      moveElement(
        noteLetterWithCoordinates,
        0,
        yCenterBetweenPrevAndNextStavesLine - yCenterOfDrawnNoteLetter
      )
    }
    return createGroup(
      'noteLetter',
      [
        noteLetterWithCoordinates
      ]
    )
  }
}
