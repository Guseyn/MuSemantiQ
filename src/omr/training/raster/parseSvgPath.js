'use strict'

/**
 * Path data as drawing segments, before any transform is applied.
 *
 * Keeping the curves here lets the rasterizer choose its flattening tolerance
 * in device pixels. Unsupported commands are reported instead of being read as
 * numbers and quietly corrupting the rest of the path.
 */
export function parseSvgPath (data) {
  const tokens = String(data || '').match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || []
  const contours = []
  const unsupportedCommands = new Set()
  let index = 0
  let command = null
  let contour = null
  let current = { x: 0, y: 0 }
  let cubicControl = null
  let quadraticControl = null
  let previousCommand = null

  function number () {
    return Number(tokens[index++])
  }

  function point (relative = false) {
    const x = number()
    const y = number()
    return relative ? { x: current.x + x, y: current.y + y } : { x, y }
  }

  function ensureContour () {
    if (!contour) {
      contour = { start: { ...current }, segments: [], closed: false }
      contours.push(contour)
    }
  }

  function lineTo (end) {
    ensureContour()
    contour.segments.push({ command: 'L', points: [ end ] })
    current = end
  }

  while (index < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[index])) {
      command = tokens[index++]
    }
    if (!command) {
      index++
      continue
    }
    const upper = command.toUpperCase()
    const relative = command !== upper
    if (upper === 'Z') {
      if (contour) {
        contour.closed = true
        current = { ...contour.start }
      }
      previousCommand = 'Z'
      cubicControl = null
      quadraticControl = null
      command = null
      continue
    }
    if (index >= tokens.length || /^[a-zA-Z]$/.test(tokens[index])) {
      if (/^[a-zA-Z]$/.test(tokens[index] || '')) {
        continue
      }
      break
    }

    if (upper === 'M') {
      current = point(relative)
      contour = { start: { ...current }, segments: [], closed: false }
      contours.push(contour)
      command = relative ? 'l' : 'L'
    } else if (upper === 'L') {
      lineTo(point(relative))
    } else if (upper === 'H') {
      const x = number()
      lineTo({ x: relative ? current.x + x : x, y: current.y })
    } else if (upper === 'V') {
      const y = number()
      lineTo({ x: current.x, y: relative ? current.y + y : y })
    } else if (upper === 'C') {
      const control1 = point(relative)
      const control2 = point(relative)
      const end = point(relative)
      ensureContour()
      contour.segments.push({ command: 'C', points: [ control1, control2, end ] })
      current = end
      cubicControl = control2
    } else if (upper === 'S') {
      const control1 = previousCommand && /C|S/.test(previousCommand) && cubicControl
        ? { x: 2 * current.x - cubicControl.x, y: 2 * current.y - cubicControl.y }
        : { ...current }
      const control2 = point(relative)
      const end = point(relative)
      ensureContour()
      contour.segments.push({ command: 'C', points: [ control1, control2, end ] })
      current = end
      cubicControl = control2
    } else if (upper === 'Q') {
      const control = point(relative)
      const end = point(relative)
      ensureContour()
      contour.segments.push({ command: 'Q', points: [ control, end ] })
      current = end
      quadraticControl = control
    } else if (upper === 'T') {
      const control = previousCommand && /Q|T/.test(previousCommand) && quadraticControl
        ? { x: 2 * current.x - quadraticControl.x, y: 2 * current.y - quadraticControl.y }
        : { ...current }
      const end = point(relative)
      ensureContour()
      contour.segments.push({ command: 'Q', points: [ control, end ] })
      current = end
      quadraticControl = control
    } else {
      unsupportedCommands.add(command)
      // Arc has a fixed arity, so its endpoint can still be tracked. Unknown
      // commands are skipped to the next command letter.
      if (upper === 'A' && index + 7 <= tokens.length) {
        index += 5
        current = point(relative)
      } else {
        while (index < tokens.length && !/^[a-zA-Z]$/.test(tokens[index])) {
          index++
        }
      }
      command = null
    }

    if (upper === 'M') {
      previousCommand = 'M'
      cubicControl = null
      quadraticControl = null
    } else {
      previousCommand = upper
      if (!/C|S/.test(upper)) {
        cubicControl = null
      }
      if (!/Q|T/.test(upper)) {
        quadraticControl = null
      }
    }
  }

  return { contours, unsupportedCommands: [ ...unsupportedCommands ].sort() }
}

export default parseSvgPath
