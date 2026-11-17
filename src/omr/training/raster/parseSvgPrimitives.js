'use strict'

import { parseSvgPath } from './parseSvgPath.js'

const drawableElements = new Set([ 'path', 'rect', 'line', 'ellipse', 'polyline', 'polygon' ])
const ignoredElements = new Set([ 'title', 'desc', 'metadata' ])

/**
 * The drawable part of an SVG, with inherited paint and one matrix per shape.
 *
 * `data-name`, `ref-ids` and the four data bounds stay attached to both groups
 * and primitives. Training code can therefore derive labels or masks without
 * having to understand XML or transforms again.
 */
export function parseSvgPrimitives (svgText) {
  const root = parseXml(svgText)
  if (!root || root.tagName !== 'svg') {
    throw new Error('Expected an SVG root element')
  }
  const width = length(root.attributes.width, 0)
  const height = length(root.attributes.height, 0)
  const viewBox = parseViewBox(root.attributes.viewBox, width, height)
  const primitives = []
  const groups = []
  const unsupportedElements = new Set()
  const unsupportedCommands = new Set()
  const unsupportedTransforms = new Set()

  function visit (node, parent) {
    const attributes = presentationAttributes(node.attributes)
    const opacity = parent.opacity * number(attributes.opacity, 1)
    const style = {
      fill: attributes.fill ?? parent.fill,
      fillOpacity: number(attributes['fill-opacity'], parent.fillOpacity),
      fillRule: attributes['fill-rule'] ?? parent.fillRule,
      stroke: attributes.stroke ?? parent.stroke,
      strokeOpacity: number(attributes['stroke-opacity'], parent.strokeOpacity),
      strokeWidth: number(attributes['stroke-width'], parent.strokeWidth),
      lineCap: attributes['stroke-linecap'] || parent.lineCap,
      lineJoin: attributes['stroke-linejoin'] || parent.lineJoin,
      miterLimit: number(attributes['stroke-miterlimit'], parent.miterLimit),
      dashArray: attributes['stroke-dasharray'] ?? parent.dashArray,
      dashOffset: number(attributes['stroke-dashoffset'], parent.dashOffset),
      visibility: attributes.visibility ?? parent.visibility,
      display: parent.display === 'none' ? 'none' : (attributes.display ?? parent.display),
      opacity
    }
    const parsed = parseTransform(attributes.transform)
    for (const command of parsed.unsupported) {
      unsupportedTransforms.add(command)
    }
    const transform = multiplyMatrices(parent.transform, parsed.matrix)
    const common = {
      name: node.attributes['data-name'] || null,
      refIds: (node.attributes['ref-ids'] || '').split(',').filter(Boolean),
      bounds: dataBounds(node.attributes),
      transform,
      visible: style.visibility !== 'hidden' && style.display !== 'none'
    }

    if (node.tagName === 'g' || node.tagName === 'svg') {
      groups.push({ type: node.tagName, ...common })
    } else if (drawableElements.has(node.tagName)) {
      let contours = []
      if (node.tagName === 'path') {
        const path = parseSvgPath(node.attributes.d)
        contours = path.contours
        for (const command of path.unsupportedCommands) {
          unsupportedCommands.add(command)
        }
      } else {
        contours = contoursOf(node.tagName, node.attributes)
      }
      primitives.push({
        type: node.tagName,
        ...common,
        attributes: { ...node.attributes },
        style,
        contours,
        canFill: node.tagName !== 'line'
      })
    } else if (!ignoredElements.has(node.tagName)) {
      unsupportedElements.add(node.tagName)
    }

    for (const child of node.children) {
      visit(child, { ...style, transform })
    }
  }

  visit(root, {
    fill: '#000000',
    fillOpacity: 1,
    fillRule: 'nonzero',
    stroke: 'none',
    strokeOpacity: 1,
    strokeWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 4,
    dashArray: '',
    dashOffset: 0,
    visibility: 'visible',
    display: 'inline',
    opacity: 1,
    transform: [ 1, 0, 0, 1, 0, 0 ]
  })

  return {
    width,
    height,
    viewBox,
    preserveAspectRatio: root.attributes.preserveAspectRatio || 'xMidYMid meet',
    primitives,
    groups,
    unsupportedElements: [ ...unsupportedElements ].sort(),
    unsupportedCommands: [ ...unsupportedCommands ].sort(),
    unsupportedTransforms: [ ...unsupportedTransforms ].sort()
  }
}

