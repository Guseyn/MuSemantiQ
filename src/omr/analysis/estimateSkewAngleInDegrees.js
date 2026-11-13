'use strict'

/**
 * How far the page is turned, in degrees.
 *
 * Ink is binned along rows of a candidate angle. When the angle matches the
 * tilt of the content, the staff lines pile into a few sharp bins and the sum
 * of squared bin counts peaks — that sum is the sharpness being maximized.
 * A coarse sweep finds the neighbourhood, a fine sweep finds the angle.
 *
 * The result is the slope of the content: positive when lines go down as x
 * grows. Rotating by its negation straightens the page (see deskewBitmap).
 */

const INK_THRESHOLD = 0.5
const MAX_INK_POINTS = 20000

export function estimateSkewAngleInDegrees ({ width, height, grayscale }) {
  const points = collectInkPoints({ width, height, grayscale })
  if (points.length < 2) {
    return 0
  }
  let bestAngle = 0
  let bestSharpness = -1
  for (const angle of anglesFrom(-5, 5, 0.25)) {
    const sharpness = projectionSharpness(points, width + height, angle)
    if (sharpness > bestSharpness) {
      bestSharpness = sharpness
      bestAngle = angle
    }
  }
  for (const angle of anglesFrom(bestAngle - 0.3, bestAngle + 0.3, 0.05)) {
    const sharpness = projectionSharpness(points, width + height, angle)
    if (sharpness > bestSharpness) {
      bestSharpness = sharpness
      bestAngle = angle
    }
  }
  return bestAngle
}

// A fixed stride keeps big images cheap and the result the same on every run.
function collectInkPoints ({ width, height, grayscale }) {
  const points = []
  let inkCount = 0
  for (let index = 0; index < grayscale.length; index++) {
    if (grayscale[index] > INK_THRESHOLD) {
      inkCount++
    }
  }
  const stride = Math.max(1, Math.ceil(inkCount / MAX_INK_POINTS))
  let seen = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grayscale[y * width + x] > INK_THRESHOLD) {
        if (seen % stride === 0) {
          points.push([ x, y ])
        }
        seen++
      }
    }
  }
  return points
}

function projectionSharpness (points, binRange, angleInDegrees) {
  const radians = angleInDegrees * Math.PI / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const offset = binRange
  const bins = new Float64Array(binRange * 2 + 1)
  for (const [ x, y ] of points) {
    const bin = Math.round(y * cosine - x * sine) + offset
    bins[bin]++
  }
  let sharpness = 0
  for (const count of bins) {
    sharpness += count * count
  }
  return sharpness
}

function anglesFrom (start, end, step) {
  const angles = []
  for (let angle = start; angle <= end + 1e-9; angle += step) {
    angles.push(Math.round(angle * 100) / 100)
  }
  return angles
}

export default estimateSkewAngleInDegrees
