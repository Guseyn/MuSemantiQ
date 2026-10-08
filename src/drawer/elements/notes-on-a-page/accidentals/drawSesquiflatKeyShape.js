'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, sesquiflatKey, fontColor } = styles
    return createGroup(
      'sesquiflatKeyShape',
      [
        createPath(
          sesquiflatKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + sesquiflatKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
