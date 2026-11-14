'use strict'

import { parseSvgPrimitives } from './parseSvgPrimitives.js'

/**
 * SVG ink on paper, without a browser or a native graphics dependency.
 *
 * Curves are flattened to a fraction of a device pixel. Fills use scanlines,
 * strokes use their exact round/bevel/miter pieces, and all painting happens on
 * a supersampled grid before one final box filter. The same SVG and options
 * therefore produce the same floating-point samples on every run.
 */
export function rasterizeSvg (svgText, { scale = 1, supersample = 2 } = {}) {
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('scale must be a positive finite number')
  }
  if (!Number.isInteger(supersample) || supersample < 1) {
    throw new Error('supersample must be a positive integer')
  }
  const document = parseSvgPrimitives(svgText)
  const cssWidth = document.width || document.viewBox.width
  const cssHeight = document.height || document.viewBox.height
  if (!(cssWidth > 0 && cssHeight > 0 && document.viewBox.width > 0 && document.viewBox.height > 0)) {
    throw new Error('SVG must have a positive viewport and viewBox')
  }
  const width = Math.max(1, Math.round(cssWidth * scale))
  const height = Math.max(1, Math.round(cssHeight * scale))
  const sampleWidth = width * supersample
  const sampleHeight = height * supersample
  const samples = new Float32Array(sampleWidth * sampleHeight)
  const view = viewBoxMatrix(document, cssWidth, cssHeight)
  const device = multiplyMatrices([ scale * supersample, 0, 0, scale * supersample, 0, 0 ], view)
  const background = document.primitives.find((primitive) => primitive.name === 'page-background')
  const backgroundColor = background && parseColor(background.style.fill)
  const paperLuma = backgroundColor ? backgroundColor.luma : 1
  const unsupportedColors = new Set()

  for (const primitive of document.primitives) {
    if (!primitive.visible || !primitive.contours.length) {
      continue
    }
    const matrix = multiplyMatrices(device, primitive.transform)
    const contours = flattenContours(primitive.contours, matrix)
    if (primitive.canFill) {
      const fill = paint(primitive.style.fill, primitive.style.fillOpacity * primitive.style.opacity, paperLuma, unsupportedColors)
      if (fill) {
        fillContours(samples, sampleWidth, sampleHeight, contours, primitive.style.fillRule, fill)
      }
    }
    const stroke = paint(primitive.style.stroke, primitive.style.strokeOpacity * primitive.style.opacity, paperLuma, unsupportedColors)
    const strokeScale = (Math.hypot(matrix[0], matrix[1]) + Math.hypot(matrix[2], matrix[3])) / 2
    const strokeWidth = primitive.style.strokeWidth * strokeScale
    if (stroke && strokeWidth > 0) {
      const dashed = dashContours(contours, primitive.style.dashArray, primitive.style.dashOffset * strokeScale, strokeScale)
      strokeContours(samples, sampleWidth, sampleHeight, dashed, strokeWidth, primitive.style, stroke)
    }
  }

  const grayscale = new Float32Array(width * height)
  const sampleCount = supersample * supersample
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let total = 0
      for (let sampleY = 0; sampleY < supersample; sampleY++) {
        const row = (y * supersample + sampleY) * sampleWidth
        for (let sampleX = 0; sampleX < supersample; sampleX++) {
          total += samples[row + x * supersample + sampleX]
        }
      }
      grayscale[y * width + x] = total / sampleCount
    }
  }

  return {
    width,
    height,
    grayscale,
    unsupportedElements: document.unsupportedElements,
    unsupportedCommands: document.unsupportedCommands,
    unsupportedTransforms: document.unsupportedTransforms,
    unsupportedColors: [ ...unsupportedColors ].sort()
  }
}

function viewBoxMatrix (document, width, height) {
  const box = document.viewBox
  const scaleX = width / box.width
  const scaleY = height / box.height
  const preserve = document.preserveAspectRatio.trim()
  if (preserve === 'none') {
    return [ scaleX, 0, 0, scaleY, -box.x * scaleX, -box.y * scaleY ]
  }
  const meetOrSlice = preserve.includes('slice') ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY)
  const alignX = preserve.includes('xMin') ? 0 : (preserve.includes('xMax') ? width - box.width * meetOrSlice : (width - box.width * meetOrSlice) / 2)
  const alignY = preserve.includes('YMin') ? 0 : (preserve.includes('YMax') ? height - box.height * meetOrSlice : (height - box.height * meetOrSlice) / 2)
  return [ meetOrSlice, 0, 0, meetOrSlice, alignX - box.x * meetOrSlice, alignY - box.y * meetOrSlice ]
}

