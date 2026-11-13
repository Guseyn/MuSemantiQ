'use strict'

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'

import { forwardModel } from '#msq/omr/model/forwardModel.js'
import { createModel } from '#msq/omr/model/createModel.js'
import backpropagateModel from '#msq/omr/training/backpropagateModel.js'
import { createAdamState, updateWeightsWithAdam } from '#msq/omr/training/updateWeightsWithAdam.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { generateTrainingSet } from '#msq/omr/training/generateTrainingSet.js'
import { drawableClassIds } from '#msq/omr/training/drawSymbols.js'
import { evaluateModel } from '#msq/omr/training/evaluate.js'
import { exportWeights } from '#msq/omr/training/exportWeights.js'

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
  onEpoch = null,
  onBatch = null
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
    const epochStartedAt = Date.now()
    const order = shuffledIndexes(trainingSamples.length, random)
    const batchesTotal = Math.ceil(trainingSamples.length / batchSize)
    let batchesDone = 0
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
      batchesDone++
      if (onBatch) {
        onBatch({
          epoch,
          batchesDone,
          batchesTotal,
          runningLoss: Math.round(lossTotal / batchesDone / batchSize * 1e6) / 1e6
        })
      }
    }
    const training = evaluateModel({ model, samples: trainingSamples })
    const validation = validationSamples
      ? evaluateModel({ model, samples: validationSamples })
      : training
    history.push({
      epoch,
      epochs,
      loss: Math.round(lossTotal / trainingSamples.length * 1e6) / 1e6,
      accuracy: training.accuracy,
      validationLoss: validation.loss,
      validationAccuracy: validation.accuracy,
      seconds: Math.round((Date.now() - epochStartedAt) / 1000)
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
  // Every value of the run is the user's choice; the defaults are the smoke
  // run — seconds, to see that it works. The production values live in
  // dev-docs/training.html.
  const samplesPerClass = numberFlag('samples-per-class', 40)
  const epochs = numberFlag('epochs', 15)
  const gridSize = numberFlag('grid', 24)
  const filterCounts = listFlag('filters', [ 8, 16 ])
  const denseSize = numberFlag('dense', 24)
  const batchSize = numberFlag('batch', 8)
  const learningRate = numberFlag('learning-rate', 0.01)
  const seed = numberFlag('seed', 20261110)
  const shape = { gridSize, filterSize: 3, filterCounts, denseSize, classCount: 0 }
  const log = (line) => {
    appendFileSync(RUN_LOG, `${line}\n`)
    console.log(line)
  }
  try {
    const startedAt = Date.now()
    log(`=== ${new Date().toISOString()} · seed ${seed} · grid ${gridSize} · filters ${filterCounts.join(',')} · dense ${denseSize} · ${drawableClassIds.length} classes · ${drawableClassIds.length * samplesPerClass} samples · ${epochs} epochs`)
    log(`drawing the training set — ${samplesPerClass} pictures per class…`)
    const generationStartedAt = Date.now()
    const { classIds, samples } = generateTrainingSet({
      seed,
      samplesPerClass,
      gridSize,
      onClass: (classId, index, total) => log(`  ${index}/${total} ${classId}`)
    })
    shape.classCount = classIds.length
    log(`dataset ready in ${durationSince(generationStartedAt)} — ${samples.length} samples`)
    const split = Math.floor(samples.length * 0.8)
    log(`training on ${split} · validating on ${samples.length - split} · batch ${batchSize} · learning rate ${learningRate}`)
    const model = createModel({ ...shape, classCount: classIds.length }, 1)
    let lastBeatAt = Date.now()
    const { history } = trainModel({
      model,
      trainingSamples: samples.slice(0, split),
      validationSamples: samples.slice(split),
      epochs,
      batchSize,
      learningRate,
      onBatch: ({ epoch, batchesDone, batchesTotal, runningLoss }) => {
        const every = Math.max(1, Math.floor(batchesTotal / 4))
        const now = Date.now()
        if (batchesDone % every === 0 || batchesDone === batchesTotal || now - lastBeatAt >= 60000) {
          lastBeatAt = now
          log(`  epoch ${epoch} · ${batchesDone}/${batchesTotal} batches · running loss ${runningLoss}`)
        }
      },
      onEpoch: (entry) => {
        const left = entry.seconds * (epochs - entry.epoch)
        log(`epoch ${entry.epoch}/${epochs} · ${formatDuration(entry.seconds)} · loss ${entry.loss} · accuracy ${entry.accuracy} · validation loss ${entry.validationLoss} · validation ${entry.validationAccuracy}` +
          (left > 0 ? ` · ~${formatDuration(left)} left` : ''))
      }
    })
    const outIndex = process.argv.findIndex((argument) => argument.startsWith('--out='))
    if (outIndex !== -1) {
      const outPath = process.argv[outIndex].slice('--out='.length)
      const { json, hash } = exportWeights(model, classIds)
      writeFileSync(outPath, json)
      log(`weights written to ${outPath}`)
      log(`sha256 ${hash}`)
    }
    const best = history.reduce((winner, entry) =>
      entry.validationAccuracy > winner.validationAccuracy ? entry : winner, history[0])
    log(`✓ done in ${durationSince(startedAt)} — best validation ${best.validationAccuracy} at epoch ${best.epoch}`)
    return { model, history }
  } catch (error) {
    appendFileSync(RUN_LOG, `error: ${error.message}\n${error.stack}\n`)
    throw error
  }
}

function numberFlag (name, fallback) {
  const found = process.argv.find((argument) => argument.startsWith(`--${name}=`))
  return found ? Number(found.slice(name.length + 3)) : fallback
}

function listFlag (name, fallback) {
  const found = process.argv.find((argument) => argument.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3).split(',').map(Number) : fallback
}

function durationSince (startedAt) {
  return formatDuration((Date.now() - startedAt) / 1000)
}

function formatDuration (seconds) {
  if (seconds < 90) {
    return `${Math.round(seconds)}s`
  }
  return seconds < 5400 ? `${Math.round(seconds / 60)}m` : `${Math.round(seconds / 360) / 10}h`
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
