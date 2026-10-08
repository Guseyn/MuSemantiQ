'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (clefName) {
  return (styles, leftOffset, topOffset) => {
    const { fontColor } = styles
    const clefShape = createPath(
      styles[clefName].points,
      null,
      fontColor,
      leftOffset,
      topOffset + styles[clefName].yCorrection
    )
    return createGroup(
      'clefShape',
      [ clefShape ]
    )
  }
}
