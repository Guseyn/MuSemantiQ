'use strict'

import { mkdirSync, writeFileSync } from 'node:fs'

import { generateTrainingSet } from '#msq/omr/training/generateTrainingSet.js'
import { encodePng } from '#msq/omr/training/encodePng.js'
import { drawableClassIds } from '#msq/omr/training/drawSymbols.js'

/**
 * Contact sheets: what the model is about to see.
 *
 * A sample is a small picture of one symbol, jittered and degraded. This
 * writes samples side by side as a PNG, so the training set can be looked at
 * before it is learned from — the data should be seen, not trusted.
 *
 *   node src/omr/training/inspectDataset.js --class=flat --count=24
 *   node src/omr/training/inspectDataset.js          # one of every class
 */

export function buildContactSheet (samples, gridSize, gap = 2) {
  const columns = Math.ceil(Math.sqrt(samples.length))
  const rows = Math.ceil(samples.length / columns)
  const cell = gridSize + gap
  const sheet = { width: columns * cell + gap, height: rows * cell + gap, grayscale: null }
  sheet.grayscale = new Float32Array(sheet.width * sheet.height)
  samples.forEach((sample, index) => {
    const offsetX = gap + (index % columns) * cell
    const offsetY = gap + Math.floor(index / columns) * cell
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        sheet.grayscale[(offsetY + y) * sheet.width + offsetX + x] = sample.pixels[y * gridSize + x]
      }
    }
  })
  return sheet
}

export function inspectDataset ({ classIds, samplesPerClass = 24, gridSize = 48, seed = 20261110, outPath }) {
  const { samples } = generateTrainingSet({ seed, samplesPerClass, gridSize, classIds })
  const sheet = buildContactSheet(samples, gridSize)
  mkdirSync('training-data/inspection', { recursive: true })
  writeFileSync(outPath, encodePng(sheet))
  return outPath
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const flag = (name) => {
    const found = process.argv.find((argument) => argument.startsWith(`--${name}=`))
    return found ? found.slice(name.length + 3) : null
  }
  const classId = flag('class')
  const count = Number(flag('count') || 24)
  const classIds = classId ? [ classId ] : drawableClassIds
  const outPath = `training-data/inspection/${classId || 'every-class'}.png`
  inspectDataset({ classIds, samplesPerClass: classId ? count : 1, outPath })
  console.log(`${outPath} — ${classId ? `${count} pictures of ${classId}` : 'one picture of every class'}`)
}
