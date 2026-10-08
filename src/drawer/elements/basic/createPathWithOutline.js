'use strict'

import calculateBboxForPath from '#msq/drawer/elements/basic/calculateBboxForPath.js'

export default function (points, strokeOptions, fill = true, outlinePadding, outlineColor, outlineRadius, leftOffset = 0, topOffset = 0) {
  const areAnyNaNPoints = points.some(point => isNaN(point) && typeof point !== 'string')
  if (areAnyNaNPoints) {
    throw new Error(`there are NaN points in path ${points}`)
  }
  const path = points.join(' ')
  const { minTop, minLeft, maxRight, maxBottom } = calculateBboxForPath(path)
  const top = minTop + topOffset
  const right = maxRight + leftOffset
  const bottom = maxBottom + topOffset
  const left = minLeft + leftOffset
  // const box = `<polyline points="${left} ${top} ${right} ${top} ${right} ${bottom} ${left} ${bottom} ${left} ${top}" fill="none" stroke-width="1.0" stroke="red"></polyline>`
  const properties = {
    'd': path,
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
  const pathItself = {
    name: 'path',
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
    top,
    right,
    bottom,
    left
  }
  if (outlinePadding) {
    const outline = {
      name: 'rect',
      properties: {
        'data-name': 'outline',
        'fill': outlineColor,
        'width': right - left + 2 * outlinePadding,
        'height': bottom - top + 2 * outlinePadding,
        'rx': outlineRadius || 0
      },
      transformations: [
        {
          type: 'translate',
          x: left - outlinePadding,
          y: top - outlinePadding
        }
      ],
      top: top - outlinePadding,
      right: right + outlinePadding,
      bottom: bottom + outlinePadding,
      left: left - outlinePadding
    }
    return {
      name: 'g',
      properties: {
        'data-name': 'textWithOutline'
      },
      wrapWithBox: false,
      elements: [
        outline,
        pathItself
      ],
      transformations: [],
      top: top - outlinePadding,
      right: right + outlinePadding,
      bottom: bottom + outlinePadding,
      left: left - outlinePadding,
      textTop: pathItself.top,
      textRight: pathItself.right,
      textLeft: pathItself.left,
      textBottom: pathItself.bottom
    }
  }
}
