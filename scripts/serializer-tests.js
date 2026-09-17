#!/usr/bin/env node

/**
 * Serializer tests: a parsed page, written back out, parses to the same page.
 *
 * Every test is four static input files — the page schema, the custom styles,
 * the midi settings and the comments, exactly as the parser produces them — and
 * one expected output file, the MSQ source they should be written back as.
 *
 * A run does two things with them:
 *
 *   1. serializes the inputs and compares the text against `msq/expected`,
 *      which pins the wording down so a change to it has to be looked at;
 *   2. parses that text back and compares all four results against the inputs
 *      it started from, which is what makes it a round trip rather than a
 *      snapshot.
 *
 * Whatever a run produces is written to the matching `actual` folder, so a
 * failure can be diffed and, once it is the intended output, adopted by copying
 * over the expected one.
 *
 *   node scripts/serializer-tests.js              run them all
 *   node scripts/serializer-tests.js --only=slur  run the ones whose name matches
 */

import fs from 'fs/promises'
import path from 'path'
import assert from 'assert'

import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages
} from '#msq/api.js'
import serialize from '#msq/language/serializer/serialize.js'

const ROOT = 'test/serializer-tests'

/*
The four inputs, each named by the folder holding it and the field of the parse
it has to come back as.
*/
const INPUTS = [
  { folder: 'page-schema', field: 'pageSchemaForEachPage' },
  { folder: 'custom-styles', field: 'customStylesForEachPage' },
  { folder: 'midi-settings', field: 'midiSettingsForEachPage' },
  { folder: 'comments', field: 'commentsForEachPage' }
]

const green = (text) => `\x1b[32m${text}\x1b[0m`
const red = (text) => `\x1b[31m${text}\x1b[0m`

const only = process.argv.find((argument) => argument.startsWith('--only='))
const pattern = only ? only.slice('--only='.length) : null

const supportedFontSources = await setupFonts()
const supportedFontNames = {
  'chord-letters': Object.keys(supportedFontSources['chord-letters']),
  'music': Object.keys(supportedFontSources['music']),
  'text': [ ...new Set([
    ...Object.keys(supportedFontSources['text']['regular']),
    ...Object.keys(supportedFontSources['text']['bold'])
  ]) ]
}

const testNames = (await fs.readdir(`${ROOT}/page-schema/expected`))
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.basename(file, '.json'))
  .filter((name) => !pattern || name.includes(pattern))
  .sort()

const listOfFailedTests = []
const listOfPassedTests = []

console.time('Total time spent for serializer tests')

for (const testName of testNames) {
  let msqText = ''
  let testType

  try {
    testType = 'reading input files'
    const inputs = await Promise.all(
      INPUTS.map(({ folder }) => fs.readFile(`${ROOT}/${folder}/expected/${testName}.json`, 'utf-8'))
    )
    const [ pageSchema, customStyles, midiSettings, comments ] = inputs.map(JSON.parse)

    msqText = serialize(pageSchema, customStyles, midiSettings, comments)
    await fs.writeFile(`${ROOT}/msq/actual/${testName}.txt`, msqText)

    testType = 'msq'
    const expectedMsqText = await fs.readFile(`${ROOT}/msq/expected/${testName}.txt`, 'utf-8')
    assert.strictEqual(msqText, expectedMsqText, `${red('Failed')} for "${testName}" test`)
    process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)

    const parsed = generateIntermediateStructuresForMultiplePages({
      multiplePagesText: [ msqText ],
      supportedFontNames
    })

    /*
    Everything the run produced is written out before anything is asserted, so a
    failing test leaves a complete set of actual files to diff against.
    */
    const produced = INPUTS.map(({ field }) => JSON.stringify(parsed[field][0] ?? null))
    await Promise.all(
      INPUTS.map(({ folder }, index) =>
        fs.writeFile(`${ROOT}/${folder}/actual/${testName}.json`, produced[index])
      )
    )

    testType = 'errors'
    assert.deepStrictEqual(
      parsed.errorsForEachPage.flat(),
      [],
      `${red('Failed')} for "${testName}" test`
    )
    process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)

    for (const [ index, { folder } ] of INPUTS.entries()) {
      testType = folder
      assert.strictEqual(produced[index], inputs[index], `${red('Failed')} for "${testName}" test`)
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
    }

    process.stdout.write('\n')
    listOfPassedTests.push({ name: testName })
  } catch (error) {
    process.stdout.write(`"${testName}" ${red('failed')} for ${testType}\n\n`)
    listOfFailedTests.push({ name: testName, testType })
  }
}

console.timeEnd('Total time spent for serializer tests')

await fs.writeFile(`${ROOT}/list-of-failed-tests.json`, JSON.stringify(listOfFailedTests))
await fs.writeFile(`${ROOT}/list-of-passed-tests.json`, JSON.stringify(listOfPassedTests))

if (listOfFailedTests.length > 0) {
  throw new Error(
    `There are (${listOfFailedTests.length}) failed serializer tests ` +
    `out of ${testNames.length}.\n\n`
  )
} else {
  process.stdout.write(`All ${testNames.length} serializer tests passed.\n\n`)
}
