'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'

export default function (octaveSignNumber, octaveSignPostfix, direction) {
  return (styles, leftOffset, topOffset) => {
    const { fontColor, octaveSignLetters } = styles
    return createPath(
      octaveSignLetters[`${octaveSignNumber}${octaveSignPostfix}-${direction}`].points,
      null,
      fontColor,
      leftOffset,
      topOffset
    )
  }
}
