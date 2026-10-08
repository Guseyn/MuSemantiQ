'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, demiflatKey, fontColor } = styles
    return createGroup(
      'demiflatKeyShape',
      [
        createPath(
          demiflatKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + demiflatKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
