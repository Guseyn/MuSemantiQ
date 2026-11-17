'use strict'

/**
 * Blame, for one convolution layer.
 *
 * The layer was a matrix multiply over im2col patches, so its gradients are
 * matrix gradients: dW = δ · patchesᵀ, db = Σ δ, and the input's share goes
 * back through Wᵀ — then each patch value is scattered home again (col2im),
 * summing where windows overlap. Out-of-bounds paper gets nothing.
 */

export function backpropagateConvolution ({
  gradOutput,
  patches,
  patchLength,
  weights,
  width,
  height,
  channels,
  filterSize,
  filterCount
}) {
  const gradWeights = new Float64Array(filterCount * patchLength)
  const gradBiases = new Float64Array(filterCount)
  const gradPatches = new Float64Array(patches.length)
  for (let pixel = 0; pixel < width * height; pixel++) {
    for (let filter = 0; filter < filterCount; filter++) {
      const error = gradOutput[pixel * filterCount + filter]
      gradBiases[filter] += error
      const patchStart = pixel * patchLength
      const weightStart = filter * patchLength
      for (let offset = 0; offset < patchLength; offset++) {
        gradWeights[weightStart + offset] += error * patches[patchStart + offset]
        gradPatches[patchStart + offset] += weights[weightStart + offset] * error
      }
    }
  }
  const gradInput = new Float64Array(width * height * channels)
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
            if (inBounds) {
              gradInput[(sourceY * width + sourceX) * channels + channel] += gradPatches[patchStart + offset]
            }
            offset++
          }
        }
      }
    }
  }
  return { gradWeights, gradBiases, gradInput }
}

export default backpropagateConvolution
