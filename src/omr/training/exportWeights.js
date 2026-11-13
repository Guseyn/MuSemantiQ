'use strict'

import { createHash } from 'node:crypto'

/**
 * The trained numbers, written down and pinned.
 *
 * Arrays go out at full precision and the file gets a SHA-256, so the repo can
 * say "these exact weights" and every run loads the same model. The class
 * list rides along — the model says what it knows — so the order the model
 * was trained with is never reconstructed from memory. A training (node)
 * tool; inference never needs a hash.
 */

export function exportWeights (model, classIds = null) {
  const layers = {}
  for (const name of [ 'conv1', 'conv2', 'dense1', 'dense2' ]) {
    layers[name] = {
      weights: Array.from(model[name].weights),
      biases: Array.from(model[name].biases)
    }
  }
  const body = JSON.stringify({
    shape: model.shape,
    layers,
    ...(classIds ? { classIds } : {})
  })
  return {
    json: body,
    hash: createHash('sha256').update(body).digest('hex')
  }
}

export function modelFromWeights ({ shape, layers }) {
  const model = { shape }
  for (const name of [ 'conv1', 'conv2', 'dense1', 'dense2' ]) {
    model[name] = {
      weights: Float64Array.from(layers[name].weights),
      biases: Float64Array.from(layers[name].biases)
    }
  }
  return model
}

export default exportWeights
