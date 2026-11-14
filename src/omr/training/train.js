'use strict'

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'

import { forwardModel } from '#msq/omr/model/forwardModel.js'
import { createModel } from '#msq/omr/model/createModel.js'
import backpropagateModel from '#msq/omr/training/backpropagateModel.js'
import { createAdamState, updateWeightsWithAdam } from '#msq/omr/training/updateWeightsWithAdam.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { generateTrainingSet } from '#msq/omr/training/generateTrainingSet.js'
import { generateRendererTrainingSet } from '#msq/omr/training/generateRendererTrainingSet.js'
import { drawableClassIds } from '#msq/omr/training/drawSymbols.js'
import { evaluateModel } from '#msq/omr/training/evaluate.js'
import { exportWeights } from '#msq/omr/training/exportWeights.js'

/**
 * The training loop: show a batch, guess, measure how wrong, nudge.
 *
 * Reported loss is cross-entropy only. The `l2` option keeps its CLI name but
 * means decoupled AdamW decay on weights, not an L2 term in the gradients or
 * loss. Shuffling is seeded — one seed, one run. Each epoch reports the loss
 * and both accuracies; the model with the lowest validation loss is kept.
 */

const LAYER_NAMES = [ 'conv1', 'conv2', 'dense1', 'dense2' ]

