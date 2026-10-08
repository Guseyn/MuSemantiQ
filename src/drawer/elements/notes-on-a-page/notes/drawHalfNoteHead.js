'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (notePositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, halfNoteHead, fontColor } = styles
    return createGroup(
      'noteHead',
      [
        createPath(
          halfNoteHead.points,
          null,
          fontColor,
          leftOffset,
          topOffset + halfNoteHead.yCorrection + notePositionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
