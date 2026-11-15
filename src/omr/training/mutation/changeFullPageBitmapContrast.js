'use strict'

export function changeFullPageBitmapContrast (bitmap, factor) {
  if (factor === 1) {
    return {
      bitmap,
      operation: { name: 'contrast', enabled: false, factor }
    }
  }
  const grayscale = Float32Array.from(bitmap.grayscale, (value) => {
    return Math.max(0, Math.min(1, (value - 0.5) * factor + 0.5))
  })
  return {
    bitmap: { width: bitmap.width, height: bitmap.height, grayscale },
    operation: {
      name: 'contrast',
      enabled: true,
      factor,
      pivot: 0.5
    }
  }
}

export default changeFullPageBitmapContrast
