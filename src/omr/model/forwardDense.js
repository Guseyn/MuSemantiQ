'use strict'

/**
 * The layers between convolutions: ReLU, max-pool, dense, softmax.
 *
 * Each takes numbers in and gives numbers out; that is the whole contract.
 * The names here are the formulas in the docs: a = max(0, z), the pool keeps
 * the strongest of each 2×2, z = W·a + b, and softmax turns scores into
 * probabilities that add up to one.
 */

export function applyRelu (values) {
  const output = new Float64Array(values.length)
  for (let index = 0; index < values.length; index++) {
    output[index] = values[index] > 0 ? values[index] : 0
  }
  return output
}

// Channel-interleaved maps: index = (y * width + x) * channels + channel.
// Argmax positions are kept so the backward pass can route the blame.
export function applyMaxPool ({ values, width, height, channels }) {
  const pooledWidth = Math.floor(width / 2)
  const pooledHeight = Math.floor(height / 2)
  const pooled = new Float64Array(pooledWidth * pooledHeight * channels)
  const argmaxIndexes = new Int32Array(pooled.length)
  for (let y = 0; y < pooledHeight; y++) {
    for (let x = 0; x < pooledWidth; x++) {
      for (let channel = 0; channel < channels; channel++) {
        let best = -Infinity
        let bestIndex = -1
        for (let windowY = 0; windowY < 2; windowY++) {
          for (let windowX = 0; windowX < 2; windowX++) {
            const index = ((y * 2 + windowY) * width + x * 2 + windowX) * channels + channel
            if (values[index] > best) {
              best = values[index]
              bestIndex = index
            }
          }
        }
        const pooledIndex = (y * pooledWidth + x) * channels + channel
        pooled[pooledIndex] = best
        argmaxIndexes[pooledIndex] = bestIndex
      }
    }
  }
  return { values: pooled, width: pooledWidth, height: pooledHeight, channels, argmaxIndexes }
}

export function forwardDense ({ input, weights, biases, outputSize }) {
  const output = new Float64Array(outputSize)
  for (let o = 0; o < outputSize; o++) {
    let sum = biases[o]
    for (let i = 0; i < input.length; i++) {
      sum += input[i] * weights[o * input.length + i]
    }
    output[o] = sum
  }
  return output
}

// The largest score is subtracted first; the probabilities are unchanged and
// the exponentials cannot overflow.
export function applySoftmax (scores) {
  let largest = -Infinity
  for (const score of scores) {
    largest = Math.max(largest, score)
  }
  const probabilities = new Float64Array(scores.length)
  let total = 0
  for (let index = 0; index < scores.length; index++) {
    probabilities[index] = Math.exp(scores[index] - largest)
    total += probabilities[index]
  }
  for (let index = 0; index < probabilities.length; index++) {
    probabilities[index] /= total
  }
  return probabilities
}

export default applyRelu
