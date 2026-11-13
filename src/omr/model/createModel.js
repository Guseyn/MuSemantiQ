'use strict'

import { createSeededRandom } from '../training/seededRandom.js'

/**
 * The model's numbers, and the shape that holds them.
 *
 * Two convolutions, two pools, one dense layer, one class head — the shape
 * from the docs. Weights start at He scaling (sqrt(2 / fan-in)), drawn from a
 * seeded generator, so one seed gives one model.
 */

export function createModel (shape, seed = 1) {
  const { gridSize, filterSize, filterCounts, denseSize, classCount } = shape
  const [ firstFilters, secondFilters ] = filterCounts
  const random = createSeededRandom(seed)
  const firstPool = Math.floor(gridSize / 2)
  const secondPool = Math.floor(firstPool / 2)
  return {
    shape: { gridSize, filterSize, filterCounts, denseSize, classCount },
    conv1: createLayer(random, filterSize * filterSize * 1, firstFilters),
    conv2: createLayer(random, filterSize * filterSize * firstFilters, secondFilters),
    dense1: createLayer(random, secondPool * secondPool * secondFilters, denseSize),
    dense2: createLayer(random, denseSize, classCount)
  }
}

function createLayer (random, fanIn, fanOut) {
  const scale = Math.sqrt(2 / fanIn)
  const weights = new Float64Array(fanOut * fanIn)
  for (let index = 0; index < weights.length; index++) {
    weights[index] = gaussian(random) * scale
  }
  return { weights, biases: new Float64Array(fanOut) }
}

// Box-Muller on two seeded draws — a bell around 0, which ReLU layers want.
function gaussian (random) {
  const first = Math.max(random(), 1e-12)
  const second = random()
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second)
}

export default createModel
