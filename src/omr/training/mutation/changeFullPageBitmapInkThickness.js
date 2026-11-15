'use strict'

export function changeFullPageBitmapInkThickness (bitmap, radiusPixels) {
  const discreteRadius = Math.round(Math.abs(radiusPixels))
  if (discreteRadius === 0) {
    return {
      bitmap,
      operation: {
        name: 'ink-thickness',
        enabled: false,
        requestedRadiusPixels: radiusPixels,
        discreteRadiusPixels: 0,
        mode: radiusPixels < 0 ? 'erosion' : 'dilation'
      }
    }
  }
  const { width, height, grayscale } = bitmap
  const output = new Float32Array(grayscale.length)
  const dilating = radiusPixels > 0
  const offsets = []
  for (let y = -discreteRadius; y <= discreteRadius; y++) {
    for (let x = -discreteRadius; x <= discreteRadius; x++) {
      if (x * x + y * y <= discreteRadius * discreteRadius) {
        offsets.push([ x, y ])
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = dilating ? 0 : 1
      for (const [ offsetX, offsetY ] of offsets) {
        const sourceX = x + offsetX
        const sourceY = y + offsetY
        const sample = sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height
          ? grayscale[sourceY * width + sourceX]
          : 0
        value = dilating ? Math.max(value, sample) : Math.min(value, sample)
      }
      output[y * width + x] = value
    }
  }
  return {
    bitmap: { width, height, grayscale: output },
    operation: {
      name: 'ink-thickness',
      enabled: true,
      mode: dilating ? 'dilation' : 'erosion',
      requestedRadiusPixels: radiusPixels,
      discreteRadiusPixels: discreteRadius,
      neighborhood: 'Euclidean disc'
    }
  }
}

export default changeFullPageBitmapInkThickness
