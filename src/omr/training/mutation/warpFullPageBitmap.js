'use strict'

/**
 * The output is derived from all four transformed source corners, not from the
 * original viewport. Rotation, skew, perspective and translation therefore add
 * paper instead of cutting ink off at an edge.
 */
export function warpFullPageBitmap (bitmap, parameters) {
  const { width, height } = bitmap
  const centerX = width / 2
  const centerY = height / 2
  const rotation = parameters.rotationDegrees * Math.PI / 180
  const skewX = Math.tan(parameters.skewXDegrees * Math.PI / 180)
  const skewY = Math.tan(parameters.skewYDegrees * Math.PI / 180)
  const cosine = Math.cos(rotation)
  const sine = Math.sin(rotation)
  const a = cosine * parameters.scaleX - sine * parameters.scaleY * skewY
  const b = cosine * parameters.scaleX * skewX - sine * parameters.scaleY
  const d = sine * parameters.scaleX + cosine * parameters.scaleY * skewY
  const e = sine * parameters.scaleX * skewX + cosine * parameters.scaleY
  const c = centerX + parameters.offsetX - a * centerX - b * centerY
  const f = centerY + parameters.offsetY - d * centerX - e * centerY
  const g = parameters.perspectiveX / width
  const h = parameters.perspectiveY / height
  const forward = [ a, b, c, d, e, f, g, h, 1 - g * centerX - h * centerY ]
  const inverse = invertHomography(forward)
  const corners = [
    transformPoint(forward, 0, 0),
    transformPoint(forward, width, 0),
    transformPoint(forward, width, height),
    transformPoint(forward, 0, height)
  ]
  const left = Math.floor(Math.min(...corners.map((point) => point.x)) - parameters.padding - Math.abs(parameters.offsetX))
  const right = Math.ceil(Math.max(...corners.map((point) => point.x)) + parameters.padding + Math.abs(parameters.offsetX))
  const top = Math.floor(Math.min(...corners.map((point) => point.y)) - parameters.padding - Math.abs(parameters.offsetY))
  const bottom = Math.ceil(Math.max(...corners.map((point) => point.y)) + parameters.padding + Math.abs(parameters.offsetY))
  const outputWidth = right - left
  const outputHeight = bottom - top
  if (outputWidth < 1 || outputHeight < 1 || outputWidth * outputHeight > parameters.maxOutputPixels) {
    throw new Error(`Mutated bitmap dimensions ${outputWidth}x${outputHeight} exceed the output budget`)
  }
  const grayscale = new Float32Array(outputWidth * outputHeight)
  const reducing = Math.min(parameters.scaleX, parameters.scaleY) < 0.9
  const sampleOffsets = reducing ? [ 0.25, 0.75 ] : [ 0.5 ]
  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      let total = 0
      for (const offsetY of sampleOffsets) {
        for (const offsetX of sampleOffsets) {
          const source = transformPoint(inverse, left + x + offsetX, top + y + offsetY)
          total += sampleBitmap(bitmap, source.x - 0.5, source.y - 0.5)
        }
      }
      grayscale[y * outputWidth + x] = total / (sampleOffsets.length * sampleOffsets.length)
    }
  }
  const outputForward = [
    forward[0] - left * forward[6],
    forward[1] - left * forward[7],
    forward[2] - left * forward[8],
    forward[3] - top * forward[6],
    forward[4] - top * forward[7],
    forward[5] - top * forward[8],
    forward[6], forward[7], forward[8]
  ]
  return {
    bitmap: { width: outputWidth, height: outputHeight, grayscale },
    operation: {
      name: 'geometry',
      scaleX: parameters.scaleX,
      scaleY: parameters.scaleY,
      offsetXPixels: parameters.offsetX,
      offsetYPixels: parameters.offsetY,
      rotationDegrees: parameters.rotationDegrees,
      skewXDegrees: parameters.skewXDegrees,
      skewYDegrees: parameters.skewYDegrees,
      perspectiveX: parameters.perspectiveX,
      perspectiveY: parameters.perspectiveY,
      perspectiveUnit: 'change in homogeneous denominator across the full page',
      paddingPixels: parameters.padding,
      samplesPerOutputPixel: sampleOffsets.length * sampleOffsets.length,
      outputOriginInInputPixels: { x: left, y: top },
      forwardHomography: forward,
      outputForwardHomography: outputForward,
      inverseHomography: inverse,
      transformedSourceCorners: corners.map((point) => ({ x: point.x - left, y: point.y - top })),
      sourceCoverage: 'expanded output contains the complete transformed source rectangle'
    }
  }
}

function transformPoint (matrix, x, y) {
  const denominator = matrix[6] * x + matrix[7] * y + matrix[8]
  return {
    x: (matrix[0] * x + matrix[1] * y + matrix[2]) / denominator,
    y: (matrix[3] * x + matrix[4] * y + matrix[5]) / denominator
  }
}

function invertHomography (matrix) {
  const [ a, b, c, d, e, f, g, h, i ] = matrix
  const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-10) {
    throw new Error('Mutation geometry is not invertible')
  }
  return [
    (e * i - f * h) / determinant,
    (c * h - b * i) / determinant,
    (b * f - c * e) / determinant,
    (f * g - d * i) / determinant,
    (a * i - c * g) / determinant,
    (c * d - a * f) / determinant,
    (d * h - e * g) / determinant,
    (b * g - a * h) / determinant,
    (a * e - b * d) / determinant
  ]
}

function sampleBitmap ({ width, height, grayscale }, x, y) {
  const left = Math.floor(x)
  const top = Math.floor(y)
  const fractionX = x - left
  const fractionY = y - top
  let value = 0
  for (let row = 0; row <= 1; row++) {
    for (let column = 0; column <= 1; column++) {
      const sourceX = left + column
      const sourceY = top + row
      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const weight = (column ? fractionX : 1 - fractionX) * (row ? fractionY : 1 - fractionY)
        value += grayscale[sourceY * width + sourceX] * weight
      }
    }
  }
  return value
}

export default warpFullPageBitmap
