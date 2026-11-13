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
import assignPitchByStaffPosition from '#msq/omr/translation/assignPitchByStaffPosition.js'
import inferDurationFromNoteShapes from '#msq/omr/translation/inferDurationFromNoteShapes.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { drawableSymbols } from '#msq/omr/training/drawSymbols.js'
import { translateImageToMsq } from '#msq/omr/translateImageToMsq.js'
import { translateImagesToMsqPages } from '#msq/omr/translateImagesToMsqPages.js'
import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'
import {
  drawEllipse,
  drawFilledRect,
  drawLine,
  createBitmap as createPlainBitmap
} from '#msq/omr/training/drawBitmap.js'
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

// The classifier stand-in: the drawn page says what each blob is, so the
// rules under test see exact classes. The learned model swaps in later.
function classifyByPositions (drawn) {
  return (pixels, box) => {
    const centerX = box.x + box.w / 2
    const centerY = box.y + box.h / 2
    const nearest = drawn
      .map((symbol) => ({ ...symbol, distance: Math.hypot(symbol.x - centerX, symbol.y - centerY) }))
      .sort((first, second) => first.distance - second.distance)[0]
    const known = nearest.distance <= 15
    return {
      className: known ? nearest.classId : 'unknown',
      confidence: known ? (nearest.confidence ?? 1) : 0,
      candidates: []
    }
  }
}

function examplePage () {
  const bitmap = createPlainBitmap(600, 400)
  drawStave(bitmap, 100, 520, 200, 12)
  drawFilledRect(bitmap, 110, 196, 10, 30) // the clef
  drawFilledRect(bitmap, 150, 202, 10, 10) // the time signature, over
  drawFilledRect(bitmap, 150, 226, 10, 10) // and under the middle
  // measure 1: c5 quarter, a4 flat quarter, f4 dotted quarter
  drawEllipse(bitmap, 220, 218, 8, 5.5)
  drawLine(bitmap, 228, 216, 228, 178, 2)
  drawFilledRect(bitmap, 280, 225, 6, 10) // the flat before a4
  drawEllipse(bitmap, 300, 230, 8, 5.5)
  drawLine(bitmap, 308, 228, 308, 190, 2)
  drawEllipse(bitmap, 380, 242, 8, 5.5)
  drawLine(bitmap, 387, 240, 387, 202, 2)
  drawEllipse(bitmap, 392, 242, 2.5, 2.5) // its dot
  drawLine(bitmap, 450, 188, 450, 262, 2) // the barline
  // measure 2: two beamed eighths on b4 and a4, beamed above the stave
  drawEllipse(bitmap, 480, 224, 8, 5.5)
  drawLine(bitmap, 488, 226, 488, 192, 2)
  drawEllipse(bitmap, 520, 230, 8, 5.5)
  drawLine(bitmap, 528, 232, 528, 192, 2)
  drawLine(bitmap, 480, 192, 535, 192, 4) // the beam
  const drawn = [
    { x: 115, y: 211, classId: 'clef-treble' },
    { x: 155, y: 207, classId: 'digit-4' },
    { x: 155, y: 231, classId: 'digit-4' },
    { x: 220, y: 218, classId: 'notehead-filled', confidence: 0.5 }, // the shaky one
    { x: 283, y: 230, classId: 'flat' },
    { x: 300, y: 230, classId: 'notehead-filled' },
    { x: 392, y: 242, classId: 'dot' },
    { x: 380, y: 242, classId: 'notehead-filled' },
    { x: 480, y: 224, classId: 'notehead-filled' },
    { x: 520, y: 230, classId: 'notehead-filled' }
  ]
  return { bitmap, drawn, classify: classifyByPositions(drawn) }
}

// page 1 of a project: the key and meter live here
function keyAndMeterPage () {
  const bitmap = createPlainBitmap(600, 400)
  drawStave(bitmap, 100, 520, 200, 12)
  drawFilledRect(bitmap, 110, 196, 10, 30) // the clef
  drawFilledRect(bitmap, 140, 225, 6, 10) // three flats —
  drawFilledRect(bitmap, 160, 225, 6, 10) // the key of
  drawFilledRect(bitmap, 180, 225, 6, 10) // a flat major
  drawFilledRect(bitmap, 210, 202, 10, 10) // 4 over 4
  drawFilledRect(bitmap, 210, 226, 10, 10)
  drawEllipse(bitmap, 300, 230, 8, 5.5)
  drawLine(bitmap, 308, 228, 308, 190, 2)
  const drawn = [
    { x: 115, y: 211, classId: 'clef-treble' },
    { x: 143, y: 230, classId: 'flat' },
    { x: 163, y: 230, classId: 'flat' },
    { x: 183, y: 230, classId: 'flat' },
    { x: 215, y: 207, classId: 'digit-4' },
    { x: 215, y: 231, classId: 'digit-4' },
    { x: 300, y: 230, classId: 'notehead-filled' }
  ]
  return { bitmap, drawn, classify: classifyByPositions(drawn) }
}

