'use strict'

/**
 * Photo flaws, added on purpose.
 *
 * A camera is not a renderer: contrast drops, grain appears, focus softens.
 * Each flaw is applied with a seeded draw so a seed gives one exact training
 * set — and a model that survives real pages instead of only clean ones.
 */

export function applyDegradations ({ width, height, grayscale }, random) {
  let result = new Float32Array(grayscale)
  if (random() < 0.7) {
    result = changeContrast(result, 0.75 + 0.5 * random())
  }
  if (random() < 0.5) {
    result = addNoise(result, 0.05 * random(), random)
  }
  if (random() < 0.5) {
    result = blur(result, width, height)
  }
  return { width, height, grayscale: result }
}

function changeContrast (pixels, factor) {
  const output = new Float32Array(pixels.length)
  for (let index = 0; index < pixels.length; index++) {
    output[index] = Math.max(0, Math.min(1, (pixels[index] - 0.5) * factor + 0.5))
  }
  return output
}

function addNoise (pixels, amount, random) {
  const output = new Float32Array(pixels.length)
  for (let index = 0; index < pixels.length; index++) {
    output[index] = Math.max(0, Math.min(1, pixels[index] + (random() - 0.5) * amount))
  }
  return output
}

function blur (pixels, width, height) {
  const output = new Float32Array(pixels.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let total = 0
      let count = 0
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
          const sampleY = y + offsetY
          const sampleX = x + offsetX
          if (sampleX >= 0 && sampleY >= 0 && sampleX < width && sampleY < height) {
            total += pixels[sampleY * width + sampleX]
            count++
          }
        }
      }
      output[y * width + x] = total / count
    }
  }
  return output
}
