'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (notePositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, wholeNoteHead, fontColor } = styles
    return createGroup(
      'noteHead',
      [
        createPath(
          wholeNoteHead.points,
          null,
          fontColor,
          leftOffset,
          topOffset + wholeNoteHead.yCorrection + notePositionNumber * intervalBetweenStaveLines
        )
      ]
    )
  }
}
