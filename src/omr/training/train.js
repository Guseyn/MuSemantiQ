'use strict'

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'

import { forwardModel } from '../model/forwardModel.js'
import { createModel } from '../model/createModel.js'
import backpropagateModel from './backpropagateModel.js'
import { createAdamState, updateWeightsWithAdam } from './updateWeightsWithAdam.js'
import { createSeededRandom } from './seededRandom.js'
import { generateTrainingSet } from './generateTrainingSet.js'
import { evaluateModel } from './evaluate.js'
import { exportWeights } from './exportWeights.js'

/**
 * The training loop: show a batch, guess, measure how wrong, nudge.
 *
 * Loss is cross-entropy over the batch plus a small L2 penalty so weights
 * cannot grow into memorizing. Shuffling is seeded — one seed, one run. Each
 * epoch reports the loss and both accuracies; the best model is kept.
 */

const LAYER_NAMES = [ 'conv1', 'conv2', 'dense1', 'dense2' ]

export function trainModel ({
  model,
  trainingSamples,
  validationSamples,
  epochs,
  batchSize = 32,
  learningRate = 0.001,
  l2 = 0.0005,
  seed = 1,
  onEpoch = null
}) {
  const random = createSeededRandom(seed)
  const states = {}
  for (const name of LAYER_NAMES) {
    states[name] = {
      weights: createAdamState(model[name].weights.length),
      biases: createAdamState(model[name].biases.length)
    }
  }
  const history = []
  let step = 0
  let best = { accuracy: -1, weights: null }
  for (let epoch = 1; epoch <= epochs; epoch++) {
    const order = shuffledIndexes(trainingSamples.length, random)
    let lossTotal = 0
    for (let start = 0; start < order.length; start += batchSize) {
      const batch = order.slice(start, start + batchSize)
      const gradients = freshGradients(model)
      for (const index of batch) {
        const sample = trainingSamples[index]
        const forward = forwardModel(model, sample.pixels)
        lossTotal += -Math.log(Math.max(forward.probabilities[sample.classIndex], 1e-12))
        const sampleGradients = backpropagateModel(model, forward, sample.classIndex)
        for (const name of LAYER_NAMES) {
          addInto(gradients[name].gradWeights, sampleGradients[name].gradWeights)
          addInto(gradients[name].gradBiases, sampleGradients[name].gradBiases)
        }
      }
      step++
      for (const name of LAYER_NAMES) {
        scale(gradients[name].gradWeights, 1 / batch.length)
        scale(gradients[name].gradBiases, 1 / batch.length)
        addL2(gradients[name].gradWeights, model[name].weights, l2)
        updateWeightsWithAdam({
          weights: model[name].weights,
          gradWeights: gradients[name].gradWeights,
          state: states[name].weights,
          learningRate,
          step
        })
        updateWeightsWithAdam({
          weights: model[name].biases,
          gradWeights: gradients[name].gradBiases,
          state: states[name].biases,
          learningRate,
          step
        })
      }
    }
    const training = evaluateModel({ model, samples: trainingSamples })
    const validation = validationSamples
      ? evaluateModel({ model, samples: validationSamples })
      : training
    history.push({
      epoch,
      loss: Math.round(lossTotal / trainingSamples.length * 1e6) / 1e6,
      accuracy: training.accuracy,
      validationAccuracy: validation.accuracy
    })
    if (onEpoch) {
      onEpoch(history[history.length - 1])
    }
    if (validation.accuracy > best.accuracy) {
      best = { accuracy: validation.accuracy, weights: copyWeights(model) }
    }
  }
  return { model: best.weights ? { ...model, ...best.weights } : model, history }
}

// The run's own record: what was trained, how it went, what came out. It is
// appended to, so the history of runs survives, and it is what `tail -f`
// watches — no shell redirection needed.
const RUN_LOG = 'training-data/training.log'

export function runTraining () {
  mkdirSync('training-data', { recursive: true })
  const shape = { gridSize: 24, filterSize: 3, filterCounts: [ 8, 16 ], denseSize: 24, classCount: 9 }
  const seed = 20261110
  const { classIds, samples } = generateTrainingSet({ seed, samplesPerClass: 40, gridSize: shape.gridSize })
  const log = (line) => {
    appendFileSync(RUN_LOG, `${line}\n`)
    console.log(line)
  }
  try {
    log(`=== ${new Date().toISOString()} · seed ${seed} · grid ${shape.gridSize} · ${classIds.length} classes · ${samples.length} samples · 15 epochs`)
    const split = Math.floor(samples.length * 0.8)
    const model = createModel({ ...shape, classCount: classIds.length }, 1)
    const { history } = trainModel({
      model,
      trainingSamples: samples.slice(0, split),
      validationSamples: samples.slice(split),
      epochs: 15,
      batchSize: 8,
      learningRate: 0.01,
      onEpoch: (entry) => log(
        `epoch ${entry.epoch}: loss ${entry.loss}, accuracy ${entry.accuracy}, validation ${entry.validationAccuracy}`
      )
    })
    const outIndex = process.argv.findIndex((argument) => argument.startsWith('--out='))
    if (outIndex !== -1) {
      const outPath = process.argv[outIndex].slice('--out='.length)
      const { json, hash } = exportWeights(model, classIds)
      writeFileSync(outPath, json)
      log(`weights written to ${outPath}`)
      log(`sha256 ${hash}`)
    }
    return { model, history }
  } catch (error) {
    appendFileSync(RUN_LOG, `error: ${error.message}\n${error.stack}\n`)
    throw error
  }
}

function shuffledIndexes (length, random) {
  const indexes = Array.from({ length }, (_, index) => index)
  for (let index = length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[ indexes[index], indexes[swap] ] = [ indexes[swap], indexes[index] ]
  }
  return indexes
}

function freshGradients (model) {
  const gradients = {}
  for (const name of LAYER_NAMES) {
    gradients[name] = {
      gradWeights: new Float64Array(model[name].weights.length),
      gradBiases: new Float64Array(model[name].biases.length)
    }
  }
  return gradients
}

function addInto (target, source) {
  for (let index = 0; index < target.length; index++) {
    target[index] += source[index]
  }
}

function scale (values, factor) {
  for (let index = 0; index < values.length; index++) {
    values[index] *= factor
  }
}

function addL2 (gradWeights, weights, l2) {
  for (let index = 0; index < gradWeights.length; index++) {
    gradWeights[index] += 2 * l2 * weights[index]
  }
}

function copyWeights (model) {
  const copy = {}
  for (const name of LAYER_NAMES) {
    copy[name] = {
      weights: new Float64Array(model[name].weights),
      biases: new Float64Array(model[name].biases)
    }
  }
  return copy
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runTraining()
}
