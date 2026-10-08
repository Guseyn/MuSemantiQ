'use strict'

const ZERO_LENGTH = 0.05

const normalOf = (from, to) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  return { x: -dy / length, y: dx / length }
}

const offsetPoint = (point, normal, distance) => ({
  x: point.x + normal.x * distance,
  y: point.y + normal.y * distance
})

export default function (sShapeSlurPoints, thickness) {
  const segments = []
  let current = null
  for (let index = 0; index < sShapeSlurPoints.length;) {
    if (sShapeSlurPoints[index] === 'M') {
      current = { x: sShapeSlurPoints[index + 1], y: sShapeSlurPoints[index + 2] }
      index += 3
    } else if (sShapeSlurPoints[index] === 'C') {
      const c1 = { x: sShapeSlurPoints[index + 1], y: sShapeSlurPoints[index + 2] }
      const c2 = { x: sShapeSlurPoints[index + 3], y: sShapeSlurPoints[index + 4] }
      const end = { x: sShapeSlurPoints[index + 5], y: sShapeSlurPoints[index + 6] }
      if (Math.hypot(end.x - current.x, end.y - current.y) > ZERO_LENGTH) {
        segments.push({ start: current, c1, c2, end })
      }
      current = end
      index += 7
    } else {
      index++
    }
  }

  const lastIndex = segments.length - 1
  const forward = [ 'M', segments[0].start.x, segments[0].start.y ]
  for (const segment of segments) {
    forward.push('C', segment.c1.x, segment.c1.y, segment.c2.x, segment.c2.y, segment.end.x, segment.end.y)
  }

  const back = []
  for (let index = lastIndex; index >= 0; index--) {
    const { start, c1, c2, end } = segments[index]
    const isFirst = index === 0
    const isLast = index === lastIndex
    if (isLast) {
      back.push('L', end.x, end.y)
    }
    const backC2 = offsetPoint(c2, normalOf(c1, end), isLast ? thickness * 0.75 : thickness)
    const backC1 = offsetPoint(c1, normalOf(start, c2), isFirst ? thickness * 0.75 : thickness)
    const backStart = offsetPoint(start, normalOf(start, c1), isFirst ? 0 : thickness)
    back.push('C', backC2.x, backC2.y, backC1.x, backC1.y, backStart.x, backStart.y)
  }

  return [ ...forward, ...back, 'Z' ]
}
