'use strict'

import estimateSkewAngleInDegrees from '#msq/omr/analysis/estimateSkewAngleInDegrees.js'

/**
 * The page, straightened.
 *
 * The estimate is the slope of the content, so rotating by its negation puts
 * every staff line horizontal again. Sampling is bilinear — the same rule the
 * crops are resampled with — and anything outside the page reads as paper.
 */

export function deskewBitmap (bitmap) {
  const skewAngleInDegrees = estimateSkewAngleInDegrees(bitmap)
  if (Math.abs(skewAngleInDegrees) < 0.05) {
    return { ...bitmap, skewAngleInDegrees: 0 }
  }
  return {
    ...rotateBitmap(bitmap, -skewAngleInDegrees),
    skewAngleInDegrees
  }
}

function rotateBitmap ({ width, height, grayscale }, angleInDegrees) {
  const radians = angleInDegrees * Math.PI / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const rotated = new Float32Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceX = (x - centerX) * cosine + (y - centerY) * sine + centerX
      const sourceY = -(x - centerX) * sine + (y - centerY) * cosine + centerY
      rotated[y * width + x] = bilinearSample(grayscale, width, height, sourceX, sourceY)
    }
  }
  return { width, height, grayscale: rotated }
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
  const topLeft = grayscale[top * width + left]
  const topRight = grayscale[top * width + right]
  const bottomLeft = grayscale[bottom * width + left]
  const bottomRight = grayscale[bottom * width + right]
  return (1 - fractionX) * (1 - fractionY) * topLeft +
    fractionX * (1 - fractionY) * topRight +
    (1 - fractionX) * fractionY * bottomLeft +
    fractionX * fractionY * bottomRight
}

export default deskewBitmap
