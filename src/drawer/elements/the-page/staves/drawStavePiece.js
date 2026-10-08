'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (numberOfLines, width) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, staveLinesColor, staveLineHeight } = styles
    const pathPoints = []
    for (let i = 0; i < numberOfLines; i++) {
      pathPoints.push(
        'M',
        0, i * intervalBetweenStaveLines - staveLineHeight / 2,
        'L',
        width, i * intervalBetweenStaveLines - staveLineHeight / 2,
        'L',
        width, i * intervalBetweenStaveLines + staveLineHeight / 2,
        'L',
        0, i * intervalBetweenStaveLines + staveLineHeight / 2,
        'L',
        0, i * intervalBetweenStaveLines - staveLineHeight / 2
      )
    }
    if (pathPoints.length > 0) {
      return createGroup(
        'stavePiece',
        [
          createPath(
            pathPoints,
            null,
            staveLinesColor,
            leftOffset,
            topOffset
          )
        ]
      )
    }
    return createGroup(
      'stavePiece',
      []
    )
  }
}
