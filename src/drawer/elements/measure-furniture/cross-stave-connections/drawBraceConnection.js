'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import createText from '#msq/drawer/elements/basic/createText.js'
import createRect from '#msq/drawer/elements/basic/createRect.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementInTheCenterBetweenPointsAboveAndBelow from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPointsAboveAndBelow.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (staveStartNumber, staveEndNumber, numberOfAllStaves, numberOfStaveLines) {
  return (styles, leftOffset, topOffset) => {
    const { musicFontSource, musicFontSourceSize, intervalBetweenStaveLines, intervalBetweenStaves, fontColor, curlySmallBrace, curlyLargeBrace, curlyLargerBrace, curlyFlatBrace, spaceAfterBrace } = styles
    const topOffsetForStartStave = calculateTopOffsetForCurrentStave(topOffset, staveStartNumber, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
    const numberOfStavesIncludedInBrace = staveEndNumber - staveStartNumber + 1
    const bottomOffset = topOffsetForStartStave + (numberOfStavesIncludedInBrace - 1) * intervalBetweenStaves + ((numberOfStaveLines - 1) * numberOfStavesIncludedInBrace) * intervalBetweenStaveLines
    const bottomOffsetOfStartStave = topOffsetForStartStave + (numberOfStaveLines - 1) * intervalBetweenStaveLines
    const height = bottomOffset - topOffsetForStartStave
    const heightOfStartStave = bottomOffsetOfStartStave - topOffsetForStartStave
    const fontSizeOfBrace = musicFontSourceSize * height / heightOfStartStave
    let unicodeOfBraceShape
    if (
      (height > curlySmallBrace.minHeight) &&
      (height <= curlySmallBrace.maxHeight)
    ) {
      unicodeOfBraceShape = curlySmallBrace.unicode
    } else if (
      (height > curlyLargeBrace.minHeight) &&
      (height <= curlyLargeBrace.maxHeight)
    ) {
      unicodeOfBraceShape = curlyLargeBrace.unicode
    } else if (
      (height > curlyLargerBrace.minHeight) &&
      (height <= curlyLargerBrace.maxHeight)
    ) {
      unicodeOfBraceShape = curlyLargerBrace.unicode
    } else if  (
      (height > curlyFlatBrace.minHeight) &&
      (height <= curlyFlatBrace.maxHeight)
    ) {
      unicodeOfBraceShape = curlyFlatBrace.unicode
    }
    const braceLineWithCoordinates = createText(
      unicodeOfBraceShape,
      {
        source: musicFontSource,
        color: fontColor,
        size: fontSizeOfBrace * intervalBetweenStaveLines,
        anchor: 'center middle',
      }
    )(styles, leftOffset, 0)
    moveElementInTheCenterBetweenPointsAboveAndBelow(
      braceLineWithCoordinates,
      topOffsetForStartStave,
      bottomOffset
    )
    const spaceAfterBraceLine = createRect(
      spaceAfterBrace,
      bottomOffset - topOffsetForStartStave,
      {},
      'none',
      braceLineWithCoordinates.right, topOffsetForStartStave
    )
    const braceConnection = createGroup(
      'braceConnection',
      [ braceLineWithCoordinates, spaceAfterBraceLine ]
    )
    moveElement(braceConnection, leftOffset - braceConnection.left)
    return braceConnection
  }
}
