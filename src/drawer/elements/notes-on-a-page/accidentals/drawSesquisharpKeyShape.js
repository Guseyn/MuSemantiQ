'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (positionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, sesquisharpKey, fontColor } = styles
    const keyShape = createGroup(
      'sesquisharpKeyShape',
      [
        createPath(
          sesquisharpKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset + sesquisharpKey.yCorrection + positionNumber * intervalBetweenStaveLines
        )
      ]
    )
    return keyShape
  }
}