export async function trainModel ({
  model,
  trainingSamples,
  trainingSamplesForEpoch = null,
  validationSamples,
  epochs,
  batchSize = 32,
  learningRate = 0.001,
  l2 = 0.0005,
  seed = 1,
  earlyStoppingPatience = 5,
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
  let best = { loss: Infinity, weights: null }
  let epochsSinceBest = 0
  for (let epoch = 1; epoch <= epochs; epoch++) {
    const epochStartedAt = Date.now()
    const epochTrainingSamples = trainingSamplesForEpoch ? await trainingSamplesForEpoch(epoch) : trainingSamples
    const order = shuffledIndexes(epochTrainingSamples.length, random)
    const batchesTotal = Math.ceil(epochTrainingSamples.length / batchSize)
    let batchesDone = 0
    let samplesDone = 0
    let lossTotal = 0
    for (let start = 0; start < order.length; start += batchSize) {
      const batch = order.slice(start, start + batchSize)
      const gradients = freshGradients(model)
      for (const index of batch) {
        const sample = epochTrainingSamples[index]
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
        updateWeightsWithAdam({
          weights: model[name].weights,
          gradWeights: gradients[name].gradWeights,
          state: states[name].weights,
          learningRate,
          step,
          weightDecay: l2
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
      samplesDone += batch.length
      if (onBatch) {
        onBatch({
          epoch,
          batchesDone,
          batchesTotal,
          runningLoss: Math.round(lossTotal / samplesDone * 1e6) / 1e6
        })
      }
    }
    const training = evaluateModel({ model, samples: epochTrainingSamples })
    const validation = validationSamples
      ? evaluateModel({ model, samples: validationSamples })
      : training
    history.push({
      epoch,
      epochs,
      loss: Math.round(lossTotal / epochTrainingSamples.length * 1e6) / 1e6,
      accuracy: training.accuracy,
      validationLoss: validation.loss,
      validationAccuracy: validation.accuracy,
      seconds: Math.round((Date.now() - epochStartedAt) / 1000)
    })
    if (onEpoch) {
      onEpoch(history[history.length - 1])
    }
    if (validation.rawLoss < best.loss) {
      best = { loss: validation.rawLoss, weights: copyWeights(model) }
      epochsSinceBest = 0
    } else {
      epochsSinceBest++
      if (earlyStoppingPatience > 0 && epochsSinceBest >= earlyStoppingPatience) {
        break
      }
    }
  }
  return { model: best.weights ? { ...model, ...best.weights } : model, history }
}

// Every run owns its records, so a later run cannot overwrite the evidence
// for the weights being tested.
export async function runTraining () {
  const runDirectory = `training-data/runs/${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`
  mkdirSync(runDirectory, { recursive: true })
  const runLog = `${runDirectory}/training.log`
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
  const dataset = stringFlag('dataset', 'renderer')
  if (![ 'templates', 'renderer' ].includes(dataset)) {
    throw new Error(`unknown dataset: ${dataset}`)
  }
  const validationMode = stringFlag('validation', 'font')
  if (![ 'font', 'mixed' ].includes(validationMode)) {
    throw new Error(`unknown validation mode: ${validationMode}`)
  }
  const generateSamples = dataset === 'renderer' ? generateRendererTrainingSet : generateTrainingSet
  const shape = { gridSize, filterSize: 3, filterCounts, denseSize, classCount: 0 }
  const log = (line) => {
    appendFileSync(runLog, `${line}\n`)
    console.log(line)
  }
  try {
    const startedAt = Date.now()
    log(`run directory ${runDirectory}`)
    log(`=== ${new Date().toISOString()} · dataset ${dataset} · seed ${seed} · grid ${gridSize} · filters ${filterCounts.join(',')} · dense ${denseSize} · ${drawableClassIds.length} classes · ${epochs} epochs`)
    log(`drawing the training set — ${samplesPerClass} pictures per class…`)
    const generationStartedAt = Date.now()
    const { classIds, samples } = await generateSamples({
      seed,
      samplesPerClass,
      gridSize,
      onClass: (classId, index, total) => log(`  ${index}/${total} ${classId}`)
    })
    shape.classCount = classIds.length
    log(`dataset ready in ${durationSince(generationStartedAt)} — ${samples.length} samples`)
    const split = Math.floor(samples.length * 0.8)
    const holdOutLeland = dataset === 'renderer' && validationMode === 'font'
    const trainingSamples = holdOutLeland
      ? samples.filter((sample) => sample.font !== 'leland')
      : samples.slice(0, split)
    const validationSamples = holdOutLeland
      ? samples.filter((sample) => sample.font === 'leland')
      : samples.slice(split)
    log(`training on ${trainingSamples.length} · validating on ${validationSamples.length} · validation ${validationMode} · batch ${batchSize} · learning rate ${learningRate}`)
    const model = createModel({ ...shape, classCount: classIds.length }, seed)
    let lastBeatAt = Date.now()
    const { model: bestModel, history } = await trainModel({
      model,
      trainingSamples,
      trainingSamplesForEpoch: async (epoch) => {
        const generated = await generateSamples({ seed: seed + epoch, samplesPerClass, gridSize })
        return holdOutLeland
          ? generated.samples.filter((sample) => sample.font !== 'leland')
          : generated.samples
      },
      validationSamples,
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
    const { json, hash } = exportWeights(bestModel, classIds)
    writeFileSync(`${runDirectory}/best-weights.json`, json)
    writeFileSync(`${runDirectory}/history.json`, JSON.stringify(history, null, 2))
    log(`best weights written to ${runDirectory}/best-weights.json`)
    log(`sha256 ${hash}`)
    const outIndex = process.argv.findIndex((argument) => argument.startsWith('--out='))
    if (outIndex !== -1) {
      const outPath = process.argv[outIndex].slice('--out='.length)
      writeFileSync(outPath, json)
      log(`weights written to ${outPath}`)
    }
    const best = history.reduce((winner, entry) =>
      entry.validationLoss < winner.validationLoss ? entry : winner, history[0])
    log(`✓ done in ${durationSince(startedAt)} — best validation loss ${best.validationLoss} at epoch ${best.epoch}`)
    return { model: bestModel, history }
  } catch (error) {
    appendFileSync(runLog, `error: ${error.message}\n${error.stack}\n`)
    throw error
  }
}

function stringFlag (name, fallback) {
  const found = process.argv.find((argument) => argument.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3) : fallback
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
  await runTraining()
}
