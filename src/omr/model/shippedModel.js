'use strict'

import weights from '#msq/omr/model/weights.json' with { type: 'json' }

/**
 * The shipped model: the pinned trained numbers of weights.json, with the
 * class list that was trained alongside them.
 *
 * Every read of the file builds fresh typed arrays, so no caller can nudge
 * the numbers another caller will see. The class order comes from the file
 * on purpose — it is never reconstructed from memory.
 */
export function shippedModel () {
  const model = { shape: weights.shape }
  for (const name of [ 'conv1', 'conv2', 'dense1', 'dense2' ]) {
    model[name] = {
      weights: Float64Array.from(weights.layers[name].weights),
      biases: Float64Array.from(weights.layers[name].biases)
    }
  }
  return { model, classIds: weights.classIds }
}

export default shippedModel
