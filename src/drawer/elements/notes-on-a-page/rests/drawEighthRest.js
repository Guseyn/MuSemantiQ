'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, eighthRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          eighthRest.outlineRadiusX,
          eighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + eighthRest.outlineLeftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + eighthRest.outlineTopOffset
        ),
        createPath(
          eighthRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + eighthRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
