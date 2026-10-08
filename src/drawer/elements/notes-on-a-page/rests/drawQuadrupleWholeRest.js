'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'

export default function (restPositionNumber) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, quadrupleWholeRest } = styles
    return createGroup(
      'rest',
      [
        createPath(
          quadrupleWholeRest.points,
          null,
          true,
          leftOffset,
          topOffset + Math.floor(restPositionNumber) * intervalBetweenStaveLines + quadrupleWholeRest.yCorrection
        )
      ]
    )
  }
}
