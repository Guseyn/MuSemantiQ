'use strict'

// positionNumber counts half intervals from the top line. Interpolation uses
// the two measured lines around the point, not a page or stave average.
export function measurePositionNumber (linesY, centerY) {
  if (!Array.isArray(linesY) || linesY.length < 2 || !Number.isFinite(centerY)) {
    return null
  }
  for (let index = 0; index < linesY.length - 1; index++) {
    const interval = linesY[index + 1] - linesY[index]
    if (interval <= 0) {
      return null
    }
    if (centerY >= linesY[index] && centerY <= linesY[index + 1]) {
      const fraction = (centerY - linesY[index]) / interval
      return Math.round(2 * (index + fraction))
    }
  }
  const interval = centerY < linesY[0]
    ? linesY[1] - linesY[0]
    : linesY[linesY.length - 1] - linesY[linesY.length - 2]
  if (interval <= 0) {
    return null
  }
  const origin = centerY < linesY[0] ? linesY[0] : linesY[linesY.length - 1]
  const originPosition = centerY < linesY[0] ? 0 : 2 * (linesY.length - 1)
  return Math.round(originPosition + 2 * (centerY - origin) / interval)
}

export default measurePositionNumber
