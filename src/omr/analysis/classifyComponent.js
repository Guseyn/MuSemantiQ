'use strict'

import { forwardModel } from '#msq/omr/model/forwardModel.js'

/**
 * What one blob of ink is — or `unknown`.
 *
 * The model gives probabilities; the answer is the best class only when it is
 * sure enough (max p ≥ τ). Below that the honest answer is `unknown`, and the
 * candidates go to the report instead of the page.
 */

const DEFAULT_THRESHOLD = 0.8

export function classifyComponent (model, pixels, classIds, threshold = DEFAULT_THRESHOLD) {
  const { probabilities } = forwardModel(model, pixels)
  const candidates = classIds
    .map((className, classIndex) => ({
      className,
      probability: Math.round(probabilities[classIndex] * 1e4) / 1e4
    }))
    .sort((first, second) => second.probability - first.probability)
  const best = candidates[0]
  return {
    className: best.probability >= threshold ? best.className : 'unknown',
    confidence: best.probability,
    isUnknown: best.probability < threshold,
    candidates: candidates.slice(0, 3)
  }
}

export default classifyComponent
