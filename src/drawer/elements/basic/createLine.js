'use strict'

export default function (x1, y1, x2, y2, strokeOptions, leftOffset = 0, topOffset = 0, dataName = 'just line') {
  const x1WithOffset = x1 + leftOffset
  const y1WithOffset = y1 + topOffset
  const x2WithOffset = x2 + leftOffset
  const y2WithOffset = y2 + topOffset
  return {
    name: 'line',
    properties: {
      'data-name': dataName,
      'x1': x1WithOffset,
      'y1': y1WithOffset,
      'x2': x2WithOffset,
      'y2': y2WithOffset,
      'stroke': strokeOptions.color,
      'stroke-width': strokeOptions.width,
      'stroke-linejoin': strokeOptions.linejoin || '',
      'stroke-linecap': strokeOptions.linecap || '',
      'stroke-dasharray': strokeOptions.dasharray || '',
      'vector-effect': 'none'
    },
    transformations: [],
    top: Math.min(y1WithOffset, y2WithOffset),
    right: Math.max(x1WithOffset, x2WithOffset),
    bottom: Math.max(y1WithOffset, y2WithOffset),
    left: Math.min(x1WithOffset, x2WithOffset)
  }
}
