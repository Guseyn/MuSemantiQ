'use strict'

import forwardConvolution from '#msq/omr/model/forwardConvolution.js'
import { applyRelu, applyMaxPool, forwardDense, applySoftmax } from '#msq/omr/model/forwardDense.js'

/**
 * The whole forward pass over one crop: probabilities, and everything the
 * backward pass will need.
 *
 * crop → conv → relu → pool → conv → relu → pool → flatten → dense → relu →
 * dense → softmax. This is the same code training runs and the classifier
 * runs — the deployed model cannot differ from the trained one.
 */

export function forwardModel (model, pixels) {
  const { gridSize, filterSize, filterCounts, denseSize, classCount } = model.shape
  const [ firstFilters, secondFilters ] = filterCounts
  const conv1 = forwardConvolution({
    input: pixels,
    width: gridSize,
    height: gridSize,
    channels: 1,
    weights: model.conv1.weights,
    biases: model.conv1.biases,
    filterSize,
    filterCount: firstFilters
  })
  const relu1 = applyRelu(conv1.values)
  const pool1 = applyMaxPool({ values: relu1, width: gridSize, height: gridSize, channels: firstFilters })
  const conv2 = forwardConvolution({
    input: pool1.values,
    width: pool1.width,
    height: pool1.height,
    channels: firstFilters,
    weights: model.conv2.weights,
    biases: model.conv2.biases,
    filterSize,
    filterCount: secondFilters
  })
  const relu2 = applyRelu(conv2.values)
  const pool2 = applyMaxPool({ values: relu2, width: conv2.width, height: conv2.height, channels: secondFilters })
  const flattened = new Float64Array(pool2.values)
  const dense1 = forwardDense({ input: flattened, weights: model.dense1.weights, biases: model.dense1.biases, outputSize: denseSize })
  const relu3 = applyRelu(dense1)
  const scores = forwardDense({ input: relu3, weights: model.dense2.weights, biases: model.dense2.biases, outputSize: classCount })
  const probabilities = applySoftmax(scores)
  return {
    probabilities,
    cache: { pixels, conv1, relu1, pool1, conv2, relu2, pool2, flattened, dense1, relu3 }
  }
}

export default forwardModel