function parseXml (svgText) {
  let root = null
  const stack = []
  const tags = String(svgText).match(/<[^>]+>/g) || []
  for (const tag of tags) {
    if (/^<\s*[!?]/.test(tag)) {
      continue
    }
    const closing = /^<\s*\//.test(tag)
    const name = tag.match(/^<\s*\/?\s*([^\s/>]+)/)?.[1]
    if (!name) {
      continue
    }
    if (closing) {
      if (stack.length && stack[stack.length - 1].tagName === name) {
        stack.pop()
      }
      continue
    }
    const node = { tagName: name, attributes: parseAttributes(tag), children: [] }
    if (stack.length) {
      stack[stack.length - 1].children.push(node)
    } else if (!root) {
      root = node
    }
    if (!/\/\s*>$/.test(tag)) {
      stack.push(node)
    }
  }
  return root
}

function parseAttributes (tag) {
  const attributes = {}
  const body = tag.replace(/^<\s*\/?\s*[^\s/>]+/, '').replace(/\/?\s*>$/, '')
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match
  while ((match = pattern.exec(body))) {
    attributes[match[1]] = decodeEntities(match[2] ?? match[3] ?? '')
  }
  return attributes
}

function decodeEntities (value) {
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|quot|apos|lt|gt|amp);/gi, (entity, decimal, hexadecimal) => {
    if (decimal) {
      return String.fromCodePoint(Number(decimal))
    }
    if (hexadecimal) {
      return String.fromCodePoint(Number.parseInt(hexadecimal, 16))
    }
    return { '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&' }[entity.toLowerCase()] || entity
  })
}

