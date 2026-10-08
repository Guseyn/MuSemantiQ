'use strict'

export default function (radiusX, radiusY, strokeOptions, fill, angle = 0, leftOffset = 0, topOffset = 0) {
  const centerX = leftOffset + radiusX
  const centerY = topOffset + radiusY
  const radians = angle * (Math.PI / 180)
  const radians90 = radians + Math.PI / 2
  const ux = radiusX * Math.cos(radians)
  const uy = radiusX * Math.sin(radians)
  const vx = radiusY * Math.cos(radians90)
  const vy = radiusY * Math.sin(radians90)
  const width = Math.sqrt(ux * ux + vx * vx) * 2
  const height = Math.sqrt(uy * uy + vy * vy) * 2
  const top = centerY - height / 2
  const right = centerX + width / 2
  const bottom = centerY + height / 2
  const left = centerX - width / 2
  // const box = `<polyline points="${left} ${top} ${right} ${top} ${right} ${bottom} ${left} ${bottom} ${left} ${top}" fill="none" stroke-width="1.0" stroke-color="black"></polyline>`
  const properties = {
    'rx': radiusX,
    'ry': radiusY,
    'fill': fill || 'none',
    'cx': centerX,
    'cy': centerY,
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
    name: 'ellipse',
    properties,
    transformations: [
      {
        type: 'rotate',
        cx: centerX,
        cy: centerY,
        angle
      }
    ],
    top,
    right,
    bottom,
    left
  }
}
