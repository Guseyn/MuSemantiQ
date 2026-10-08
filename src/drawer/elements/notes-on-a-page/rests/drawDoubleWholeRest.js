'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, doubleWholeRest, fontColor } = styles
    return createGroup(
      'rest',
      [
        createPath(
          doubleWholeRest.points,
          null,
          fontColor,
          leftOffset,
          topOffset + Math.floor(restPositionNumber) * intervalBetweenStaveLines + doubleWholeRest.yCorrection
        )
      ]
    )
  }
}
