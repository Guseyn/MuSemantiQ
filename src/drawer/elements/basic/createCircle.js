'use strict'

export default function (radius, fill, leftOffset = 0, topOffset = 0) {
  const centerX = leftOffset + radius
  const centerY = topOffset + radius
  return {
    name: 'circle',
    properties: {
      'r': radius,
      'fill': fill || '',
      'cx': centerX,
      'cy': centerY,
      'vector-effect': 'none'
    },
    transformations: [],
    top: topOffset,
    right: centerX + radius,
    bottom: centerY + radius,
    left: centerX - radius
  }
}
