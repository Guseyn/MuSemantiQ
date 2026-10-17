'use strict'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import parseLanguage from '#msq/language/parser/parseLanguage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// One large input built from every MSQ fixture (a realistic mix of the whole language).
const msqDir = path.join(projectRoot, 'test', 'visual-tests', 'leland', 'msq')
const files = fs.readdirSync(msqDir).filter((f) => f.endsWith('.txt'))
const input = files
  .map((f) => fs.readFileSync(path.join(msqDir, f), 'utf-8'))
  .join('\n\n')

// run the highlight adapter too: that's the code path the regexp → token
// replacement actually changed (the main scenarios use the untouched token objects)
const adapterNames = process.argv.includes('--no-adapter') ? [] : [ 'highlight' ]

// warm up so V8 optimises the hot path before we time it
parseLanguage(input, [], { adapterNames })

const iterations = Number(process.argv[2]) || 500
const start = process.hrtime.bigint()
for (let i = 0; i < iterations; i++) {
  parseLanguage(input, [], { adapterNames })
}
const end = process.hrtime.bigint()

const totalMs = Number(end - start) / 1e6
const perParse = totalMs / iterations

console.log(`input: ${input.length} chars across ${files.length} fixtures`)
console.log(`iterations: ${iterations}`)
console.log(`total: ${totalMs.toFixed(1)} ms`)
console.log(`per parse: ${perParse.toFixed(4)} ms`)
console.log(`parses/sec: ${(1000 / perParse).toFixed(0)}`)