// page 2 of the same project: the music continues, nothing is re-declared
function continuationPage () {
  const bitmap = createPlainBitmap(600, 400)
  drawStave(bitmap, 100, 520, 200, 12)
  drawFilledRect(bitmap, 110, 196, 10, 30)
  drawEllipse(bitmap, 300, 230, 8, 5.5)
  drawLine(bitmap, 308, 228, 308, 190, 2)
  const drawn = [
    { x: 115, y: 211, classId: 'clef-treble' },
    { x: 300, y: 230, classId: 'notehead-filled' }
  ]
  return { bitmap, drawn, classify: classifyByPositions(drawn) }
}

async function compareWithExpected (name, actual) {
  let expected
  try {
    expected = await fs.readFile(`${ROOT}/expected/${name}`, 'utf8')
  } catch {
    await fs.writeFile(`${ROOT}/actual/${name}`, actual)
    assert.fail(`${name}: no expected file yet — wrote actual/${name}; adopt it when it is right`)
  }
  if (expected !== actual) {
    await fs.writeFile(`${ROOT}/actual/${name}`, actual)
    assert.fail(`${name}: differs from expected — wrote actual/${name} for diffing`)
  }
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
  },
  {
    name: 'assignPitchByStaffPosition reads the grid',
    run () {
      assert.deepStrictEqual(assignPitchByStaffPosition(0, 'treble'), { noteName: 'f', octaveNumber: '5' })
      assert.deepStrictEqual(assignPitchByStaffPosition(4, 'treble'), { noteName: 'b', octaveNumber: '4' })
      assert.deepStrictEqual(assignPitchByStaffPosition(10, 'treble'), { noteName: 'c', octaveNumber: '4' })
      assert.deepStrictEqual(assignPitchByStaffPosition(0, 'bass'), { noteName: 'a', octaveNumber: '3' })
      assert.deepStrictEqual(assignPitchByStaffPosition(2, 'bass'), { noteName: 'f', octaveNumber: '3' })
    }
  },
  {
    name: 'inferDurationFromNoteShapes reads the shapes',
    run () {
      assert.strictEqual(inferDurationFromNoteShapes({ isOpenHead: true, hasStem: false }), 1)
      assert.strictEqual(inferDurationFromNoteShapes({ isOpenHead: true, hasStem: true }), 0.5)
      assert.strictEqual(inferDurationFromNoteShapes({ isOpenHead: false, hasStem: true }), 0.25)
      assert.strictEqual(inferDurationFromNoteShapes({ isOpenHead: false, hasStem: true, beamCount: 1 }), 0.125)
      assert.strictEqual(inferDurationFromNoteShapes({ isOpenHead: false, hasStem: true, flagCount: 2 }), 0.0625)
    }
  },
  {
    name: 'translateImageToMsq reads a drawn page',
    run () {
      const { bitmap, classify } = examplePage()
      const { msqText, report } = translateImageToMsq(bitmap, { classify })
      assert.ok(msqText.includes('treble clef'), 'the clef is named')
      assert.ok(msqText.includes('time signature is 4:4'), 'the meter is named')
      // the beam is geometry and no class says so yet — the report says it
      assert.ok(report.uncertain.length >= 1, 'the unclassified beam goes to the report')

      // the shaky c5 links to its unit and to its line in the text
      const linked = report.uncertain.find((entry) => entry.className === 'notehead-filled')
      assert.deepStrictEqual(
        { measure: linked.unit.measureIndex, stave: linked.unit.staveIndex, voice: linked.unit.voiceIndex, unit: linked.unit.unitIndex },
        { measure: 0, stave: 0, voice: 0, unit: 0 },
        'the shaky note links to its unit'
      )
      assert.ok(msqText.split('\n')[linked.msqLine - 1].includes('c5'), 'and to its line in the text')

      const parsed = generateIntermediateStructuresForSinglePage({ pageText: msqText })
      assert.deepStrictEqual(parsed.errors, [], 'the text parses with no errors')
      const measures = parsed.pageSchema.measuresParams
      assert.strictEqual(measures.length, 2, 'the barline made two measures')
      const first = measures[0].stavesParams[0].voicesParams[0]
      assert.strictEqual(first.length, 4, 'three notes and the rest the measure needed')
      assert.deepStrictEqual(
        { noteName: first[0].notes[0].noteName, octaveNumber: first[0].notes[0].octaveNumber },
        { noteName: 'c', octaveNumber: '5' },
        'c5'
      )
      assert.strictEqual(first[1].keysParams[0].keyType, 'flatKey', 'the flat is a key on a4')
      assert.strictEqual(first[2].numberOfDots, 1, 'the dot is counted')
      assert.strictEqual(first[3].isRest, true, 'the measure is filled with a rest')
      const second = measures[1].stavesParams[0].voicesParams[0]
      assert.strictEqual(second[0].unitDuration, 0.125, 'a beamed eighth')
      assert.strictEqual(second[0].beamedWithNext, true, 'beamed with its neighbour')
    }
  },
  {
    name: 'translateImagesToMsqPages carries key and meter across pages',
    run () {
      const first = keyAndMeterPage()
      const second = continuationPage()
      const classify = classifyByPositions([ ...first.drawn, ...second.drawn ])
      const { pagesText } = translateImagesToMsqPages([ first.bitmap, second.bitmap ], { classify })
      assert.ok(pagesText[0].includes('key signature is e flat major'), 'page 1 declares the key')
      assert.ok(pagesText[0].includes('time signature is 4:4'), 'page 1 declares the meter')
      assert.ok(pagesText[1].includes('key signature is e flat major'), 'the key carries to page 2')
      assert.ok(pagesText[1].includes('time signature is 4:4'), 'the meter carries to page 2')
      for (const pageText of pagesText) {
        const parsed = generateIntermediateStructuresForSinglePage({ pageText })
        assert.deepStrictEqual(parsed.errors, [], 'both pages parse with no errors')
      }
    }
  },
  {
    name: 'golden: one page is byte stable',
    async run () {
      const page = examplePage()
      const { msqText } = translateImageToMsq(page.bitmap, { classify: page.classify })
      await compareWithExpected('golden-page.msq', msqText)
    }
  },
  {
    name: 'golden: a carried two-page project is byte stable',
    async run () {
      const first = keyAndMeterPage()
      const second = continuationPage()
      const classify = classifyByPositions([ ...first.drawn, ...second.drawn ])
      const { pagesText } = translateImagesToMsqPages([ first.bitmap, second.bitmap ], { classify })
      await compareWithExpected('golden-project-page-1.msq', pagesText[0])
      await compareWithExpected('golden-project-page-2.msq', pagesText[1])
    }
  },
  {
    name: 'a new symbol class costs a row, samples and one rule',
    run () {
      // the extensibility audit: ghost-head joined the pipeline as one row in
      // symbolClasses (with role 'head'), one shape in drawSymbols, and one
      // isGhost rule in buildNoteUnit. Nothing else was touched — the rules
      // matched it through its role the moment the row existed.
      assert.strictEqual(roleOf('ghost-head'), 'head', 'the row puts it among the heads')

      const { classIds, samples } = generateTrainingSet({ seed: 44, samplesPerClass: 1, gridSize: 12 })
      assert.ok(classIds.includes('ghost-head'), 'the generator draws it without being told')
      assert.strictEqual(
        samples.filter((sample) => sample.classId === 'ghost-head').length,
        1,
        'with its label, for free'
      )

      const bitmap = createPlainBitmap(600, 400)
      drawStave(bitmap, 100, 520, 200, 12)
      drawFilledRect(bitmap, 110, 196, 10, 30) // the clef
      drawableSymbols['ghost-head'](bitmap, 220, 218, 14, () => 0.5) // the ghost head
      drawLine(bitmap, 228, 216, 228, 178, 2) // its stem
      const classify = classifyByPositions([
        { x: 115, y: 211, classId: 'clef-treble' },
        { x: 220, y: 218, classId: 'ghost-head' }
      ])
      const { msqText } = translateImageToMsq(bitmap, { classify })
      assert.ok(msqText.includes('is ghost'), 'and one rule turns it into MSQ')
      const parsed = generateIntermediateStructuresForSinglePage({ pageText: msqText })
      assert.deepStrictEqual(parsed.errors, [], 'the page still parses')
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
