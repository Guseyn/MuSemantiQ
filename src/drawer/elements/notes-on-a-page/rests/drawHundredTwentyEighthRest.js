'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, hundredTwentyEighthRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          hundredTwentyEighthRest.outlineRadiusX,
          hundredTwentyEighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + hundredTwentyEighthRest.outlineLeftOffset1,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.outlineTopOffset1
        ),
        createEllipse(
          hundredTwentyEighthRest.outlineRadiusX,
          hundredTwentyEighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + hundredTwentyEighthRest.outlineLeftOffset2,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.outlineTopOffset2
        ),
        createEllipse(
          hundredTwentyEighthRest.outlineRadiusX,
          hundredTwentyEighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + hundredTwentyEighthRest.outlineLeftOffset3,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.outlineTopOffset3
        ),
        createEllipse(
          hundredTwentyEighthRest.outlineRadiusX,
          hundredTwentyEighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + hundredTwentyEighthRest.outlineLeftOffset4,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.outlineTopOffset4
        ),
        createEllipse(
          hundredTwentyEighthRest.outlineRadiusX,
          hundredTwentyEighthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + hundredTwentyEighthRest.outlineLeftOffset5,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.outlineTopOffset5
        ),
        createPath(
          hundredTwentyEighthRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + hundredTwentyEighthRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
