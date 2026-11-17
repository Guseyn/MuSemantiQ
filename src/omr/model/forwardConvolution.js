'use strict'

/**
 * One convolution layer, as a matrix multiply.
 *
 * Every filter window of the input is cut into a row of a big matrix (im2col),
 * then the layer is one multiply: rows of windows × rows of filters. It costs
 * a little memory and buys half the code — and the backward pass reuses the
 * dense gradients everyone trusts. Padding is "same": out-of-bounds reads
 * paper, so the grid keeps its size.
 */

export function forwardConvolution ({ input, width, height, channels, weights, biases, filterSize, filterCount }) {
  const patchLength = filterSize * filterSize * channels
  const patches = new Float64Array(width * height * patchLength)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const patchStart = (y * width + x) * patchLength
      let offset = 0
      for (let windowY = 0; windowY < filterSize; windowY++) {
        for (let windowX = 0; windowX < filterSize; windowX++) {
          const sourceY = y + windowY - (filterSize - 1) / 2
          const sourceX = x + windowX - (filterSize - 1) / 2
          for (let channel = 0; channel < channels; channel++) {
            const inBounds = sourceX >= 0 && sourceY >= 0 && sourceX < width && sourceY < height
            patches[patchStart + offset] = inBounds
              ? input[(sourceY * width + sourceX) * channels + channel]
              : 0
            offset++
          }
        }
      }
    }
  }
  const values = new Float64Array(width * height * filterCount)
  for (let pixel = 0; pixel < width * height; pixel++) {
    for (let filter = 0; filter < filterCount; filter++) {
      let sum = biases[filter]
      const patchStart = pixel * patchLength
      const weightStart = filter * patchLength
      for (let offset = 0; offset < patchLength; offset++) {
        sum += patches[patchStart + offset] * weights[weightStart + offset]
      }
      values[pixel * filterCount + filter] = sum
    }
  }
  return { values, width, height, channels: filterCount, patches, patchLength }
}

export default forwardConvolution
