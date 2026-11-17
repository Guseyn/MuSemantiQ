'use strict'

import normalizeInkPolarity from '#msq/omr/analysis/normalizeInkPolarity.js'

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
  if (random() < 0.6) {
    result = illuminate(result, width, height, random)
  }
  if (random() < 0.25) {
    result = pixelate(result, width, height)
  }
  if (random() < 0.35) {
    result = quantize(result, 16 + Math.floor(random() * 17))
  }
  // Inference normalizes a photographed page too, so training ends with the
  // same paper-level normalization rather than learning one grey background.
  return normalizeInkPolarity({ width, height, grayscale: result })
}

function illuminate (pixels, width, height, random) {
  const paper = 0.03 + 0.12 * random()
  const shadow = 0.1 + 0.2 * random()
  const direction = random() < 0.5 ? -1 : 1
  const output = new Float32Array(pixels.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      const gradient = direction > 0 ? x / Math.max(1, width - 1) : y / Math.max(1, height - 1)
      output[index] = Math.max(0, Math.min(1, paper + (1 - paper) * pixels[index] * (1 - shadow * gradient)))
    }
  }
  return output
}

function pixelate (pixels, width, height) {
  const output = new Float32Array(pixels.length)
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      let total = 0
      let count = 0
      for (const [ dx, dy ] of [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ]) {
        if (x + dx < width && y + dy < height) {
          total += pixels[(y + dy) * width + x + dx]
          count++
        }
      }
      for (const [ dx, dy ] of [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ]) {
        if (x + dx < width && y + dy < height) {
          output[(y + dy) * width + x + dx] = total / count
        }
      }
    }
  }
  return output
}

function quantize (pixels, levels) {
  return Float32Array.from(pixels, (value) => Math.round(value * (levels - 1)) / (levels - 1))
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
