#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import path from 'node:path'
import loadModelArtifact from '#msq/omr/model/loadModelArtifact.js'
import { decodeImageToGrayscale, translateImageToMsq } from '#msq/omr/api.js'
import parseAndSerializeGeneratedMsq from '#msq/omr/canonical/parseAndSerializeGeneratedMsq.js'
import compareVisiblePageSchemas from '#msq/omr/canonical/compareVisiblePageSchemas.js'
import compareVisibleCustomStyles from '#msq/omr/canonical/compareVisibleCustomStyles.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
if (!options.weights || !options.data) {
  throw new Error('Pass --weights=<candidate.json> and --data=<remote-bundle/manifest.json>')
}
const weights = JSON.parse(await fs.readFile(options.weights, 'utf8'))
const loaded = loadModelArtifact(weights)
const manifestPath = options.data
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const directory = path.dirname(manifestPath)
const results = []
for (const sample of manifest.samples) {
  const base = {
    sampleId: sample.sampleId,
    split: sample.split,
    stylePreset: sample.stylePreset.id,
    mutationProfile: sample.mutationMetadata.profile,
    accepted: false,
    differences: [],
    styleDifferences: [],
    uncertain: 0,
    ignored: 0
  }
  try {
    const bitmap = decodeImageToGrayscale(await fs.readFile(path.join(directory, sample.png)))
    const { msqText, report, status, diagnostics } = translateImageToMsq(bitmap, { ...loaded, diagnostics: true })
    const parsed = parseAndSerializeGeneratedMsq(msqText)
    if (parsed.errors.length) {
      results.push({ ...base, error: parsed.errors.map((error) => error.message).join('; ') })
      continue
    }
    const expected = sample.canonicalMsq ? parseAndSerializeGeneratedMsq(sample.canonicalMsq) : null
    const comparison = compareVisiblePageSchemas(sample.canonicalPageSchema, parsed.pageSchema)
    const styleComparison = compareVisibleCustomStyles(expected?.customStyles, parsed.customStyles, {
      numericTolerance: Number(options['style-tolerance'] || 0)
    })
    results.push({
      ...base,
      accepted: status === 'accepted' && comparison.equal && styleComparison.equal && report.uncertain.length === 0 && report.ignored.length === 0,
      status,
      differences: comparison.differences,
      styleDifferences: styleComparison.differences,
      uncertain: report.uncertain.length,
      ignored: report.ignored.length,
      msqText,
      diagnostics
    })
  } catch (error) {
    results.push({ ...base, error: error.message })
  }
}
const summary = {
  cases: results.length,
  accepted: results.filter((result) => result.accepted).length,
  semanticMismatches: results.filter((result) => result.differences.length).length,
  styleMismatches: results.filter((result) => result.styleDifferences.length).length,
  uncertain: results.reduce((sum, result) => sum + result.uncertain, 0),
  ignored: results.reduce((sum, result) => sum + result.ignored, 0),
  errors: results.filter((result) => result.error).length
}
console.log(JSON.stringify({ weights: options.weights, data: manifestPath, summary, results }, null, 2))
if (summary.accepted !== summary.cases) {
  process.exitCode = 1
}
