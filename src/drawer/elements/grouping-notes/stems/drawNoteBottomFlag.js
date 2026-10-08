'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfFlags) {
  return (styles, leftOffset, topOffset) => {
    const { oneBottomFlag, twoBottomFlags, threeBottomFlags, fourBottomFlags, fiveBottomFlags, sixBottomFlags, fontColor } = styles
    const bottomFlags = [ oneBottomFlag, twoBottomFlags, threeBottomFlags, fourBottomFlags, fiveBottomFlags, sixBottomFlags ]
    const noteFlag = createGroup(
      'noteFlag',
      [
        createPath(
          bottomFlags[numberOfFlags - 1].points,
          null,
          fontColor,
          leftOffset,
          topOffset + bottomFlags[numberOfFlags - 1].yCorrection
        )
      ]
    )
    noteFlag.stemEndY = topOffset
    return noteFlag
  }
}
