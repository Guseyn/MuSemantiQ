#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import { modelFromWeights } from '#msq/omr/training/exportWeights.js'
import { generateRendererTrainingSet } from '#msq/omr/training/generateRendererTrainingSet.js'
import { evaluateModel } from '#msq/omr/training/evaluate.js'
import { decodeImageToGrayscale, translateImageToMsq } from '#msq/omr/api.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
const weightsPath = options.weights || 'src/omr/model/weights.json'
const { shape, layers, classIds } = JSON.parse(await fs.readFile(weightsPath, 'utf8'))
const model = modelFromWeights({ shape, layers })
const { samples } = await generateRendererTrainingSet({
  seed: Number(options.seed || 777),
  samplesPerClass: 1,
  gridSize: shape.gridSize
})
const renderer = {}
for (const font of [ 'bravura', 'leland' ]) {
  const result = evaluateModel({ model, samples: samples.filter((sample) => sample.font === font) })
  renderer[font] = { loss: result.loss, accuracy: result.accuracy, worst: result.worst.slice(0, 5) }
}
const result = {
  weights: weightsPath,
  renderer,
  realFixture: null
}
if (options.fixture !== false) {
  const bitmap = decodeImageToGrayscale(await fs.readFile(options.fixture || 'omr-cli-app/score.png'))
  const { msqText, report, diagnostics } = translateImageToMsq(bitmap, { model, classIds, diagnostics: true })
  result.realFixture = {
    measures: (msqText.match(/^measure$/gm) || []).length,
    uncertain: report.uncertain.length,
    ignored: report.ignored.length,
    diagnostics
  }
  if (options.out) {
    await fs.writeFile(options.out, msqText)
  }
}
console.log(JSON.stringify(result, null, 2))
