'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'

export default function (barLine, isLastMeasureOnPageLine, styles) {
  const { fermata, barlineFermataOffsetY, fontColor } = styles
  const startYPosition = barLine.top
  const fermataSymbol = createGroup(
    'barline-fermata',
    [
      createPath(
        fermata.upPoints,
        null,
        fontColor,
        0,
        startYPosition
      )
    ]
  )
  moveElementAbovePointWithInterval(
    fermataSymbol,
    startYPosition,
    barlineFermataOffsetY
  )
  const fermataSymbolWidth = fermataSymbol.right - fermataSymbol.left
  moveElement(
    fermataSymbol,
    barLine.xCenter - (isLastMeasureOnPageLine ? fermataSymbolWidth : fermataSymbolWidth / 2)
  )
  return fermataSymbol
}