function presentationAttributes (attributes) {
  const result = { ...attributes }
  for (const declaration of (attributes.style || '').split(';')) {
    const colon = declaration.indexOf(':')
    if (colon > 0) {
      result[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim()
    }
  }
  return result
}

function parseViewBox (value, width, height) {
  const values = numbers(value)
  if (values.length === 4 && values[2] > 0 && values[3] > 0) {
    return { x: values[0], y: values[1], width: values[2], height: values[3] }
  }
  return { x: 0, y: 0, width, height }
}

function contoursOf (type, attributes) {
  if (type === 'path') {
    return []
  }
  if (type === 'line') {
    return openContour(
      { x: number(attributes.x1, 0), y: number(attributes.y1, 0) },
      { x: number(attributes.x2, 0), y: number(attributes.y2, 0) }
    )
  }
  if (type === 'polyline' || type === 'polygon') {
    const values = numbers(attributes.points)
    const points = []
    for (let index = 0; index + 1 < values.length; index += 2) {
      points.push({ x: values[index], y: values[index + 1] })
    }
    if (!points.length) {
      return []
    }
    return [ {
      start: points[0],
      segments: points.slice(1).map((point) => ({ command: 'L', points: [ point ] })),
      closed: type === 'polygon'
    } ]
  }
  if (type === 'ellipse') {
    return ellipseContours(
      number(attributes.cx, 0),
      number(attributes.cy, 0),
      Math.abs(number(attributes.rx, 0)),
      Math.abs(number(attributes.ry, 0))
    )
  }
  const x = number(attributes.x, 0)
  const y = number(attributes.y, 0)
  const width = number(attributes.width, 0)
  const height = number(attributes.height, 0)
  if (width <= 0 || height <= 0) {
    return []
  }
  let radiusX = Math.max(0, number(attributes.rx, 0))
  let radiusY = Math.max(0, number(attributes.ry, 0))
  if (attributes.rx !== undefined && attributes.ry === undefined) {
    radiusY = radiusX
  }
  if (attributes.ry !== undefined && attributes.rx === undefined) {
    radiusX = radiusY
  }
  radiusX = Math.min(radiusX, width / 2)
  radiusY = Math.min(radiusY, height / 2)
  if (!radiusX || !radiusY) {
    return [ {
      start: { x, y },
      segments: [
        { command: 'L', points: [ { x: x + width, y } ] },
        { command: 'L', points: [ { x: x + width, y: y + height } ] },
        { command: 'L', points: [ { x, y: y + height } ] }
      ],
      closed: true
    } ]
  }
  const kappa = 0.5522847498307936
  const right = x + width
  const bottom = y + height
  return [ {
    start: { x: x + radiusX, y },
    segments: [
      { command: 'L', points: [ { x: right - radiusX, y } ] },
      {
        command: 'C',
        points: [
          { x: right - radiusX + kappa * radiusX, y },
          { x: right, y: y + radiusY - kappa * radiusY },
          { x: right, y: y + radiusY }
        ]
      },
      { command: 'L', points: [ { x: right, y: bottom - radiusY } ] },
      {
        command: 'C',
        points: [
          { x: right, y: bottom - radiusY + kappa * radiusY },
          { x: right - radiusX + kappa * radiusX, y: bottom },
          { x: right - radiusX, y: bottom }
        ]
      },
      { command: 'L', points: [ { x: x + radiusX, y: bottom } ] },
      {
        command: 'C',
        points: [
          { x: x + radiusX - kappa * radiusX, y: bottom },
          { x, y: bottom - radiusY + kappa * radiusY },
          { x, y: bottom - radiusY }
        ]
      },
      { command: 'L', points: [ { x, y: y + radiusY } ] },
      {
        command: 'C',
        points: [
          { x, y: y + radiusY - kappa * radiusY },
          { x: x + radiusX - kappa * radiusX, y },
          { x: x + radiusX, y }
        ]
      }
    ],
    closed: true
  } ]
}

function ellipseContours (cx, cy, radiusX, radiusY) {
  if (!radiusX || !radiusY) {
    return []
  }
  const kappa = 0.5522847498307936
  const controlX = radiusX * kappa
  const controlY = radiusY * kappa
  return [ {
    start: { x: cx + radiusX, y: cy },
    segments: [
      {
        command: 'C',
        points: [
          { x: cx + radiusX, y: cy + controlY },
          { x: cx + controlX, y: cy + radiusY },
          { x: cx, y: cy + radiusY }
        ]
      },
      {
        command: 'C',
        points: [
          { x: cx - controlX, y: cy + radiusY },
          { x: cx - radiusX, y: cy + controlY },
          { x: cx - radiusX, y: cy }
        ]
      },
      {
        command: 'C',
        points: [
          { x: cx - radiusX, y: cy - controlY },
          { x: cx - controlX, y: cy - radiusY },
          { x: cx, y: cy - radiusY }
        ]
      },
      {
        command: 'C',
        points: [
          { x: cx + controlX, y: cy - radiusY },
          { x: cx + radiusX, y: cy - controlY },
          { x: cx + radiusX, y: cy }
        ]
      }
    ],
    closed: true
  } ]
}

function openContour (start, end) {
  return [ { start, segments: [ { command: 'L', points: [ end ] } ], closed: false } ]
}

function parseTransform (value) {
  let matrix = [ 1, 0, 0, 1, 0, 0 ]
  const unsupported = []
  const pattern = /([a-zA-Z]+)\s*\(([^)]*)\)/g
  let match
  while ((match = pattern.exec(value || ''))) {
    const values = numbers(match[2])
    const name = match[1]
    let next = null
    if (name === 'translate' && values.length >= 1) {
      next = [ 1, 0, 0, 1, values[0], values[1] || 0 ]
    } else if (name === 'scale' && values.length >= 1) {
      next = [ values[0], 0, 0, values.length > 1 ? values[1] : values[0], 0, 0 ]
    } else if (name === 'rotate' && (values.length === 1 || values.length === 3)) {
      const angle = values[0] * Math.PI / 180
      const cosine = Math.cos(angle)
      const sine = Math.sin(angle)
      const rotation = [ cosine, sine, -sine, cosine, 0, 0 ]
      if (values.length === 3) {
        next = multiplyMatrices(
          multiplyMatrices([ 1, 0, 0, 1, values[1], values[2] ], rotation),
          [ 1, 0, 0, 1, -values[1], -values[2] ]
        )
      } else {
        next = rotation
      }
    } else if (name === 'matrix' && values.length === 6) {
      next = values
    } else if (name === 'skewX' && values.length === 1) {
      next = [ 1, 0, Math.tan(values[0] * Math.PI / 180), 1, 0, 0 ]
    } else if (name === 'skewY' && values.length === 1) {
      next = [ 1, Math.tan(values[0] * Math.PI / 180), 0, 1, 0, 0 ]
    } else {
      unsupported.push(name)
    }
    if (next) {
      matrix = multiplyMatrices(matrix, next)
    }
  }
  return { matrix, unsupported }
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

function dataBounds (attributes) {
  if (![ 'data-left', 'data-right', 'data-top', 'data-bottom' ].every((name) => attributes[name] !== undefined)) {
    return null
  }
  return {
    left: Number(attributes['data-left']),
    right: Number(attributes['data-right']),
    top: Number(attributes['data-top']),
    bottom: Number(attributes['data-bottom'])
  }
}

function numbers (value) {
  return (String(value || '').match(/[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || []).map(Number)
}

function number (value, fallback) {
  if (value === undefined || value === '') {
    return fallback
  }
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function length (value, fallback) {
  return number(String(value || '').replace(/px\s*$/i, ''), fallback)
}

export default parseSvgPrimitives
