'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfFlags) {
  return (styles, leftOffset, topOffset) => {
    const { oneTopFlag, twoTopFlags, threeTopFlags, fourTopFlags, fiveTopFlags, sixTopFlags, fontColor } = styles
    const topFlags = [ oneTopFlag, twoTopFlags, threeTopFlags, fourTopFlags, fiveTopFlags, sixTopFlags ]
    const noteFlag = createGroup(
      'noteFlag',
      [
        createPath(
          topFlags[numberOfFlags - 1].points,
          null,
          fontColor,
          leftOffset,
          topOffset + topFlags[numberOfFlags - 1].yCorrection
        )
      ]
    )
    noteFlag.stemEndY = topOffset
    return noteFlag
  }
}
