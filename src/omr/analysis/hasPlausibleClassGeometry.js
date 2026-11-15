'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

/**
 * A confident class still has to fit the ink's measured musical size.
 * Rejection happens before pitch, duration or clef state can consume it.
 */
export function hasPlausibleClassGeometry (className, box, intervalBetweenStaveLines) {
  const width = box.w / intervalBetweenStaveLines
  const height = box.h / intervalBetweenStaveLines
  const ratio = box.w / box.h
  switch (roleOf(className)) {
    case 'head':
      return width >= 0.35 && width <= 1.6 && height >= 0.2 && height <= 1.5 && ratio >= 0.5 && ratio <= 3.5
    case 'clef':
      return width >= 0.25 && height >= 1.2 && height <= 10
    case 'meter':
      return width >= 0.4 && height >= 1.2 && height <= 5
    case 'digit':
      return width >= 0.1 && width <= 2 && height >= 0.4 && height <= 3
    case 'accidental':
      return width >= 0.1 && width <= 3 && height >= 0.4 && height <= 4
    case 'rest':
      return width >= 0.15 && width <= 4 && height >= 0.15 && height <= 4
    case 'dot':
      return width <= 1 && height <= 1
    case 'mark':
      return width <= 6 && height <= 4
    default:
      return true
  }
}

export default hasPlausibleClassGeometry
