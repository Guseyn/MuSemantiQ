'use strict'

/**
 * One symbol, as the grid the model reads.
 *
 * The crop is taken at a fixed musical size — three staff spaces, padded to a
 * square so nothing distorts — and resampled to a fixed grid. Shrink by
 * averaging, enlarge by blending; the other way round aliases. After this, the
 * same symbol from any zoom or camera arrives as the same numbers.
 */

export function cropComponent ({ width, height, grayscale }, box, staffSpaceHeightPx, gridSize) {
  const side = 3 * staffSpaceHeightPx
  const centerX = box.x + box.w / 2
  const centerY = box.y + box.h / 2
  const from = {
    x1: centerX - side / 2,
    y1: centerY - side / 2,
    x2: centerX + side / 2,
    y2: centerY + side / 2
  }
  return resampleToGrid({ width, height, grayscale }, from, gridSize)
}

export function resampleToGrid ({ width, height, grayscale }, from, gridSize) {
  const pixels = new Float64Array(gridSize * gridSize)
  const stepX = (from.x2 - from.x1) / gridSize
  const stepY = (from.y2 - from.y1) / gridSize
  const shrinking = stepX > 1
  for (let row = 0; row < gridSize; row++) {
    for (let column = 0; column < gridSize; column++) {
      pixels[row * gridSize + column] = shrinking
        ? areaAverage(grayscale, width, height, from.x1 + column * stepX, from.y1 + row * stepY, stepX, stepY)
        : bilinearSample(grayscale, width, height, from.x1 + (column + 0.5) * stepX, from.y1 + (row + 0.5) * stepY)
    }
  }
  return pixels
}

function areaAverage (grayscale, width, height, x1, y1, stepX, stepY) {
  let total = 0
  let count = 0
  for (let y = Math.floor(y1); y < Math.ceil(y1 + stepY); y++) {
    for (let x = Math.floor(x1); x < Math.ceil(x1 + stepX); x++) {
      if (x >= 0 && y >= 0 && x < width && y < height) {
        total += grayscale[y * width + x]
        count++
      }
    }
  }
  return count ? total / count : 0
}

function bilinearSample (grayscale, width, height, x, y) {
  if (x < 0 || y < 0 || x > width - 1 || y > height - 1) {
    return 0
  }
  const left = Math.floor(x)
  const top = Math.floor(y)
  const right = Math.min(left + 1, width - 1)
  const bottom = Math.min(top + 1, height - 1)
  const fractionX = x - left
  const fractionY = y - top
  return (1 - fractionX) * (1 - fractionY) * grayscale[top * width + left] +
    fractionX * (1 - fractionY) * grayscale[top * width + right] +
    (1 - fractionX) * fractionY * grayscale[bottom * width + left] +
    fractionX * fractionY * grayscale[bottom * width + right]
}

export default cropComponent
