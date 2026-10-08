'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createEllipse from '#msq/drawer/elements/basic/createEllipse.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, twoHundredFiftySixthRest, fontColor, backgroundColor } = styles
    const restBody = createGroup(
      'rest',
      [
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset1,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset1
        ),
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset2,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset2
        ),
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset3,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset3
        ),
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset4,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset4
        ),
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset5,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset5
        ),
        createEllipse(
          twoHundredFiftySixthRest.outlineRadiusX,
          twoHundredFiftySixthRest.outlineRadiusY,
          null,
          backgroundColor,
          0,
          leftOffset + twoHundredFiftySixthRest.outlineLeftOffset6,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.outlineTopOffset6
        ),
        createPath(
          twoHundredFiftySixthRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + restPositionNumber * intervalBetweenStaveLines + twoHundredFiftySixthRest.yCorrection
        )
      ]
    )
    return restBody
  }
}
