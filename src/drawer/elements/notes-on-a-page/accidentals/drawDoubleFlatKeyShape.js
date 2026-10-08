'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, doubleFlatKey, fontColor } = styles
    return createGroup(
      'doubleFlatKeyShape',
      [
        createPath(
          doubleFlatKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + doubleFlatKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
