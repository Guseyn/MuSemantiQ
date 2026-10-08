'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'

export default function (measure, styles) {
  const { intervalBetweenStaveLines, coda, fontColor } = styles
  measure.coda.measurePosition = measure.coda.measurePosition || 'start'
  const xCenterOfCoda = measure.coda.measurePosition === 'start'
    ? (measure.stavesLeft || measure.left)
    : (measure.stavesRight || measure.right)
  const codaShape = createPath(
    coda.points,
    null,
    fontColor,
    xCenterOfCoda,
    0
  )
  moveElementAbovePointWithInterval(
    codaShape,
    measure.top,
    coda.yOffset
  )
  const drawnCoda = createGroup(
    'coda',
    [
      codaShape
    ]
  )
  const codaWidth = drawnCoda.right - drawnCoda.left
  moveElement(
    drawnCoda,
    (measure.coda.measurePosition === 'start')
      ? 0
      : -codaWidth,
    (measure.coda.yCorrection || 0) * intervalBetweenStaveLines
  )
  measure.top = Math.min(measure.top, drawnCoda.top)
  measure.bottom = Math.max(measure.bottom, drawnCoda.bottom)
  return drawnCoda
}
