'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, sixteenthRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          sixteenthRest.outlineRadiusX,
          sixteenthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixteenthRest.outlineLeftOffset1,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixteenthRest.outlineTopOffset1
        ),
        createEllipse(
          sixteenthRest.outlineRadiusX,
          sixteenthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixteenthRest.outlineLeftOffset2,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixteenthRest.outlineTopOffset2
        ),
        createPath(
          sixteenthRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixteenthRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
