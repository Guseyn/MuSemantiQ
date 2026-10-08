'use strict'

import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (numberOfStaveLines, numerator, denominator, cMode, isClefBefore, isKeySignatureBefore) {
  return (styles, leftOffset, topOffset) => {
    const { timeSignatureLetters, fontColor, timeSignatureDigitLeftOffset, timeSignatureXPaddingAfterKeySignature, timeSignatureXPaddingAfterClef, timeSignatureXPaddingIfThereIsNoClefAndNoKeySignatureBefore, timeSignatureXPaddingAfterItself, cTimeTopOffset, crossedCTimeTopOffset, numeratorTopOffset, denominatorTopOffset } = styles
    const elementsWithCoordinates = []
    if (numerator === '4' && denominator === '4' && cMode) {
      elementsWithCoordinates.push(
        createPath(
          timeSignatureLetters['c'].points,
          null,
          fontColor,
          leftOffset,
          topOffset + cTimeTopOffset
        )
      )
    } else if (numerator === '2' && denominator === '2' && cMode) {
      elementsWithCoordinates.push(
        createPath(
          timeSignatureLetters['crossedC'].points,
          null,
          fontColor,
          leftOffset,
          topOffset + crossedCTimeTopOffset
        )
      )
    } else {
      const numeratorDigits = []
      let numeratorLastLeftOffset = leftOffset
      numerator.split('').forEach(digit => {
        const drawnDigit = createPath(
          timeSignatureLetters[digit].points,
          null,
          fontColor,
          numeratorLastLeftOffset,
          topOffset + numeratorTopOffset
        )
        numeratorLastLeftOffset = drawnDigit.right + timeSignatureDigitLeftOffset
        numeratorDigits.push(drawnDigit)
      })
      const numeratorElement = createGroup(
        'numerator',
        numeratorDigits
      )
      const denominatorDigits = []
      let denominatorLastLeftOffset = leftOffset
      denominator.split('').forEach(digit => {
        const drawnDigit = createPath(
          timeSignatureLetters[digit].points,
          null,
          fontColor,
          denominatorLastLeftOffset,
          topOffset + denominatorTopOffset
        )
        denominatorLastLeftOffset = drawnDigit.right + timeSignatureDigitLeftOffset
        denominatorDigits.push(drawnDigit)
      })
      const denominatorElement = createGroup(
        'numerator',
        denominatorDigits
      )
      const numberatorXCenter = (numeratorElement.left + numeratorElement.right) / 2
      const denominatorXCenter = (denominatorElement.left + denominatorElement.right) / 2
      const maxXCenter = Math.max(numberatorXCenter, denominatorXCenter)
      const xDistanceToMoveNumberatorElementSoItCanBeInCenter = maxXCenter - numberatorXCenter
      const xDistanceToMoveDenominatorElementSoItCanBeInCenter = maxXCenter - denominatorXCenter
      moveElement(numeratorElement, xDistanceToMoveNumberatorElementSoItCanBeInCenter)
      moveElement(denominatorElement, xDistanceToMoveDenominatorElementSoItCanBeInCenter)
      elementsWithCoordinates.push(
        numeratorElement,
        denominatorElement
      )
    }
    const groupedTime = createGroup(
      'time',
      elementsWithCoordinates
    )
    const timeSignatureXPaddingBeforeItself = (
      isKeySignatureBefore
        ? timeSignatureXPaddingAfterKeySignature
        : isClefBefore
          ? timeSignatureXPaddingAfterClef
          : timeSignatureXPaddingIfThereIsNoClefAndNoKeySignatureBefore
    )
    const stavePieceWidth = groupedTime.right - groupedTime.left + timeSignatureXPaddingBeforeItself + timeSignatureXPaddingAfterItself
    moveElement(
      groupedTime,
      timeSignatureXPaddingBeforeItself
    )
    const stavePieceWithCoordinates = drawStavePiece(numberOfStaveLines, stavePieceWidth)(styles, leftOffset, topOffset)
    return createGroup(
      'timeSignature',
      [
        stavePieceWithCoordinates,
        groupedTime
      ]
    )
  }
}
