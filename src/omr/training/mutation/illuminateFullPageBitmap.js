'use strict'

export function illuminateFullPageBitmap (bitmap, {
  amplitude,
  directionDegrees,
  vignetteAmplitude,
  paperLevel
}) {
  if (amplitude === 0 && vignetteAmplitude === 0 && paperLevel === 0) {
    return {
      bitmap,
      operation: { name: 'illumination', enabled: false, amplitude, vignetteAmplitude, paperLevel }
    }
  }
  const { width, height, grayscale } = bitmap
  const output = new Float32Array(grayscale.length)
  const direction = directionDegrees * Math.PI / 180
  const directionX = Math.cos(direction)
  const directionY = Math.sin(direction)
  for (let y = 0; y < height; y++) {
    const normalizedY = height === 1 ? 0 : 2 * y / (height - 1) - 1
    for (let x = 0; x < width; x++) {
      const normalizedX = width === 1 ? 0 : 2 * x / (width - 1) - 1
      const gradient = normalizedX * directionX + normalizedY * directionY
      const radius = Math.min(1, (normalizedX * normalizedX + normalizedY * normalizedY) / 2)
      const illumination = Math.max(0.25, 1 + amplitude * gradient - vignetteAmplitude * radius)
      const index = y * width + x
      const leveled = paperLevel + (1 - paperLevel) * grayscale[index]
      output[index] = Math.max(0, Math.min(1, leveled * illumination))
    }
  }
  return {
    bitmap: { width, height, grayscale: output },
    operation: {
      name: 'illumination',
      enabled: true,
      type: 'linear gradient and radial vignette',
      amplitude,
      directionDegrees,
      vignetteAmplitude,
      paperLevel
    }
  }
}

export default illuminateFullPageBitmap
