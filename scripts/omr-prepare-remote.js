#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { encodePng } from '#msq/omr/training/encodePng.js'
import loadVisualFixtureSourceRecords from '#msq/omr/training/fullPage/loadVisualFixtureSourceRecords.js'
import loadAllegroBurlescoSourceRecord from '#msq/omr/training/fullPage/loadAllegroBurlescoSourceRecord.js'
import loadTitleSubtitleSourceRecords from '#msq/omr/training/fullPage/loadTitleSubtitleSourceRecords.js'
import generateFullPageRendererDataset from '#msq/omr/training/fullPage/generateFullPageRendererDataset.js'
import createFullPageRemoteRunManifest from '#msq/omr/training/fullPage/createFullPageRemoteRunManifest.js'
import cropFullPageTrainingSamples from '#msq/omr/training/fullPage/cropFullPageTrainingSamples.js'

// Generates a frozen remote-training bundle. This is not recognition testing.
const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
if (!options.out || options.out === true) {
  throw new Error('Pass --out=<remote-bundle-directory>')
}
const output = options.out
await fs.mkdir(output, { recursive: true })
const fixtures = options.fixtures && options.fixtures !== true
  ? String(options.fixtures).split(',').map((name) => name.endsWith('.txt') ? name : `${name}.txt`)
  : null
const sourceRecords = await loadVisualFixtureSourceRecords({ fixtures })
sourceRecords.push(...loadTitleSubtitleSourceRecords())
if (options.allegro !== 'false') {
  sourceRecords.push(await loadAllegroBurlescoSourceRecord())
}
const scales = String(options.scales || '0.5,0.75,1,1.5,2,3').split(',').map(Number)
const variantsPerRecord = Number(options.variants || 1)
const progressEvery = Number(options.progress ?? 10)
if (!Number.isSafeInteger(progressEvery) || progressEvery < 0) {
  throw new Error('progress must be a non-negative integer')
}
const totalSamples = sourceRecords.length * variantsPerRecord * scales.length
let completedSamples = 0
const samples = []
for (const [ scaleIndex, scale ] of scales.entries()) {
  console.log(`scale ${scale} started (${scaleIndex + 1}/${scales.length})`)
  await generateFullPageRendererDataset({
    sourceRecords,
    variantsPerRecord,
    seed: Number(options.seed || 20261115),
    scale,
    localGeometryVariation: Number(options['local-geometry'] ?? 0.15),
    collectSamples: false,
    onSample: async (sample) => {
      const id = `${sample.sampleId}-${scale}`.replace(/[^a-zA-Z0-9_-]+/g, '-')
      const png = encodePng(sample.bitmap)
      await fs.writeFile(`${output}/${id}.png`, png)
      const symbolSamples = cropFullPageTrainingSamples(sample, { gridSize: Number(options.grid || 48) })
      const metadata = {
        ...sample,
        bitmap: undefined,
        png: `${id}.png`,
        sha256: createHash('sha256').update(png).digest('hex'),
        symbolSamples
      }
      await fs.writeFile(`${output}/${id}.json`, JSON.stringify(metadata, null, 2))
      samples.push(metadata)
      completedSamples++
      if (progressEvery > 0 && (completedSamples % progressEvery === 0 || completedSamples === totalSamples)) {
        const percent = Math.round(completedSamples / totalSamples * 100)
        console.log(`progress ${completedSamples}/${totalSamples} (${percent}%) · scale ${scale} · ${sample.mutationMetadata.profile} · ${sample.stylePreset.id} · ${sample.compositionId}`)
      }
    }
  })
  console.log(`scale ${scale} finished (${scaleIndex + 1}/${scales.length})`)
}
const config = {
  scales,
  variantsPerRecord,
  seed: Number(options.seed || 20261115),
  localGeometryVariation: Number(options['local-geometry'] ?? 0.15),
  gridSize: Number(options.grid || 48),
  progressEvery,
  fixtures: fixtures || 'all',
  multilingualTitlesAndSubtitles: true,
  allegroBurlesco: options.allegro !== 'false'
}
const manifest = createFullPageRemoteRunManifest({
  codeVersion: String(options['code-version'] || 'working-tree'),
  dataVersion: String(options['data-version'] || '1'),
  configVersion: String(options['config-version'] || '1'),
  code: String(options['code-version'] || 'working-tree'),
  data: samples,
  config
})
await fs.writeFile(`${output}/manifest.json`, JSON.stringify({ ...manifest, config, samples }, null, 2))
console.log(`remote bundle written to ${output}: ${samples.length} pages`)
