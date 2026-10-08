'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'

export default function (numberOfSimileStrokes, simileYCorrection) {
  return (styles, leftOffset, topOffset) => {
    const elements = []
    const { intervalBetweenStaveLines, fontColor, singleMixedSimile, mixedSimile, simile, xDistanceBetweenSimileStrokes } = styles
    if (numberOfSimileStrokes === 'single-mixed') {
      const drawnSimile = createGroup(
        'singleMixedSimile',
        [
          createPath(
            singleMixedSimile.points,
            null,
            fontColor,
            leftOffset,
            topOffset + 1 * intervalBetweenStaveLines + singleMixedSimile.yCorrection
          )
        ]
      )
      elements.push(drawnSimile)
    } else if (numberOfSimileStrokes === 'mixed') {
      const drawnSimile = createGroup(
        'mixedSimile',
        [
          createPath(
            mixedSimile.points,
            null,
            fontColor,
            leftOffset,
            topOffset + 1 * intervalBetweenStaveLines + mixedSimile.yCorrection
          )
        ]
      )
      elements.push(drawnSimile)
    } else {
      let currentLeftOffset = leftOffset
      const strokes = []
      let strokeWidth
      for (let index = 0; index < numberOfSimileStrokes; index++) {
        let currentStroke = createPath(
          simile.points,
          null,
          fontColor,
          currentLeftOffset + (index === 0 ? 0 : xDistanceBetweenSimileStrokes),
          topOffset + 1 * intervalBetweenStaveLines + simile.yCorrection
        )
        if (!strokeWidth) {
          strokeWidth = currentStroke.right - currentStroke.left
        }
        currentLeftOffset = currentStroke.right
        strokes.push(currentStroke)
      }
      const drawnSimile = createGroup(
        'simileStrokes',
        strokes
      )
      elements.push(drawnSimile)
    }
    const drawnSimile = createGroup(
      'simile',
      elements
    )
    moveElement(
      drawnSimile,
      0,
      simileYCorrection * intervalBetweenStaveLines
    )
    return drawnSimile
  }
}