function flattenContours (contours, matrix) {
  const result = []
  for (const contour of contours) {
    const start = transformPoint(contour.start, matrix)
    const points = [ start ]
    let current = start
    for (const segment of contour.segments) {
      if (segment.command === 'L') {
        current = transformPoint(segment.points[0], matrix)
        points.push(current)
      } else if (segment.command === 'C') {
        const control1 = transformPoint(segment.points[0], matrix)
        const control2 = transformPoint(segment.points[1], matrix)
        const end = transformPoint(segment.points[2], matrix)
        flattenCubic(current, control1, control2, end, points, 0)
        current = end
      } else if (segment.command === 'Q') {
        const control = transformPoint(segment.points[0], matrix)
        const end = transformPoint(segment.points[1], matrix)
        flattenQuadratic(current, control, end, points, 0)
        current = end
      }
    }
    if (contour.closed && points.length > 2 && samePoint(points[0], points[points.length - 1])) {
      points.pop()
    }
    if (points.length > 1) {
      result.push({ points, closed: contour.closed })
    }
  }
  return result
}

function flattenCubic (start, control1, control2, end, points, depth) {
  if (depth >= 16 || Math.max(distanceFromLine(control1, start, end), distanceFromLine(control2, start, end)) <= 0.2) {
    points.push(end)
    return
  }
  const startControl = midpoint(start, control1)
  const controls = midpoint(control1, control2)
  const controlEnd = midpoint(control2, end)
  const leftControl = midpoint(startControl, controls)
  const rightControl = midpoint(controls, controlEnd)
  const middle = midpoint(leftControl, rightControl)
  flattenCubic(start, startControl, leftControl, middle, points, depth + 1)
  flattenCubic(middle, rightControl, controlEnd, end, points, depth + 1)
}

function flattenQuadratic (start, control, end, points, depth) {
  if (depth >= 16 || distanceFromLine(control, start, end) <= 0.2) {
    points.push(end)
    return
  }
  const startControl = midpoint(start, control)
  const controlEnd = midpoint(control, end)
  const middle = midpoint(startControl, controlEnd)
  flattenQuadratic(start, startControl, middle, points, depth + 1)
  flattenQuadratic(middle, controlEnd, end, points, depth + 1)
}

function fillContours (pixels, width, height, contours, fillRule, paint) {
  const edges = []
  let minimumY = Infinity
  let maximumY = -Infinity
  for (const contour of contours) {
    const points = contour.points
    if (points.length < 2) {
      continue
    }
    for (let index = 0; index < points.length; index++) {
      const first = points[index]
      const second = points[(index + 1) % points.length]
      if (first.y === second.y) {
        continue
      }
      const edge = {
        x1: first.x,
        y1: first.y,
        x2: second.x,
        y2: second.y,
        minimumY: Math.min(first.y, second.y),
        maximumY: Math.max(first.y, second.y),
        direction: second.y > first.y ? 1 : -1
      }
      edges.push(edge)
      minimumY = Math.min(minimumY, edge.minimumY)
      maximumY = Math.max(maximumY, edge.maximumY)
    }
  }
  if (!edges.length) {
    return
  }
  const firstRow = Math.max(0, Math.ceil(minimumY - 0.5))
  const lastRow = Math.min(height, Math.ceil(maximumY - 0.5))
  for (let y = firstRow; y < lastRow; y++) {
    const sampleY = y + 0.5
    const crossings = []
    for (const edge of edges) {
      if (sampleY >= edge.minimumY && sampleY < edge.maximumY) {
        crossings.push({
          x: edge.x1 + (sampleY - edge.y1) * (edge.x2 - edge.x1) / (edge.y2 - edge.y1),
          direction: edge.direction
        })
      }
    }
    crossings.sort((first, second) => first.x - second.x)
    if (fillRule === 'evenodd') {
      for (let index = 0; index + 1 < crossings.length; index += 2) {
        paintSpan(pixels, width, y, crossings[index].x, crossings[index + 1].x, paint)
      }
    } else {
      let winding = 0
      for (let index = 0; index < crossings.length - 1; index++) {
        winding += crossings[index].direction
        if (winding !== 0) {
          paintSpan(pixels, width, y, crossings[index].x, crossings[index + 1].x, paint)
        }
      }
    }
  }
}

