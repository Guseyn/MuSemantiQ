'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, sixtyFourthRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          sixtyFourthRest.outlineRadiusX,
          sixtyFourthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixtyFourthRest.outlineLeftOffset1,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixtyFourthRest.outlineTopOffset1
        ),
        createEllipse(
          sixtyFourthRest.outlineRadiusX,
          sixtyFourthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixtyFourthRest.outlineLeftOffset2,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixtyFourthRest.outlineTopOffset2
        ),
        createEllipse(
          sixtyFourthRest.outlineRadiusX,
          sixtyFourthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixtyFourthRest.outlineLeftOffset3,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixtyFourthRest.outlineTopOffset3
        ),
        createEllipse(
          sixtyFourthRest.outlineRadiusX,
          sixtyFourthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + sixtyFourthRest.outlineLeftOffset4,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixtyFourthRest.outlineTopOffset4
        ),
        createPath(
          sixtyFourthRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + sixtyFourthRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
