'use strict'

export function blurFullPageBitmap (bitmap, radiusPixels) {
  if (radiusPixels <= 0) {
    return {
      bitmap,
      operation: { name: 'blur', enabled: false, radiusPixels: 0 }
    }
  }
  const { width, height, grayscale } = bitmap
  const radius = Math.ceil(radiusPixels)
  const sigma = Math.max(0.35, radiusPixels / 2)
  const kernel = []
  let kernelTotal = 0
  for (let offset = -radius; offset <= radius; offset++) {
    const weight = Math.exp(-(offset * offset) / (2 * sigma * sigma))
    kernel.push(weight)
    kernelTotal += weight
  }
  const normalizedKernel = kernel.map((weight) => weight / kernelTotal)
  const horizontal = new Float32Array(grayscale.length)
  const output = new Float32Array(grayscale.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let index = 0; index < normalizedKernel.length; index++) {
        const sourceX = x + index - radius
        if (sourceX >= 0 && sourceX < width) {
          value += grayscale[y * width + sourceX] * normalizedKernel[index]
        }
      }
      horizontal[y * width + x] = value
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let index = 0; index < normalizedKernel.length; index++) {
        const sourceY = y + index - radius
        if (sourceY >= 0 && sourceY < height) {
          value += horizontal[sourceY * width + x] * normalizedKernel[index]
        }
      }
      output[y * width + x] = value
    }
  }
  return {
    bitmap: { width, height, grayscale: output },
    operation: {
      name: 'blur',
      enabled: true,
      type: 'Gaussian, separable',
      radiusPixels,
      discreteRadiusPixels: radius,
      sigmaPixels: sigma
    }
  }
}

export default blurFullPageBitmap
