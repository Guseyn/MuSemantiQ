#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import { translateImageToMsq } from '#msq/omr/api.js'
import { modelFromWeights } from '#msq/omr/training/exportWeights.js'
import shippedModel from '#msq/omr/model/shippedModel.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
const scales = String(options.scales || '0.5,1,2,3').split(',').map(Number)
const names = options.all
  ? (await fs.readdir('test/visual-tests/bravura/svg/expected')).filter((name) => name.endsWith('.svg')).map((name) => name.slice(0, -4))
  : String(options.fixtures || 'chords-basics,rhythm-rests,pitch-clefs,structure-connections,score-two-part-invention').split(',')
let loaded
if (options.weights) {
  const { shape, layers, classIds } = JSON.parse(await fs.readFile(options.weights, 'utf8'))
  loaded = { model: modelFromWeights({ shape, layers }), classIds }
} else {
  loaded = shippedModel()
}
const results = []
for (const name of names) {
  const expectedSchema = JSON.parse(await fs.readFile(`test/visual-tests/bravura/page-schema/expected/${name}.json`, 'utf8'))[0]
  const pageLines = [ ...new Set(expectedSchema.measuresParams.map((measure) => measure.pageLineNumber || 1)) ].sort((first, second) => first - second)
  const expectedStaves = pageLines.reduce((total, line) => {
    const measure = expectedSchema.measuresParams.find((candidate) => (candidate.pageLineNumber || 1) === line)
    return total + measure.stavesParams.length
  }, 0)
  const svg = await fs.readFile(`test/visual-tests/bravura/svg/expected/${name}.svg`, 'utf8')
  for (const scale of scales) {
    try {
      const bitmap = rasterizeSvg(svg, { scale })
      const { msqText, diagnostics } = translateImageToMsq(bitmap, { ...loaded, diagnostics: true })
      results.push({
        fixture: name,
        scale,
        expectedStaves,
        actualStaves: diagnostics.staves,
        expectedMeasures: expectedSchema.measuresParams.length,
        actualMeasures: (msqText.match(/^measure$/gm) || []).length,
        systems: diagnostics.systems,
        classes: diagnostics.classes
      })
    } catch (error) {
      results.push({ fixture: name, scale, expectedStaves, expectedMeasures: expectedSchema.measuresParams.length, error: error.message })
    }
  }
}
const summary = {
  cases: results.length,
  staffMatches: results.filter((result) => !result.error && result.actualStaves === result.expectedStaves).length,
  measureMatches: results.filter((result) => !result.error && result.actualMeasures === result.expectedMeasures).length,
  errors: results.filter((result) => result.error).length
}
console.log(JSON.stringify({ summary, results }, null, 2))
