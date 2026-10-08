'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, thirtySecondRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          thirtySecondRest.outlineRadiusX,
          thirtySecondRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + thirtySecondRest.outlineLeftOffset1,
          topOffset + restPositionNumber * intervalBetweenStaveLines + thirtySecondRest.outlineTopOffset1
        ),
        createEllipse(
          thirtySecondRest.outlineRadiusX,
          thirtySecondRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + thirtySecondRest.outlineLeftOffset2,
          topOffset + restPositionNumber * intervalBetweenStaveLines + thirtySecondRest.outlineTopOffset2
        ),
        createEllipse(
          thirtySecondRest.outlineRadiusX,
          thirtySecondRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + thirtySecondRest.outlineLeftOffset3,
          topOffset + restPositionNumber * intervalBetweenStaveLines + thirtySecondRest.outlineTopOffset3
        ),
        createPath(
          thirtySecondRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + thirtySecondRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
