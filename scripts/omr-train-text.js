#!/usr/bin/env node

'use strict'

import fs from 'node:fs'
import { createModel } from '#msq/omr/model/createModel.js'
import { trainModel } from '#msq/omr/training/train.js'
import generateTextOcrTrainingSet from '#msq/omr/training/text/generateTextOcrTrainingSet.js'
import { exportWeights } from '#msq/omr/training/exportWeights.js'

// This entry point is run manually on the remote trainer, never by tests.
const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
const runDirectory = options.out || `training-data/text-runs/${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`
fs.mkdirSync(runDirectory, { recursive: true })
const log = (line) => {
  fs.appendFileSync(`${runDirectory}/training.log`, `${line}\n`)
  console.log(line)
}
log(`training started (pid ${process.pid})`)
const seed = Number(options.seed || 20261115)
const gridSize = Number(options.grid || 48)
const epochs = Number(options.epochs || 20)
const samplesPerCharacter = Number(options['samples-per-character'] || 4)
const generated = await generateTextOcrTrainingSet({ seed, gridSize, samplesPerCharacter })
const { classIds } = generated
const model = createModel({
  gridSize,
  filterSize: 3,
  filterCounts: [ 8, 16 ],
  denseSize: Number(options.dense || 64),
  classCount: classIds.length
}, seed)
const validationSamples = generated.samples.filter((sample, index) => index % 5 === 0)
const { model: bestModel, history } = await trainModel({
  model,
  trainingSamples: generated.samples.filter((sample, index) => index % 5 !== 0),
  trainingSamplesForEpoch: async (epoch) => {
    const fresh = await generateTextOcrTrainingSet({ seed: seed + epoch, gridSize, samplesPerCharacter })
    return fresh.samples.filter((sample, index) => index % 5 !== 0)
  },
  validationSamples,
  epochs,
  batchSize: Number(options.batch || 32),
  learningRate: Number(options['learning-rate'] || 0.001),
  seed,
  onEpoch: (entry) => log(JSON.stringify(entry))
})
const { json, hash } = exportWeights(bestModel, classIds)
fs.writeFileSync(`${runDirectory}/best-weights.json`, json)
fs.writeFileSync(`${runDirectory}/history.json`, JSON.stringify(history, null, 2))
fs.writeFileSync(`${runDirectory}/manifest.json`, JSON.stringify({
  type: 'six-language-text-ocr-training',
  seed,
  gridSize,
  samples: generated.samples.length,
  validationSamples: validationSamples.length,
  sha256: hash
}, null, 2))
log(`best weights written to ${runDirectory}/best-weights.json`)
log(`sha256 ${hash}`)