function paintSpan (pixels, width, y, left, right, paint) {
  const start = Math.max(0, Math.ceil(Math.min(left, right) - 0.5))
  const end = Math.min(width, Math.ceil(Math.max(left, right) - 0.5))
  const row = y * width
  for (let x = start; x < end; x++) {
    composite(pixels, row + x, paint)
  }
}

function strokeContours (pixels, width, height, contours, strokeWidth, style, paint) {
  const shapes = []
  const radius = strokeWidth / 2
  for (const contour of contours) {
    const points = contour.points
    if (points.length === 1 && style.lineCap === 'round') {
      shapes.push(circle(points[0], radius))
      continue
    }
    const segmentCount = contour.closed ? points.length : points.length - 1
    for (let index = 0; index < segmentCount; index++) {
      const first = points[index]
      const second = points[(index + 1) % points.length]
      if (!samePoint(first, second)) {
        shapes.push(segmentRectangle(first, second, radius))
      }
    }
    const firstJoin = contour.closed ? 0 : 1
    const lastJoin = contour.closed ? points.length : points.length - 1
    for (let index = firstJoin; index < lastJoin; index++) {
      const previous = points[(index - 1 + points.length) % points.length]
      const point = points[index]
      const next = points[(index + 1) % points.length]
      if (!samePoint(previous, point) && !samePoint(point, next)) {
        addJoin(shapes, previous, point, next, radius, style)
      }
    }
    if (!contour.closed && points.length > 1) {
      addCap(shapes, points[1], points[0], radius, style.lineCap)
      addCap(shapes, points[points.length - 2], points[points.length - 1], radius, style.lineCap)
    }
  }
  if (!shapes.length) {
    return
  }
  let minimumX = Infinity
  let minimumY = Infinity
  let maximumX = -Infinity
  let maximumY = -Infinity
  for (const shape of shapes) {
    minimumX = Math.min(minimumX, shape.minimumX)
    minimumY = Math.min(minimumY, shape.minimumY)
    maximumX = Math.max(maximumX, shape.maximumX)
    maximumY = Math.max(maximumY, shape.maximumY)
  }
  const firstRow = Math.max(0, Math.ceil(minimumY - 0.5))
  const lastRow = Math.min(height, Math.ceil(maximumY - 0.5))
  const firstColumn = Math.max(0, Math.ceil(minimumX - 0.5))
  const lastColumn = Math.min(width, Math.ceil(maximumX - 0.5))
  for (let y = firstRow; y < lastRow; y++) {
    for (let x = firstColumn; x < lastColumn; x++) {
      const point = { x: x + 0.5, y: y + 0.5 }
      for (const shape of shapes) {
        if (point.x >= shape.minimumX && point.x <= shape.maximumX && point.y >= shape.minimumY && point.y <= shape.maximumY && insideShape(point, shape)) {
          composite(pixels, y * width + x, paint)
          break
        }
      }
    }
  }
}

function segmentRectangle (first, second, radius) {
  const unit = unitVector(first, second)
  const normal = { x: -unit.y * radius, y: unit.x * radius }
  return polygon([
    { x: first.x + normal.x, y: first.y + normal.y },
    { x: second.x + normal.x, y: second.y + normal.y },
    { x: second.x - normal.x, y: second.y - normal.y },
    { x: first.x - normal.x, y: first.y - normal.y }
  ])
}

