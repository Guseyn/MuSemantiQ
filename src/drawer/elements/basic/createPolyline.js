'use strict'

import formatNumber from '#msq/drawer/elements/basic/formatNumber.js'

export default function (points, strokeOptions, fill = true, leftOffset = 0, topOffset = 0) {
  let minTop
  let maxRight
  let maxBottom
  let minLeft
  let isNextPointOdd = false
  for (let index = 0; index < points.length; index++) {
    const point = points[index]
    if (isNextPointOdd) {
      if (!minTop || minTop > point) {
        minTop = point
      }
      if (!maxBottom || maxBottom < point) {
        maxBottom = point
      }
    } else {
      if (!minLeft || minLeft > point) {
        minLeft = point
      }
      if (!maxRight || maxRight < point) {
        maxRight = point
      }
    }
    isNextPointOdd = !isNextPointOdd
  }
  // Format numbers in points to consistent precision
  const formattedPoints = points.map(p => typeof p === 'number' ? formatNumber(p) : p)
  const joinedPoints = formattedPoints.join(' ')
  if (joinedPoints.includes('NaN')) {
    throw new Error(`polyline includes NaN points: ${joinedPoints}`)
  }
  const properties = {
    'points': joinedPoints,
    'fill': fill || 'none',
    'fill-rule': 'evenodd',
    'vector-effect': 'none'
  }
  if (strokeOptions) {
    properties['fill'] = fill ? strokeOptions.color : 'none'
    properties['stroke'] = strokeOptions.color || ''
    properties['stroke-width'] = strokeOptions.width
    properties['stroke-linejoin'] = strokeOptions.linejoin || ''
    properties['stroke-linecap'] = strokeOptions.linecap || ''
  }
  return {
    name: 'polyline',
    properties,
    transformations: (leftOffset !== 0 || topOffset !== 0)
      ? [
        {
          type: 'translate',
          x: leftOffset,
          y: topOffset
        }
      ]
      : [],
    top: minTop + topOffset,
    right: maxRight + leftOffset,
    bottom: maxBottom + topOffset,
    left: minLeft + leftOffset
  }
}
