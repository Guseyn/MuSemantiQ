#!/usr/bin/env node

'use strict'

import fs from 'node:fs'
import { createModel } from '#msq/omr/model/createModel.js'
import { trainModel } from '#msq/omr/training/train.js'
import loadFullPageSymbolTrainingSet from '#msq/omr/training/fullPage/loadFullPageSymbolTrainingSet.js'
import { exportWeights } from '#msq/omr/training/exportWeights.js'
import { applyDegradations } from '#msq/omr/training/applyDegradations.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { generateRendererTrainingSet } from '#msq/omr/training/generateRendererTrainingSet.js'

// Manual remote entry point. The bundle was frozen before this process starts.
const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
if (!options.data || !options.out) {
  throw new Error('Pass --data=<remote-bundle/manifest.json> and --out=<run-directory>')
}
const runDirectory = options.out
fs.mkdirSync(runDirectory, { recursive: true })
const seed = Number(options.seed || 20261115)
const gridSize = Number(options.grid || 48)
const training = await loadFullPageSymbolTrainingSet({ manifestPath: options.data, split: 'train', gridSize, seed })
const validation = await loadFullPageSymbolTrainingSet({ manifestPath: options.data, split: 'validation', gridSize, otherSamples: 20, seed: seed + 1 })
const { classIds } = training
const log = (line) => {
  fs.appendFileSync(`${runDirectory}/training.log`, `${line}\n`)
  console.log(line)
}
log(`data loaded: ${training.samples.length} training · ${validation.samples.length} validation`)
const isolatedPerClass = Number(options['isolated-per-class'] ?? 0)
if (isolatedPerClass > 0) {
  log(`generating isolated renderer samples: ${isolatedPerClass} per class`)
}
const isolated = isolatedPerClass > 0
  ? await generateRendererTrainingSet({ seed, samplesPerClass: isolatedPerClass, gridSize, classIds })
  : { samples: [] }
const trainingSamples = [ ...training.samples, ...isolated.samples ]
const validationSamples = [ ...validation.samples, ...isolated.samples.filter((sample, index) => index % 5 === 0) ]
const model = createModel({
  gridSize,
  filterSize: 3,
  filterCounts: String(options.filters || '8,16').split(',').map(Number),
  denseSize: Number(options.dense || 64),
  classCount: classIds.length
}, seed)
log(`model created; starting training`)
const { model: bestModel, history } = await trainModel({
  model,
  trainingSamples,
  trainingSamplesForEpoch: async (epoch) => {
    const random = createSeededRandom(seed + epoch)
    return trainingSamples.map((sample) => ({
      ...sample,
      pixels: Array.from(applyDegradations({ width: gridSize, height: gridSize, grayscale: Float32Array.from(sample.pixels) }, random).grayscale)
    }))
  },
  validationSamples,
  epochs: Number(options.epochs || 20),
  batchSize: Number(options.batch || 32),
  learningRate: Number(options['learning-rate'] || 0.001),
  seed,
  onBatch: ({ epoch, batchesDone, batchesTotal, runningLoss }) => {
    if (batchesDone % 25 === 0 || batchesDone === batchesTotal) {
      log(`epoch ${epoch} · batch ${batchesDone}/${batchesTotal} · running loss ${runningLoss}`)
    }
  },
  onEpoch: (entry) => log(JSON.stringify(entry))
})
const { json, hash } = exportWeights(bestModel, classIds)
fs.writeFileSync(`${runDirectory}/best-weights.json`, json)
fs.writeFileSync(`${runDirectory}/history.json`, JSON.stringify(history, null, 2))
fs.writeFileSync(`${runDirectory}/manifest.json`, JSON.stringify({
  type: 'full-page-symbol-training',
  data: options.data,
  seed,
  gridSize,
  trainingSamples: trainingSamples.length,
  validationSamples: validationSamples.length,
  sha256: hash
}, null, 2))
log(`best weights written to ${runDirectory}/best-weights.json`)
log(`sha256 ${hash}`)
