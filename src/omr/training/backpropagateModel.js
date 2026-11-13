'use strict'

import backpropagateConvolution from '#msq/omr/training/backpropagateConvolution.js'
import {
  softmaxCrossEntropyGradient,
  backpropagateDense,
  backpropagateRelu,
  backpropagateMaxPool
} from '#msq/omr/training/backpropagateDense.js'

/**
 * The whole backward sweep over one crop.
 *
 * Right to left through the same stages forwardModel walked, each stage
 * handing the one before it its share of the error. The result mirrors the
 * model: one gradient array per weight and bias array, ready for the nudging
 * rule to consume.
 */

export function backpropagateModel (model, { cache, probabilities }, expectedClass) {
  const { filterSize, filterCounts } = model.shape
  const [ firstFilters, secondFilters ] = filterCounts

  const gradScores = softmaxCrossEntropyGradient({ probabilities, expectedClass })
  const dense2 = backpropagateDense({ gradOutput: gradScores, input: cache.relu3, weights: model.dense2.weights })
  const gradRelu3 = backpropagateRelu({ gradOutput: dense2.gradInput, preActivation: cache.dense1 })
  const dense1 = backpropagateDense({ gradOutput: gradRelu3, input: cache.flattened, weights: model.dense1.weights })
  const gradPool2 = backpropagateMaxPool({
    gradOutput: dense1.gradInput,
    argmaxIndexes: cache.pool2.argmaxIndexes,
    inputLength: cache.relu2.length
  })
  const gradRelu2 = backpropagateRelu({ gradOutput: gradPool2, preActivation: cache.conv2.values })
  const conv2 = backpropagateConvolution({
    gradOutput: gradRelu2,
    patches: cache.conv2.patches,
    patchLength: cache.conv2.patchLength,
    weights: model.conv2.weights,
    width: cache.conv2.width,
    height: cache.conv2.height,
    channels: firstFilters,
    filterSize,
    filterCount: secondFilters
  })
  const gradPool1 = backpropagateMaxPool({
    gradOutput: conv2.gradInput,
    argmaxIndexes: cache.pool1.argmaxIndexes,
    inputLength: cache.relu1.length
  })
  const gradRelu1 = backpropagateRelu({ gradOutput: gradPool1, preActivation: cache.conv1.values })
  const conv1 = backpropagateConvolution({
    gradOutput: gradRelu1,
    patches: cache.conv1.patches,
    patchLength: cache.conv1.patchLength,
    weights: model.conv1.weights,
    width: cache.conv1.width,
    height: cache.conv1.height,
    channels: 1,
    filterSize,
    filterCount: firstFilters
  })
  return {
    conv1: { gradWeights: conv1.gradWeights, gradBiases: conv1.gradBiases },
    conv2: { gradWeights: conv2.gradWeights, gradBiases: conv2.gradBiases },
    dense1: { gradWeights: dense1.gradWeights, gradBiases: dense1.gradBiases },
    dense2: { gradWeights: dense2.gradWeights, gradBiases: dense2.gradBiases }
  }
}

export default backpropagateModel
