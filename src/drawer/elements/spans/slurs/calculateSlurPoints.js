'use strict'

const QUARTER = 0.25
const MAX_END_ANGLE = Math.PI * 50 / 180

const cubic = (p0, p1, p2, p3, t) => {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

// x grows with t on these curves, so t is found by bisection
const yAtX = (start, c1, c2, end, x) => {
  let low = 0
  let high = 1
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2
    if (cubic(start.x, c1.x, c2.x, end.x, middle) < x) {
      low = middle
    } else {
      high = middle
    }
  }
  const t = (low + high) / 2
  return cubic(start.y, c1.y, c2.y, end.y, t)
}

export default function (markedSlur, slurLeftPoint, slurRightPoint, slurDirection, voicesBody, extendedFromLeftSide, extendedToRightSide, styles) {
  const { intervalBetweenStaveLines, leftMarginForConnectionsThatStartBefore } = styles
  const sign = slurDirection === 'up' ? -1 : +1
  const units = markedSlur.allSingleUnitsOnTheWay
  const firstUnit = units[0]
  const lastUnit = units[units.length - 1]

  const isHeadSide = (unit) => unit.stemless || !unit.stemDirection || (unit.stemDirection === 'up') !== (sign < 0)
  const outerHead = (unit) => {
    const heads = unit.notesWithCoordinates || []
    if (heads.length === 0) {
      return null
    }
    return heads.reduce((outer, head) => (sign > 0 ? head.bottom > outer.bottom : head.top < outer.top) ? head : outer)
  }
  const attachToHead = (point, head) => {
    if (!head) {
      return
    }
    point.x = (head.left + head.right) / 2
    point.y = (sign < 0 ? head.top : head.bottom) + sign * styles.slurJunctionPointForSingleUnitYOffset
  }
  if (isHeadSide(firstUnit)) {
    attachToHead(slurLeftPoint, outerHead(firstUnit))
  }
  if (markedSlur.rightPlacement !== 'middleStem' && isHeadSide(lastUnit)) {
    attachToHead(slurRightPoint, outerHead(lastUnit))
  }

  if (extendedFromLeftSide) {
    slurLeftPoint.x = markedSlur.voicesBodyThatSlurStartsBefore.left + leftMarginForConnectionsThatStartBefore
    slurLeftPoint.y += sign * styles.slurYOffsetForItsSidesWhenItBreakingForNextLine
  }
  slurLeftPoint.y += (markedSlur.leftYCorrection || 0) * intervalBetweenStaveLines
  if (extendedToRightSide) {
    slurRightPoint.x = voicesBody.right
    slurRightPoint.y += sign * styles.slurYOffsetForItsSidesWhenItBreakingForNextLine
  }
  slurRightPoint.y += (markedSlur.rightYCorrection || 0) * intervalBetweenStaveLines

  const start = { x: slurLeftPoint.x, y: slurLeftPoint.y }
  const end = { x: slurRightPoint.x, y: slurRightPoint.y }
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1

  // on a steep chord its normal alone points sideways, into the end notes
  let normalX = -dy / length
  let normalY = dx / length
  if (Math.sign(normalY) !== sign) {
    normalX = -normalX
    normalY = -normalY
  }
  const bulgeLength = Math.hypot(normalX, normalY + sign) || 1
  const bulgeX = normalX / bulgeLength
  const bulgeY = (normalY + sign) / bulgeLength

  const roundness = markedSlur.roundCoefficientFactor ? markedSlur.roundCoefficientFactor / 5 : 1
  const archHeight = Math.min(Math.max(0.16 * Math.abs(dx), 0.8 * intervalBetweenStaveLines), 3.2 * intervalBetweenStaveLines) * roundness
  // a cubic with both control points at h reaches 0.75 h in the middle
  let controlHeight = Math.min(archHeight / 0.75, Math.tan(MAX_END_ANGLE) * QUARTER * length)

  // so the curve reaches each head from above (or below), not through it
  const onSlurSideOf = (y, endY) => sign < 0
    ? Math.min(y, endY - 0.5 * intervalBetweenStaveLines)
    : Math.max(y, endY + 0.5 * intervalBetweenStaveLines)
  const controlPointsAt = (height) => [
    { x: start.x + dx * QUARTER + bulgeX * height, y: onSlurSideOf(start.y + dy * QUARTER + bulgeY * height, start.y) },
    { x: end.x - dx * QUARTER + bulgeX * height, y: onSlurSideOf(end.y - dy * QUARTER + bulgeY * height, end.y) }
  ]

  const unitsOnTheWay = units.slice(extendedFromLeftSide ? 0 : 1, extendedToRightSide ? units.length : units.length - 1)
  const clearance = styles.minSpaceBetweenSingleUnitExtremePointAndSlur
  const intrusion = (height) => {
    const [c1, c2] = controlPointsAt(height)
    let deepest = 0
    for (const unit of unitsOnTheWay) {
      const edge = sign < 0 ? unit.top : unit.bottom
      for (let step = 0; step <= 12; step++) {
        const x = unit.left + (unit.right - unit.left) * step / 12
        if (x <= start.x + intervalBetweenStaveLines || x >= end.x - intervalBetweenStaveLines) {
          continue
        }
        const y = yAtX(start, c1, c2, end, x)
        deepest = Math.max(deepest, sign < 0 ? y - (edge - clearance) : (edge + clearance) - y)
      }
    }
    return deepest
  }

  const userSetThePosition = markedSlur.rightPlacement || markedSlur.leftYCorrection !== undefined || markedSlur.rightYCorrection !== undefined
  const TOLERANCE = 0.01
  if (!userSetThePosition && intrusion(controlHeight) > TOLERANCE) {
    let low = controlHeight
    let high = controlHeight
    while (intrusion(high) > TOLERANCE && high < 60 * intervalBetweenStaveLines) {
      high *= 1.5
    }
    for (let i = 0; i < 30; i++) {
      const middle = (low + high) / 2
      if (intrusion(middle) > TOLERANCE) {
        low = middle
      } else {
        high = middle
      }
    }
    controlHeight = high
  }
  const [c1, c2] = controlPointsAt(controlHeight)

  for (const unit of units) {
    const x = Math.min(Math.max((unit.left + unit.right) / 2, start.x), end.x)
    const y = yAtX(start, c1, c2, end, x)
    if (sign < 0) {
      unit.top = Math.min(unit.top, y - styles.distanceBetweenSlurLayers)
    } else {
      unit.bottom = Math.max(unit.bottom, y + styles.distanceBetweenSlurLayers)
    }
  }

  const thickness = styles.slurBulkCoefficient * (markedSlur.isGrace ? styles.graceElementsScaleFactor : 1)
  return [
    'M', start.x, start.y,
    'C', c1.x, c1.y, c2.x, c2.y, end.x, end.y,
    'C', c2.x + bulgeX * thickness, c2.y + bulgeY * thickness, c1.x + bulgeX * thickness, c1.y + bulgeY * thickness, start.x, start.y
  ]
}
