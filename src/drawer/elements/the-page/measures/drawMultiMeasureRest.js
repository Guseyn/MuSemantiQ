'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createText from '#msq/drawer/elements/basic/createText.js'
import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (numberOfStaves, numberOfStaveLines, numberOfMeasures, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaves, intervalBetweenStaveLines, measureRest, fontColor, multiMeasureRestNumberFontOptions, multiMeasureRestTextTopMarginOffset } = styles
    const components = []
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const multiRestShapeElements = []
      let lastLeftOffset = leftOffset
      const leftSide = createPath(
        measureRest.leftPoints,
        null,
        fontColor,
        lastLeftOffset,
        topOffsetForCurrentStave + measureRest.leftYCorrection
      )
      multiRestShapeElements.push(leftSide)
      lastLeftOffset = leftSide.right + measureRest.centralSymbolXCorrection
      for (let index = 0; index < measureRest.numberOfCentralSymbols; index++) {
        const centerSide = createPath(
          measureRest.centerPoints,
          null,
          fontColor,
          lastLeftOffset,
          topOffsetForCurrentStave + measureRest.centerYCorrection
        )
        multiRestShapeElements.push(centerSide)
        lastLeftOffset = centerSide.right + measureRest.centralSymbolXCorrection
      }
      const rightSide = createPath(
        measureRest.rightPoints,
        null,
        fontColor,
        lastLeftOffset,
        topOffsetForCurrentStave + measureRest.rightYCorrection
      )
      multiRestShapeElements.push(rightSide)
      let multiRestShape = createGroup(
        'multiRestShape',
        multiRestShapeElements
      )
      const multiRestShapeWidth = multiRestShape.right - multiRestShape.left
      const stavesPieceWidth = Math.max(stavesPieceWidthOfLastMeasureToCompletePageLine, 2 * measureRest.sidePadding + multiRestShapeWidth)
      const refParams = {
        measureIndexInGeneral
      }
      components.push(
        drawStavesPiece(
          numberOfStaves,
          numberOfStaveLines,
          stavesPieceWidth,
          numberOfStaves,
          refParams
        )(styles, leftOffset, topOffset)
      )
      moveElement(
        multiRestShape,
        (stavesPieceWidth - (multiRestShape.right - multiRestShape.left)) / 2
      )
      addPropertiesToElement(
        multiRestShape,
        {
          'ref-ids': `measure-rest-${measureIndexInGeneral + 1}`
        }
      )
      components.push(multiRestShape)
      if (numberOfMeasures && numberOfMeasures > 1) {
        const numberOfMeasuresText = createText(
          numberOfMeasures + '',
          multiMeasureRestNumberFontOptions
        )(
          styles,
          leftOffset,
          topOffsetForCurrentStave + multiMeasureRestTextTopMarginOffset
        )
        addPropertiesToElement(
          numberOfMeasuresText,
          {
            'ref-ids': `measure-rest-count-${measureIndexInGeneral + 1}`
          }
        )
        moveElement(
          numberOfMeasuresText,
          (stavesPieceWidth - (numberOfMeasuresText.right - numberOfMeasuresText.left)) / 2
        )
        components.push(numberOfMeasuresText)
      }
    }
    const multiMeasureRest = createGroup(
      'measure rest', components
    )
    return multiMeasureRest
  }
}
