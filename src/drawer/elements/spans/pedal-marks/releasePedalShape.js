'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function () {
  return (styles, leftOffset, topOffset) => {
    const { releasePedal, fontColor } = styles
    const drawnReleasePedal = createPath(
      releasePedal.points,
      null,
      fontColor,
      leftOffset,
      topOffset
    )
    return createGroup(
      'releasePedal',
      [
        drawnReleasePedal
      ]
    )
  }
}
