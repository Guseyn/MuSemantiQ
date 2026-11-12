#!/usr/bin/env node

'use strict'

/**
 * OMR tests: what a page shows is what the analysis reports.
 *
 * The pages are drawn in code (see test/omr-tests/helpers), so every answer is
 * known exactly: a stave at a known height, a title of a known size, a page
 * turned by a known angle. On failure the numbers under test are written to
 * `test/omr-tests/actual` so they can be diffed and inspected.
 *
 *   node scripts/omr-tests.js                 run them all
 *   node scripts/omr-tests.js --only=staves   run the ones whose name matches
 */

import fs from 'fs/promises'
import assert from 'assert'

import { readBitmapFromImage, analyzeImage } from '#msq/omr/api.js'
import removeStaffLines from '#msq/omr/analysis/removeStaffLines.js'
import findSymbolComponents from '#msq/omr/analysis/findSymbolComponents.js'
import splitTouchingComponents from '#msq/omr/analysis/splitTouchingComponents.js'
import classifyComponent from '#msq/omr/analysis/classifyComponent.js'
import { createModel } from '#msq/omr/model/createModel.js'
import { forwardModel } from '#msq/omr/model/forwardModel.js'
import backpropagateModel from '#msq/omr/training/backpropagateModel.js'
import { trainModel } from '#msq/omr/training/train.js'
import { generateTrainingSet } from '#msq/omr/training/generateTrainingSet.js'
import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import { drawEllipse, drawFilledRect, createBitmap as createPlainBitmap } from '#msq/omr/training/drawBitmap.js'
import {
  createBitmap,
  drawStave,
  drawFilledRect as drawTextBlock
} from '../test/omr-tests/helpers/buildScoreBitmap.js'

const ROOT = 'test/omr-tests'

const green = (text) => `\x1b[32m${text}\x1b[0m`
const red = (text) => `\x1b[31m${text}\x1b[0m`

