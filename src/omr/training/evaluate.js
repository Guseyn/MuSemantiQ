'use strict'

import { forwardModel } from '../model/forwardModel.js'

/**
 * How the model is doing, as pictures' worth of numbers.
 *
 * The confusion matrix is the report card: the diagonal is right answers,
 * bright cells off it are the mix-ups to fix. `worst` keeps the confident
 * mistakes — the ones worth looking at first.
 */

export function evaluateModel ({ model, samples, worstCount = 10 }) {
  const classCount = model.shape.classCount
  const confusion = Array.from({ length: classCount }, () => new Array(classCount).fill(0))
  const mistakes = []
  let correct = 0
  for (let index = 0; index < samples.length; index++) {
    const sample = samples[index]
    const { probabilities } = forwardModel(model, sample.pixels)
    const predicted = argmax(probabilities)
    confusion[sample.classIndex][predicted]++
    if (predicted === sample.classIndex) {
      correct++
    } else {
      mistakes.push({
        index,
        expected: sample.classId,
        predictedIndex: predicted,
        confidence: Math.round(probabilities[predicted] * 1e4) / 1e4
      })
    }
  }
  return {
    accuracy: samples.length ? Math.round(correct / samples.length * 1e4) / 1e4 : 0,
    confusion,
    worst: mistakes
      .sort((first, second) => second.confidence - first.confidence)
      .slice(0, worstCount)
  }
}

function argmax (values) {
  let best = 0
  for (let index = 1; index < values.length; index++) {
    if (values[index] > values[best]) {
      best = index
    }
  }
  return best
}

export default evaluateModel