function addJoin (shapes, previous, point, next, radius, style) {
  if (style.lineJoin === 'round') {
    shapes.push(circle(point, radius))
    return
  }
  const before = unitVector(previous, point)
  const after = unitVector(point, next)
  for (const side of [ -1, 1 ]) {
    const first = { x: point.x - before.y * radius * side, y: point.y + before.x * radius * side }
    const second = { x: point.x - after.y * radius * side, y: point.y + after.x * radius * side }
    let join = [ point, first, second ]
    if (style.lineJoin !== 'bevel') {
      const denominator = cross(before, after)
      if (Math.abs(denominator) > 1e-12) {
        const difference = { x: second.x - first.x, y: second.y - first.y }
        const distance = cross(difference, after) / denominator
        const miter = { x: first.x + before.x * distance, y: first.y + before.y * distance }
        if (Math.hypot(miter.x - point.x, miter.y - point.y) <= radius * style.miterLimit) {
          join = [ point, first, miter, second ]
        }
      }
    }
    shapes.push(polygon(join))
  }
}

function addCap (shapes, inner, end, radius, lineCap) {
  if (lineCap === 'round') {
    shapes.push(circle(end, radius))
  } else if (lineCap === 'square') {
    const unit = unitVector(inner, end)
    const normal = { x: -unit.y * radius, y: unit.x * radius }
    const outer = { x: end.x + unit.x * radius, y: end.y + unit.y * radius }
    shapes.push(polygon([
      { x: end.x + normal.x, y: end.y + normal.y },
      { x: outer.x + normal.x, y: outer.y + normal.y },
      { x: outer.x - normal.x, y: outer.y - normal.y },
      { x: end.x - normal.x, y: end.y - normal.y }
    ]))
  }
}

function dashContours (contours, value, offset, scale) {
  let pattern = (String(value || '').match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || []).map(Number)
  if (!pattern.length || pattern.some((part) => part < 0)) {
    return contours
  }
  pattern = pattern.map((part) => part * scale)
  if (pattern.length % 2) {
    pattern = pattern.concat(pattern)
  }
  const total = pattern.reduce((sum, part) => sum + part, 0)
  if (!total) {
    return contours
  }
  let position = ((offset % total) + total) % total
  let patternIndex = 0
  while (position >= pattern[patternIndex] && pattern[patternIndex] >= 0) {
    position -= pattern[patternIndex]
    patternIndex = (patternIndex + 1) % pattern.length
    if (position === 0 && patternIndex === 0) {
      break
    }
  }
  let remaining = pattern[patternIndex] - position
  let drawing = patternIndex % 2 === 0
  const result = []
  for (const contour of contours) {
    const points = contour.closed ? contour.points.concat(contour.points[0]) : contour.points
    let current = drawing ? [ points[0] ] : null
    for (let index = 0; index + 1 < points.length; index++) {
      const start = points[index]
      const end = points[index + 1]
      const length = Math.hypot(end.x - start.x, end.y - start.y)
      if (!length) {
        continue
      }
      let consumed = 0
      while (consumed < length) {
        if (remaining === 0) {
          if (drawing && current && current.length > 1) {
            result.push({ points: current, closed: false })
          }
          patternIndex = (patternIndex + 1) % pattern.length
          drawing = patternIndex % 2 === 0
          remaining = pattern[patternIndex]
          current = drawing ? [ pointAlong(start, end, consumed / length) ] : null
          continue
        }
        const step = Math.min(remaining, length - consumed)
        consumed += step
        remaining -= step
        if (drawing) {
          current.push(pointAlong(start, end, consumed / length))
        }
      }
    }
    if (drawing && current && current.length > 1) {
      result.push({ points: current, closed: false })
    }
  }
  return result
}

