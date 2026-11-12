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
import {
  createBitmap,
  drawStave,
  drawFilledRect
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

function cleanPage () {
  const bitmap = createBitmap(600, 400)
  drawStave(bitmap, 80, 560, 120, 12)
  drawStave(bitmap, 80, 560, 180, 12)
  drawFilledRect(bitmap, 220, 40, 160, 12) // the title
  drawFilledRect(bitmap, 20, 132, 40, 12) // the instrument name
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