function near (actual, expected, tolerance, what) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: expected ${expected} ± ${tolerance}, got ${actual}`
  )
}

// How close the nearest ReLU gate is to its corner at zero.
function distanceFromReluCorners (cache) {
  let nearest = Infinity
  for (const values of [ cache.conv1.values, cache.conv2.values, cache.dense1 ]) {
    for (const value of values) {
      nearest = Math.min(nearest, Math.abs(value))
    }
  }
  return nearest
}

function cleanPage () {
  const bitmap = createBitmap(600, 400)
  drawStave(bitmap, 80, 560, 120, 12)
  drawStave(bitmap, 80, 560, 180, 12)
  drawTextBlock(bitmap, 220, 40, 160, 12) // the title
  drawTextBlock(bitmap, 20, 132, 40, 12) // the instrument name
  return bitmap
}

const TESTS = [
  {
    name: 'readBitmapFromImage turns pixels into ink',
    run () {
      const data = [
        255, 255, 255, 255,
        0, 0, 0, 255,
        128, 128, 128, 255,
        255, 0, 0, 255
      ]
      const { grayscale } = readBitmapFromImage({ width: 4, height: 1, data })
      near(grayscale[0], 0, 1e-6, 'white paper')
      near(grayscale[1], 1, 1e-6, 'black ink')
      near(grayscale[2], 1 - 128 / 255, 1e-6, 'mid gray')
      near(grayscale[3], 1 - 0.299, 1e-6, 'red by luma')
    }
  },
  {
    name: 'detectStaves finds lines on a clean page',
    run () {
      const bitmap = createBitmap(600, 300)
      drawStave(bitmap, 50, 550, 60, 12)
      const { staves, staffSpaceHeightPx } = analyzeImage(bitmap)
      assert.strictEqual(staves.length, 1, 'one stave')
      near(staffSpaceHeightPx, 12, 0.3, 'staff space')
      staves[0].linesY.forEach((line, index) => near(line, 60 + index * 12, 1, `line ${index}`))
      near(staves[0].xStart, 50, 1, 'stave starts at its first line ink')
      near(staves[0].xEnd, 550, 1, 'stave ends at its last line ink')
    }
  },
  {
    name: 'analyzeImage reads a clean page',
    run () {
      const { staves, systems, textBlocks, measuredStyles, colors, staffSpaceHeightPx } =
        analyzeImage(cleanPage())
      near(staffSpaceHeightPx, 12, 0.3, 'staff space')
      assert.strictEqual(staves.length, 2, 'two staves')
      assert.strictEqual(systems.length, 1, 'close staves form one system')
      assert.deepStrictEqual(staves.map((stave) => stave.systemIndex), [ 0, 0 ], 'both staves in the system')
      const roles = textBlocks.map((block) => block.role)
      assert.ok(roles.includes('title'), `title found, got ${roles}`)
      assert.ok(roles.includes('instrument'), `instrument found, got ${roles}`)
      near(measuredStyles.titleFontSize, 1, 0.1, 'title size in staff spaces')
      near(measuredStyles.instrumentFontSize, 1, 0.1, 'instrument size in staff spaces')
      assert.strictEqual(colors.background, '#ffffff', 'paper is white')
      assert.strictEqual(colors.staveLines, '#000000', 'stave lines are black')
      assert.strictEqual(colors.text, '#000000', 'words are black')
    }
  },
  {
    name: 'analyzeImage separates two systems',
    run () {
      const bitmap = createBitmap(600, 400)
      drawStave(bitmap, 80, 560, 60, 12)
      drawStave(bitmap, 80, 560, 260, 12)
      const { staves, systems } = analyzeImage(bitmap)
      assert.strictEqual(staves.length, 2, 'two staves')
      assert.strictEqual(systems.length, 2, 'distant staves are two systems')
      assert.deepStrictEqual(staves.map((stave) => stave.systemIndex), [ 0, 1 ], 'one stave per system')
    }
  },
  {
    name: 'analyzeImage straightens a tilted page',
    run () {
      const slope = Math.tan(0.8 * Math.PI / 180)
      const bitmap = createBitmap(600, 400)
      drawStave(bitmap, 80, 560, 200, 12, slope)
      const { staves, skewAngleInDegrees, staffSpaceHeightPx } = analyzeImage(bitmap)
      near(skewAngleInDegrees, 0.8, 0.3, 'tilt of the page')
      assert.strictEqual(staves.length, 1, 'the stave survives the tilt')
      near(staffSpaceHeightPx, 12, 0.5, 'staff space after straightening')
      staves[0].linesY.forEach((line, index) => near(line, 200 + index * 12, 2, `line ${index}`))
    }
  },
  {
    name: 'analyzeImage is deterministic',
    run () {
      const first = analyzeImage(cleanPage())
      const second = analyzeImage(cleanPage())
      assert.strictEqual(
        JSON.stringify(first),
        JSON.stringify(second),
        'the same page gives byte-identical numbers'
      )
    }
  },
  {
    name: 'removeStaffLines keeps heads and drops lines',
    run () {
      const bitmap = createPlainBitmap(300, 200)
      drawStave(bitmap, 20, 280, 60, 12)
      drawEllipse(bitmap, 150, 84, 10, 6) // a head sitting on the middle line
      const stave = { linesY: [ 60, 72, 84, 96, 108 ], xStart: 20, xEnd: 280, staffSpaceHeightPx: 12 }
      const cleaned = removeStaffLines(bitmap, [ stave ])
      assert.ok(cleaned.grayscale[84 * 300 + 150] > 0.5, 'head ink survives')
      assert.ok(cleaned.grayscale[60 * 300 + 50] < 0.5, 'line ink is gone away from the head')
      assert.ok(cleaned.grayscale[108 * 300 + 260] < 0.5, 'every line row is gone')
    }
  },
  {
    name: 'findSymbolComponents finds each blob',
    run () {
      const bitmap = createPlainBitmap(200, 120)
      drawEllipse(bitmap, 40, 60, 10, 6)
      drawEllipse(bitmap, 100, 40, 8, 5)
      drawFilledRect(bitmap, 150, 30, 6, 20)
      const components = findSymbolComponents(bitmap)
      assert.strictEqual(components.length, 3, 'three blobs, three components')
      near(components[0].box.x, 30, 1, 'first blob x')
      near(components[1].box.x, 92, 1, 'second blob x')
      near(components[2].box.h, 20, 1, 'third blob height')
    }
  },
  {
    name: 'splitTouchingComponents pulls touching symbols apart',
    run () {
      const bitmap = createPlainBitmap(120, 60)
      drawEllipse(bitmap, 35, 30, 9, 6)
      drawEllipse(bitmap, 52, 30, 9, 6) // touching the first
      const components = findSymbolComponents(bitmap)
      assert.strictEqual(components.length, 1, 'flood fill sees one blob')
      const split = splitTouchingComponents(bitmap, components)
      assert.strictEqual(split.length, 2, 'the valley splits it in two')
    }
  },
  {
    name: 'backpropagation matches numerical gradients',
    run () {
      const shape = { gridSize: 8, filterSize: 3, filterCounts: [ 2, 3 ], denseSize: 4, classCount: 3 }
      const classIds = [ 'notehead-filled', 'sharp', 'flat' ]
      const model = createModel(shape, 11)
      const { samples } = generateTrainingSet({ seed: 5, samplesPerClass: 3, gridSize: 8, classIds })
      // Two corners lie in wait: paper pixels give a pre-activation of exactly
      // zero (no derivative there), and a gate near zero turns the loss into a
      // corner at the perturbed point. So the crop is jittered by a hair, and
      // the check runs on the first sample whose gates are all well away.
      const jitter = createSeededRandom(99)
      const epsilon = 1e-7
      const candidates = samples.map((candidate) => ({
        ...candidate,
        pixels: Float64Array.from(candidate.pixels, (value) => value + (jitter() - 0.5) * 0.01)
      }))
      const sample = candidates.find((candidate) =>
        distanceFromReluCorners(forwardModel(model, candidate.pixels).cache) > 100 * epsilon
      )
      assert.ok(sample, 'a sample away from the corners')
      const forward = forwardModel(model, sample.pixels)
      const analytic = backpropagateModel(model, forward, sample.classIndex)
      const lossOf = (candidate) =>
        -Math.log(forwardModel(candidate, sample.pixels).probabilities[sample.classIndex])
      for (const name of [ 'conv1', 'conv2', 'dense1', 'dense2' ]) {
        for (const kind of [ 'weights', 'biases' ]) {
          const gradient = kind === 'weights' ? analytic[name].gradWeights : analytic[name].gradBiases
          for (const index of [ 0, Math.floor(gradient.length / 2), gradient.length - 1 ]) {
            const original = model[name][kind][index]
            model[name][kind][index] = original + epsilon
            const up = lossOf(model)
            model[name][kind][index] = original - epsilon
            const down = lossOf(model)
            model[name][kind][index] = original
            const numerical = (up - down) / (2 * epsilon)
            const difference = Math.abs(gradient[index] - numerical)
            assert.ok(
              difference <= 1e-5 + 1e-3 * Math.max(Math.abs(gradient[index]), Math.abs(numerical)),
              `${name}.${kind}[${index}]: analytic ${gradient[index]}, numerical ${numerical}`
            )
          }
        }
      }
    }
  },
  {
    name: 'training learns a small set',
    run () {
      const classIds = [ 'notehead-filled', 'notehead-open', 'sharp', 'flat' ]
      const { samples } = generateTrainingSet({ seed: 21, samplesPerClass: 6, gridSize: 12, classIds })
      const model = createModel(
        { gridSize: 12, filterSize: 3, filterCounts: [ 4, 8 ], denseSize: 12, classCount: classIds.length },
        3
      )
      const { history } = trainModel({
        model,
        trainingSamples: samples,
        epochs: 60,
        batchSize: 8,
        learningRate: 0.01,
        l2: 0.0005,
        seed: 2
      })
      const first = history[0]
      const last = history[history.length - 1]
      assert.ok(last.loss < first.loss / 3, `loss fell: ${first.loss} → ${last.loss}`)
      assert.ok(last.accuracy >= 0.95, `training accuracy: ${last.accuracy}`)
    }
  },
  {
    name: 'classifyComponent answers with a class or unknown',
    run () {
      const classIds = [ 'notehead-filled', 'notehead-open', 'sharp', 'flat' ]
      const model = createModel(
        { gridSize: 12, filterSize: 3, filterCounts: [ 4, 8 ], denseSize: 12, classCount: classIds.length },
        3
      )
      const { samples } = generateTrainingSet({ seed: 33, samplesPerClass: 1, gridSize: 12, classIds })
      const answer = classifyComponent(model, samples[0].pixels, classIds, 0)
      assert.ok(classIds.includes(answer.className), `a class from the table, got ${answer.className}`)
      assert.strictEqual(answer.className, answer.candidates[0].className, 'the answer is the best candidate')
      assert.ok(answer.confidence >= 0 && answer.confidence <= 1, 'confidence is a probability')
      const unknown = classifyComponent(model, samples[0].pixels, classIds, 1.1)
      assert.strictEqual(unknown.className, 'unknown', 'below the floor the answer is unknown')
      assert.ok(unknown.isUnknown, 'and it says so')
    }
  }
]

async function run () {
  const only = process.argv.find((argument) => argument.startsWith('--only='))
  const filter = only ? only.slice('--only='.length) : ''
  const chosen = TESTS.filter((test) => test.name.includes(filter))
  await fs.mkdir(`${ROOT}/actual`, { recursive: true })
  const failed = []
  for (const test of chosen) {
    try {
      await test.run()
      console.log(green('✓'), test.name)
    } catch (error) {
      failed.push(test.name)
      console.log(red('✗'), test.name)
      console.log(`  ${error.message}`)
      await fs.writeFile(
        `${ROOT}/actual/${test.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`,
        JSON.stringify({ name: test.name, message: error.message }, null, 2)
      )
    }
  }
  console.log(`\n${chosen.length - failed.length}/${chosen.length} passed`)
  if (failed.length) {
    process.exitCode = 1
  }
}

run()
