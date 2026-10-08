'use strict'

import drawSimile from '#msq/drawer/elements/measure-furniture/similes/drawSimile.js'
import createText from '#msq/drawer/elements/basic/createText.js'
import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import drawStavesPiece from '#msq/drawer/elements/the-page/staves/drawStavesPiece.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (numberOfStaves, numberOfStaveLines, simileYCorrection, numberOfMeasures, stavesPieceWidthOfLastMeasureToCompletePageLine, measureIndexInGeneral, previousMeasure, measureBeforePreviousMeasure) {
  return (styles, leftOffset, topOffset) => {
    const { fontColor, intervalBetweenStaves, intervalBetweenStaveLines, simileCountNumberFontOptions, similePreviousMeasureTextTopMarginOffset, simileTwoPreviousMeasuresStaveWidth, barLineWidth } = styles
    const components = []
    const stavesPieceWidth = Math.max(stavesPieceWidthOfLastMeasureToCompletePageLine, simileTwoPreviousMeasuresStaveWidth)
    const refParams = {
      measureIndexInGeneral
    }
    const stavesPieceWithCoordinates = drawStavesPiece(
      numberOfStaves,
      numberOfStaveLines,
      stavesPieceWidth,
      numberOfStaves,
      refParams
    )(styles, leftOffset, topOffset)
    components.push(stavesPieceWithCoordinates)
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const simile = drawSimile('mixed', simileYCorrection)(styles, leftOffset, topOffsetForCurrentStave)
      addPropertiesToElement(
        simile,
        {
          'ref-ids': `simile-${measureIndexInGeneral + 1}`
        }
      )
      moveElement(
        simile,
        (stavesPieceWidth - (simile.right - simile.left)) / 2
      )
      components.push(simile)
      const xCenter = (stavesPieceWithCoordinates.left + stavesPieceWithCoordinates.right) / 2
      const halfBarLineWidth = barLineWidth / 2
      const barLine = createPolyline(
        [
          xCenter - halfBarLineWidth, stavesPieceWithCoordinates.top,
          xCenter + halfBarLineWidth, stavesPieceWithCoordinates.top,
          xCenter + halfBarLineWidth, stavesPieceWithCoordinates.bottom,
          xCenter - halfBarLineWidth, stavesPieceWithCoordinates.bottom
        ],
        null, fontColor, 0, 0
      )
      components.push(barLine)
      if (numberOfMeasures > 1) {
        const numberOfMeasuresText = createText(
          numberOfMeasures + '',
          simileCountNumberFontOptions
        )(
          styles,
          leftOffset,
          Math.min(simile.top, topOffsetForCurrentStave) + similePreviousMeasureTextTopMarginOffset
        )
        addPropertiesToElement(
          numberOfMeasuresText,
          {
            'ref-ids': `simile-count-${measureIndexInGeneral + 1}`
          }
        )
        moveElement(
          numberOfMeasuresText,
          (stavesPieceWidth - (numberOfMeasuresText.right - numberOfMeasuresText.left)) / 2
        )
        components.push(numberOfMeasuresText)
      }
    }
    if (previousMeasure) {
      addPropertiesToElement(
        previousMeasure,
        {
          'ref-ids': `simile-two-prev-measures-${measureIndexInGeneral + 1}`
        }
      )
      if (measureBeforePreviousMeasure) {
        addPropertiesToElement(
          measureBeforePreviousMeasure,
          {
            'ref-ids': `simile-two-prev-measures-${measureIndexInGeneral + 1}`
          }
        )
      }
    }
    return createGroup(
      'simile', components
    )
  }
}
