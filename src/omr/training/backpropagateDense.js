'use strict'

/**
 * Blame, for the layers between convolutions.
 *
 * Softmax + cross-entropy collapse to one subtraction: p − onehot(y). Dense
 * layers get the textbook three gradients; ReLU forwards blame only where it
 * passed signal; max-pool sends it back to the cell it kept. These are the
 * formulas in the docs, in the same order.
 */

export function softmaxCrossEntropyGradient ({ probabilities, expectedClass }) {
  const gradient = new Float64Array(probabilities)
  gradient[expectedClass] -= 1
  return gradient
}

export function backpropagateDense ({ gradOutput, input, weights }) {
  const outputSize = gradOutput.length
  const inputSize = input.length
  const gradWeights = new Float64Array(outputSize * inputSize)
  const gradBiases = new Float64Array(outputSize)
  const gradInput = new Float64Array(inputSize)
  for (let o = 0; o < outputSize; o++) {
    gradBiases[o] = gradOutput[o]
    for (let i = 0; i < inputSize; i++) {
      gradWeights[o * inputSize + i] = gradOutput[o] * input[i]
      gradInput[i] += weights[o * inputSize + i] * gradOutput[o]
    }
  }
  return { gradWeights, gradBiases, gradInput }
}

export function backpropagateRelu ({ gradOutput, preActivation }) {
  const gradInput = new Float64Array(gradOutput.length)
  for (let index = 0; index < gradOutput.length; index++) {
    gradInput[index] = preActivation[index] > 0 ? gradOutput[index] : 0
  }
  return gradInput
}

export function backpropagateMaxPool ({ gradOutput, argmaxIndexes, inputLength }) {
  const gradInput = new Float64Array(inputLength)
  for (let index = 0; index < gradOutput.length; index++) {
    gradInput[argmaxIndexes[index]] += gradOutput[index]
  }
  return gradInput
}

export default softmaxCrossEntropyGradient
