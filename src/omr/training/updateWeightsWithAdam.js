'use strict'

/**
 * The nudge: Adam.
 *
 * Each learned number gets its step scaled by how big its gradients have been
 * lately (v) and pointed by which way they have been pointing (m). The
 * correction for the first steps (m̂, v̂) matters — they start at zero.
 */

const BETA_1 = 0.9
const BETA_2 = 0.999
const EPSILON = 1e-8

export function createAdamState (length) {
  return { m: new Float64Array(length), v: new Float64Array(length) }
}

export function updateWeightsWithAdam ({ weights, gradWeights, state, learningRate, step }) {
  const correction1 = 1 - BETA_1 ** step
  const correction2 = 1 - BETA_2 ** step
  for (let index = 0; index < weights.length; index++) {
    const gradient = gradWeights[index]
    state.m[index] = BETA_1 * state.m[index] + (1 - BETA_1) * gradient
    state.v[index] = BETA_2 * state.v[index] + (1 - BETA_2) * gradient * gradient
    const direction = state.m[index] / correction1
    const scale = Math.sqrt(state.v[index] / correction2) + EPSILON
    weights[index] -= learningRate * direction / scale
  }
}

export default updateWeightsWithAdam
