'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import rendererStylePresets from '#msq/omr/training/style/rendererStylePresets.js'

/**
 * A shuffled cycle visits every preset once before the next cycle begins.
 * Deriving the cycle from the index makes selection repeatable without keeping
 * mutable sampler state between pages or workers.
 */
export function selectBalancedRendererStylePreset ({
  seed = 1,
  index = 0,
  presets = rendererStylePresets
} = {}) {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new Error('index must be a non-negative safe integer')
  }
  if (!Array.isArray(presets) || presets.length === 0) {
    throw new Error('presets must be a non-empty array')
  }
  const cycle = Math.floor(index / presets.length)
  const position = index % presets.length
  const cycleSeed = ((seed >>> 0) ^ Math.imul(cycle + 1, 0x9E3779B1)) >>> 0
  const random = createSeededRandom(cycleSeed)
  const order = presets.map((unused, presetIndex) => presetIndex)
  for (let current = order.length - 1; current > 0; current--) {
    const other = Math.floor(random() * (current + 1))
    const value = order[current]
    order[current] = order[other]
    order[other] = value
  }
  return presets[order[position]]
}

export default selectBalancedRendererStylePreset
