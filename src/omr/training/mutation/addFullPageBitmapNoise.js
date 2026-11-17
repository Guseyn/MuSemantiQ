'use strict'

export function addFullPageBitmapNoise (bitmap, standardDeviation, random) {
  if (standardDeviation === 0) {
    return {
      bitmap,
      operation: { name: 'noise', enabled: false, standardDeviation: 0 }
    }
  }
  const grayscale = new Float32Array(bitmap.grayscale.length)
  for (let index = 0; index < grayscale.length; index++) {
    const first = Math.max(random(), Number.EPSILON)
    const second = random()
    const normal = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second)
    grayscale[index] = Math.max(0, Math.min(1, bitmap.grayscale[index] + normal * standardDeviation))
  }
  return {
    bitmap: { width: bitmap.width, height: bitmap.height, grayscale },
    operation: {
      name: 'noise',
      enabled: true,
      type: 'independent Gaussian samples',
      standardDeviation,
      range: 'clamped to [0, 1]'
    }
  }
}

export default addFullPageBitmapNoise
