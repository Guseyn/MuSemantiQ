'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, demisharpKey, fontColor } = styles
    const keyShape = createGroup(
      'sharpKeyShape',
      [
        createPath(
          demisharpKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + demisharpKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
    return keyShape
  }
}
