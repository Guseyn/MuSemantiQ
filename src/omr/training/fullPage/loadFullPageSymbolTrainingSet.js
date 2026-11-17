'use strict'

import fs from 'node:fs/promises'
import rendererSymbolDefinitions from '#msq/omr/training/rendererSymbolDefinitions.js'
import { classifiedClassIds } from '#msq/omr/analysis/symbolClasses.js'
import { drawSymbolSample } from '#msq/omr/training/drawSymbols.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { resampleToGrid } from '#msq/omr/training/cropComponents.js'

export async function loadFullPageSymbolTrainingSet ({
  manifestPath,
  split = null,
  gridSize = null,
  otherSamples = 100,
  seed = 1
} = {}) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  const classIds = classifiedClassIds.filter((classId) => classId === 'other' || rendererSymbolDefinitions[classId])
  const outputGridSize = gridSize || manifest.config.gridSize || 48
  const samples = manifest.samples.flatMap((sample) => sample.split === split || split === null ? sample.symbolSamples : [])
  const remapped = samples.map((sample) => ({
    ...sample,
    pixels: split === null || sample.split === split ? resampleSample(sample.pixels, outputGridSize) : null,
    classIndex: classIds.indexOf(sample.classId)
  })).filter((sample) => sample.pixels && sample.classIndex >= 0)
  const random = createSeededRandom(seed)
  const otherIndex = classIds.indexOf('other')
  for (let index = 0; index < otherSamples; index++) {
    remapped.push({
      pixels: Array.from(drawSymbolSample('other', outputGridSize, random).grayscale),
      classId: 'other',
      classIndex: otherIndex,
      compositionId: 'synthetic-hard-negative',
      split: split || 'train'
    })
  }
  return { classIds, samples: remapped, manifest }
}

function resampleSample (pixels, gridSize) {
  const inputSize = Math.sqrt(pixels.length)
  if (!Number.isInteger(inputSize)) {
    throw new Error('Symbol sample pixels must be a square grid')
  }
  if (inputSize === gridSize) {
    return pixels
  }
  return Array.from(resampleToGrid(
    { width: inputSize, height: inputSize, grayscale: pixels },
    { x1: 0, y1: 0, x2: inputSize, y2: inputSize },
    gridSize
  ))
}

export default loadFullPageSymbolTrainingSet
