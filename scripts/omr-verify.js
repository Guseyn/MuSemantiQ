#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import path from 'node:path'
import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import { translateImageToMsq } from '#msq/omr/api.js'
import loadModelArtifact from '#msq/omr/model/loadModelArtifact.js'
import parseAndSerializeGeneratedMsq from '#msq/omr/canonical/parseAndSerializeGeneratedMsq.js'
import compareVisiblePageSchemas from '#msq/omr/canonical/compareVisiblePageSchemas.js'
import compareVisibleCustomStyles from '#msq/omr/canonical/compareVisibleCustomStyles.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
if (!options.weights || options.weights === true) {
  throw new Error('Pass --weights=<candidate-weights.json>; OMR verification never runs without weights')
}
const weights = JSON.parse(await fs.readFile(options.weights, 'utf8'))
const loaded = loadModelArtifact(weights)
const scales = String(options.scales || '0.5,0.75,1,1.5,2,3').split(',').map(Number)
const fixtureFont = String(options['fixture-font'] || 'bravura')
if (![ 'bravura', 'leland' ].includes(fixtureFont)) {
  throw new Error('fixture-font must be bravura or leland')
}
const fixtureDirectory = `test/visual-tests/${fixtureFont}`
const names = options.all
  ? (await fs.readdir(`${fixtureDirectory}/svg/expected`)).filter((name) => name.endsWith('.svg')).map((name) => name.slice(0, -4))
  : String(options.fixtures || 'chords-basics,rhythm-rests,pitch-clefs,structure-connections,score-two-part-invention').split(',')
const results = []
for (const name of names) {
  const [ expectedPageSchema ] = JSON.parse(await fs.readFile(`${fixtureDirectory}/page-schema/expected/${name}.json`, 'utf8'))
  const [ expectedCustomStyles ] = JSON.parse(await fs.readFile(`${fixtureDirectory}/custom-styles/expected/${name}.json`, 'utf8'))
  const svg = await fs.readFile(`${fixtureDirectory}/svg/expected/${name}.svg`, 'utf8')
  for (const scale of scales) {
    const result = await verifyPage({ name, scale, svg, expectedPageSchema, expectedCustomStyles, loaded })
    results.push(result)
    if (!result.accepted && options.out) {
      await writeFailureArtifact(result, options.out)
    }
  }
}
const summary = {
  cases: results.length,
  accepted: results.filter((result) => result.accepted).length,
  semanticMismatches: results.filter((result) => result.differences.length > 0).length,
  styleMismatches: results.filter((result) => result.styleDifferences.length > 0).length,
  uncertain: results.reduce((sum, result) => sum + result.uncertain, 0),
  ignored: results.reduce((sum, result) => sum + result.ignored, 0),
  errors: results.filter((result) => result.error).length
}
console.log(JSON.stringify({ weights: options.weights, fixtureFont, summary, results }, null, 2))
if (summary.accepted !== summary.cases) {
  process.exitCode = 1
}

async function verifyPage ({ name, scale, svg, expectedPageSchema, expectedCustomStyles, loaded }) {
  const base = { fixture: name, scale, accepted: false, differences: [], styleDifferences: [], uncertain: 0, ignored: 0 }
  try {
    const bitmap = rasterizeSvg(svg, { scale })
    const { msqText, report, status, diagnostics } = translateImageToMsq(bitmap, { ...loaded, diagnostics: true })
    const parsed = parseAndSerializeGeneratedMsq(msqText)
    if (parsed.errors.length) {
      return { ...base, msqText, diagnostics, error: parsed.errors.map((error) => error.message).join('; ') }
    }
    const comparison = compareVisiblePageSchemas(expectedPageSchema, parsed.pageSchema)
    const styleComparison = compareVisibleCustomStyles(expectedCustomStyles, parsed.customStyles, {
      numericTolerance: Number(options['style-tolerance'] || 0)
    })
    return {
      ...base,
      accepted: status === 'accepted' && comparison.equal && styleComparison.equal && report.uncertain.length === 0 && report.ignored.length === 0,
      status,
      differences: comparison.differences,
      styleDifferences: styleComparison.differences,
      uncertain: report.uncertain.length,
      ignored: report.ignored.length,
      msqText,
      serializedMsq: parsed.serializedMsq,
      diagnostics
    }
  } catch (error) {
    return { ...base, error: error.message }
  }
}

async function writeFailureArtifact (result, directory) {
  await fs.mkdir(directory, { recursive: true })
  const name = `${fixtureFont}-${result.fixture}-${String(result.scale).replace('.', '_')}`
  await fs.writeFile(path.join(directory, `${name}.json`), JSON.stringify(result, null, 2))
  if (result.msqText) {
    await fs.writeFile(path.join(directory, `${name}.msq`), result.msqText)
  }
}
