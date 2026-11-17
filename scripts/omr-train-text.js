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
const batchSize = Number(options.batch || 32)
const learningRate = Number(options['learning-rate'] || 0.001)
const samplesPerCharacter = Number(options['samples-per-character'] || 4)
log(`generating initial training samples (${samplesPerCharacter} per character)`)
const generated = await generateTextOcrTrainingSet({ seed, gridSize, samplesPerCharacter })
const { classIds } = generated
log(`text OCR: ${classIds.length} characters across six languages from rendered glyph crops · ${generated.samples.length} samples · grid ${gridSize}×${gridSize} · ${epochs} epochs · batch ${batchSize} · lr ${learningRate}`)
const model = createModel({
  gridSize,
  filterSize: 3,
  filterCounts: [ 8, 16 ],
  denseSize: Number(options.dense || 64),
  classCount: classIds.length
}, seed)
log(`model created; starting training`)
const validationSamples = generated.samples.filter((sample, index) => index % 5 === 0)
const { model: bestModel, history } = await trainModel({
  model,
  trainingSamples: generated.samples.filter((sample, index) => index % 5 !== 0),
  trainingSamplesForEpoch: async (epoch) => {
    log(`generating training samples for epoch ${epoch}`)
    const fresh = await generateTextOcrTrainingSet({ seed: seed + epoch, gridSize, samplesPerCharacter })
    return fresh.samples.filter((sample, index) => index % 5 !== 0)
  },
  validationSamples,
  epochs,
  batchSize,
  learningRate,
  seed,
  onBatch: ({ epoch, batchesDone, batchesTotal, runningLoss }) => {
    const every = Math.max(1, Math.floor(batchesTotal / 4))
    if (batchesDone % every === 0 || batchesDone === batchesTotal) {
      log(`epoch ${epoch} · batch ${batchesDone}/${batchesTotal} · running loss ${runningLoss}`)
    }
  },
  onEpoch: (entry) => log(JSON.stringify(entry)),
  onEarlyStop: ({ epoch, epochs, patience, bestEpoch, bestLoss }) => {
    log(`early stopping at epoch ${epoch}/${epochs} — validation loss has not improved for ${patience} epochs (best ${bestLoss} at epoch ${bestEpoch})`)
  }
})
const bestEntry = history.reduce((winner, entry) => entry.validationLoss < winner.validationLoss ? entry : winner)
log(`training finished: ${history.length}/${epochs} epochs · best validation loss ${bestEntry.validationLoss} at epoch ${bestEntry.epoch}`)
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
