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
  if (Math.abs(skewAngleInDegrees) < 0.25) {
    return { ...bitmap, skewAngleInDegrees: 0 }
  }
  return {
    ...rotateBitmap(bitmap, -skewAngleInDegrees),
    skewAngleInDegrees
  }
}

function rotateBitmap ({ width, height, grayscale, rgb }, angleInDegrees) {
  const radians = angleInDegrees * Math.PI / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const rotated = new Float32Array(width * height)
  const rotatedRgb = rgb ? new Float32Array(width * height * 3) : null
  const paper = rgb ? cornerColor(rgb, width, height) : null
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceX = (x - centerX) * cosine + (y - centerY) * sine + centerX
      const sourceY = -(x - centerX) * sine + (y - centerY) * cosine + centerY
      rotated[y * width + x] = bilinearSample(grayscale, width, height, sourceX, sourceY)
      if (rotatedRgb) {
        for (let channel = 0; channel < 3; channel++) {
          rotatedRgb[(y * width + x) * 3 + channel] = bilinearSample(rgb, width, height, sourceX, sourceY, 3, channel, paper[channel])
        }
      }
    }
  }
  return { width, height, grayscale: rotated, ...(rotatedRgb ? { rgb: rotatedRgb } : {}) }
}

function bilinearSample (values, width, height, x, y, stride = 1, channel = 0, outside = 0) {
  if (x < 0 || y < 0 || x > width - 1 || y > height - 1) {
    return outside
  }
  const left = Math.floor(x)
  const top = Math.floor(y)
  const right = Math.min(left + 1, width - 1)
  const bottom = Math.min(top + 1, height - 1)
  const fractionX = x - left
  const fractionY = y - top
  const topLeft = values[(top * width + left) * stride + channel]
  const topRight = values[(top * width + right) * stride + channel]
  const bottomLeft = values[(bottom * width + left) * stride + channel]
  const bottomRight = values[(bottom * width + right) * stride + channel]
  return (1 - fractionX) * (1 - fractionY) * topLeft +
    fractionX * (1 - fractionY) * topRight +
    (1 - fractionX) * fractionY * bottomLeft +
    fractionX * fractionY * bottomRight
}

function cornerColor (rgb, width, height) {
  const corners = [ 0, width - 1, (height - 1) * width, height * width - 1 ]
  return [ 0, 1, 2 ].map((channel) => corners.reduce((sum, index) => sum + rgb[index * 3 + channel], 0) / corners.length)
}

export default deskewBitmap
