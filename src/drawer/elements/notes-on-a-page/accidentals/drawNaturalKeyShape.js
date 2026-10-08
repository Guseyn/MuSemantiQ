'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, naturalKey, fontColor } = styles
    return createGroup(
      'naturalKeyShape',
      [
        createPath(
          naturalKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + naturalKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