function insideShape (point, shape) {
  if (shape.type === 'circle') {
    return (point.x - shape.x) ** 2 + (point.y - shape.y) ** 2 <= shape.radius ** 2
  }
  let inside = false
  const points = shape.points
  for (let first = 0, second = points.length - 1; first < points.length; second = first++) {
    const a = points[first]
    const b = points[second]
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
}

function polygon (points) {
  return { type: 'polygon', points, ...boundsOf(points) }
}

function circle (point, radius) {
  return {
    type: 'circle',
    x: point.x,
    y: point.y,
    radius,
    minimumX: point.x - radius,
    minimumY: point.y - radius,
    maximumX: point.x + radius,
    maximumY: point.y + radius
  }
}

function boundsOf (points) {
  let minimumX = Infinity
  let minimumY = Infinity
  let maximumX = -Infinity
  let maximumY = -Infinity
  for (const point of points) {
    minimumX = Math.min(minimumX, point.x)
    minimumY = Math.min(minimumY, point.y)
    maximumX = Math.max(maximumX, point.x)
    maximumY = Math.max(maximumY, point.y)
  }
  return { minimumX, minimumY, maximumX, maximumY }
}

function paint (value, opacity, paperLuma, unsupportedColors) {
  if (value === undefined || value === null || value === '' || value === 'none' || value === 'transparent') {
    return null
  }
  const color = parseColor(value)
  if (!color) {
    unsupportedColors.add(value)
    return null
  }
  const alpha = Math.max(0, Math.min(1, color.alpha * opacity))
  if (!alpha) {
    return null
  }
  return {
    alpha,
    ink: Math.max(0, Math.min(1, (paperLuma - color.luma) / Math.max(paperLuma, 1e-12)))
  }
}

function parseColor (value) {
  const text = String(value || '').trim().toLowerCase()
  if (text === 'true') {
    return parseColor('#000000')
  }
  if (text.startsWith('#')) {
    const hexadecimal = text.slice(1)
    if (![ 3, 4, 6, 8 ].includes(hexadecimal.length) || !/^[\da-f]+$/.test(hexadecimal)) {
      return null
    }
    const expanded = hexadecimal.length <= 4 ? hexadecimal.split('').map((digit) => digit + digit).join('') : hexadecimal
    const red = Number.parseInt(expanded.slice(0, 2), 16)
    const green = Number.parseInt(expanded.slice(2, 4), 16)
    const blue = Number.parseInt(expanded.slice(4, 6), 16)
    const alpha = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1
    return color(red, green, blue, alpha)
  }
  const rgb = text.match(/^rgba?\(\s*([^)]*)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean)
    if (parts.length >= 3) {
      const channels = parts.slice(0, 3).map((part) => part.endsWith('%') ? Number.parseFloat(part) * 2.55 : Number.parseFloat(part))
      const alpha = parts[3] === undefined ? 1 : (parts[3].endsWith('%') ? Number.parseFloat(parts[3]) / 100 : Number.parseFloat(parts[3]))
      if (channels.every(Number.isFinite) && Number.isFinite(alpha)) {
        return color(...channels, alpha)
      }
    }
  }
  const named = {
    black: [ 0, 0, 0 ],
    white: [ 255, 255, 255 ],
    red: [ 255, 0, 0 ],
    green: [ 0, 128, 0 ],
    blue: [ 0, 0, 255 ],
    gray: [ 128, 128, 128 ],
    grey: [ 128, 128, 128 ],
    lavenderblush: [ 255, 240, 245 ],
    transparent: [ 255, 255, 255, 0 ]
  }[text]
  return named ? color(...named) : null
}

function color (red, green, blue, alpha = 1) {
  return { luma: (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255, alpha }
}

function composite (pixels, index, paint) {
  pixels[index] = paint.ink * paint.alpha + pixels[index] * (1 - paint.alpha)
}

function transformPoint (point, matrix) {
  return {
    x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
    y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
  }
}

function multiplyMatrices (first, second) {
  return [
    first[0] * second[0] + first[2] * second[1],
    first[1] * second[0] + first[3] * second[1],
    first[0] * second[2] + first[2] * second[3],
    first[1] * second[2] + first[3] * second[3],
    first[0] * second[4] + first[2] * second[5] + first[4],
    first[1] * second[4] + first[3] * second[5] + first[5]
  ]
}

function distanceFromLine (point, start, end) {
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  if (!length) {
    return Math.hypot(point.x - start.x, point.y - start.y)
  }
  return Math.abs((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) / length
}

function unitVector (start, end) {
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  return { x: (end.x - start.x) / length, y: (end.y - start.y) / length }
}

function midpoint (first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function pointAlong (start, end, fraction) {
  return { x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction }
}

function cross (first, second) {
  return first.x * second.y - first.y * second.x
}

function samePoint (first, second) {
  return Math.abs(first.x - second.x) < 1e-10 && Math.abs(first.y - second.y) < 1e-10
}

export default rasterizeSvg
