'use strict'

export default function (width, height, strokeOptions = {}, fill = 'none', leftOffset = 0, topOffset = 0) {
  return {
    name: 'rect',
    properties: {
      'width': width,
      'height': height,
      'stroke': strokeOptions.color || '',
      'stroke-width': strokeOptions.width || '',
      'stroke-linejoin': strokeOptions.linejoin || '',
      'stroke-linecap': strokeOptions.linecap || '',
      'fill': fill,
      'vector-effect': 'none'
    },
    transformations: (leftOffset !== 0 || topOffset !== 0)
      ? [
        {
          type: 'translate',
          x: leftOffset,
          y: topOffset
        }
      ]
      : [],
    top: topOffset,
    right: leftOffset + width,
    bottom: topOffset + height,
    left: leftOffset
  }
}
