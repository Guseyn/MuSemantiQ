'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, sharpKey, fontColor } = styles
    const keyShape = createGroup(
      'sharpKeyShape',
      [
        createPath(
          sharpKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + sharpKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
    return keyShape
  }
}
