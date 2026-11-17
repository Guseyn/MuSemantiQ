#!/usr/bin/env node

'use strict'

import fs from 'node:fs'
import { createHash } from 'node:crypto'
import loadModelArtifact from '#msq/omr/model/loadModelArtifact.js'
import createCharacterClassifier from '#msq/omr/ocr/createCharacterClassifier.js'

const options = Object.fromEntries(process.argv.slice(2).map((argument) => {
  const match = argument.match(/^--([^=]+)(?:=(.*))?$/)
  return match ? [ match[1], match[2] ?? true ] : [ argument, true ]
}))
for (const name of [ 'symbols', 'ocr', 'out' ]) {
  if (!options[name] || options[name] === true) {
    throw new Error(`Pass --${name}=<path>`)
  }
}
const symbolJson = fs.readFileSync(options.symbols, 'utf8')
const ocrJson = fs.readFileSync(options.ocr, 'utf8')
const symbols = JSON.parse(symbolJson)
const ocr = JSON.parse(ocrJson)
loadModelArtifact(symbols)
createCharacterClassifier(ocr)
const combined = {
  ...symbols,
  ocr,
  metadata: {
    type: 'mu-semanti-q-omr-candidate',
    version: 1,
    symbolSha256: createHash('sha256').update(symbolJson).digest('hex'),
    ocrSha256: createHash('sha256').update(ocrJson).digest('hex')
  }
}
fs.writeFileSync(options.out, JSON.stringify(combined))
console.log(`combined candidate written to ${options.out}`)
