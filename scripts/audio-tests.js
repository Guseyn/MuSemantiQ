import fs from 'fs/promises'
import path from 'path'
import assert from 'assert'

// API
import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages,
  areAllPageSchemasValid,
  generateStylesForMultiplePages,
  generateMidiForMultiplePages,
  generateSvgForMultiplePages,
} from '#msq/api.js'

const PAGE_DELIMITER = '====next page===='
const EMPTY_STRING = ''

// Every test tree lives under test/ ; a runner only ever writes inside its own.
const ROOT = 'test/audio-tests'

const audioTests = (
  await fs.readdir(
    ROOT,
    { withFileTypes: true }
  )
).filter(at => {
  return at.isDirectory()
}).map(at => at.name)

await runAudioTest()

function green(str) {
  return `\x1b[32m${str}\x1b[0m`
}

function red(str) {
  return `\x1b[31m${str}\x1b[0m`
}

async function runAudioTest() {
  const listOfMSQInputFiles = await fs.readdir(`${ROOT}/msq`)
  const listOfFailedTests = []
  const listOfPassedTests = []
  console.time('Total time spent for audio tests')

  const supportedFontSources = await setupFonts()

  const supportedFontNames = {
    'chord-letters': Object.keys(supportedFontSources['chord-letters']),
    'music': Object.keys(supportedFontSources['music']),
    'text': [
      ...new Set([
        ...Object.keys(supportedFontSources['text']['regular']),
        ...Object.keys(supportedFontSources['text']['bold'])
      ])
    ]
  }

  for (const msqInputFile of listOfMSQInputFiles) {
    const testName = path.basename(msqInputFile).split('.')[0]
    const msqInputFileFullPath = `${ROOT}/msq/${msqInputFile}`
    const text = (await fs.readFile(msqInputFileFullPath, 'utf-8'))

    const multiplePagesText = text.split(PAGE_DELIMITER)

    const {
      pageSchemaForEachPage,
      htmlHighlightsForEachPage,
      errorsForEachPage,
      customStylesForEachPage,
      midiSettingsForEachPage,
      commentsForEachPage
    } = generateIntermediateStructuresForMultiplePages({
      multiplePagesText,
      supportedFontNames
    })

    if (!areAllPageSchemasValid(pageSchemaForEachPage)) {
      throw new Error('Some of the page schemas are not valid')
    }

    const pageStylesForEachPage = generateStylesForMultiplePages({
      customStylesForEachPage,
      supportedFontSources
    })
    const allSvgPages = generateSvgForMultiplePages({
      pageSchemaForEachPage,
      pageStylesForEachPage
    })
    const htmlHighlightsForAllPages = htmlHighlightsForEachPage.map(
      htmlHighlightsForSinglePage => htmlHighlightsForSinglePage.join(EMPTY_STRING)
    ).join(PAGE_DELIMITER)
    const midiForAllPages = generateMidiForMultiplePages({
      pageSchemaForEachPage,
      midiSettingsForEachPage
    })

    const stringifiedPageSchema = JSON.stringify(pageSchemaForEachPage)
    const stringifiedErrors = JSON.stringify(errorsForEachPage)
    const stringifiedCustomStyles = JSON.stringify(customStylesForEachPage)
    const stringifiedMidiSettings = JSON.stringify(midiSettingsForEachPage)
    const stringifiedComments = JSON.stringify(commentsForEachPage)
    const midiData = midiForAllPages.data

    let expectedSvgAsString
    let expectedStringifiedPageSchema
    let expectedStringifiedHtmlHighlights
    let expectedStringifiedErrors
    let expectedStringifiedCustomStyles
    let expectedStringifiedMidiSettings
    let expectedStringifiedComments
    let expectedMidiData

    let testType
    try {
      /*
      Reading the expected files is part of the test rather than a step before
      it: a test whose expected file is missing is a failure like any other, and
      the actual files still get written so it can be looked at and adopted.
      */
      testType = 'reading expected files';
      [
        expectedSvgAsString,
        expectedStringifiedPageSchema,
        expectedStringifiedHtmlHighlights,
        expectedStringifiedErrors,
        expectedStringifiedCustomStyles,
        expectedStringifiedMidiSettings,
        expectedStringifiedComments,
        expectedMidiData
      ] = await Promise.all(
        [
          fs.readFile(`${ROOT}/svg/expected/${testName}.svg`, 'utf-8'),
          fs.readFile(`${ROOT}/page-schema/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`${ROOT}/html-highlights/expected/${testName}.html`, 'utf-8'),
          fs.readFile(`${ROOT}/errors/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`${ROOT}/custom-styles/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`${ROOT}/midi-settings/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`${ROOT}/comments/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`${ROOT}/midi/expected/${testName}.mid`, { encoding: null })
        ]
      )

      testType = 'svg'
      assert.strictEqual(
        allSvgPages,
        expectedSvgAsString,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'html highlights'
      assert.strictEqual(
        htmlHighlightsForAllPages,
        expectedStringifiedHtmlHighlights,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'page schema'
      assert.strictEqual(
        stringifiedPageSchema,
        expectedStringifiedPageSchema,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'errors'
      assert.strictEqual(
        stringifiedErrors,
        expectedStringifiedErrors,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'custom-styles'
      assert.strictEqual(
        stringifiedCustomStyles,
        expectedStringifiedCustomStyles,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'midi-settings'
      assert.strictEqual(
        stringifiedMidiSettings,
        expectedStringifiedMidiSettings,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'comments'
      assert.strictEqual(
        stringifiedComments,
        expectedStringifiedComments,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n`)
      testType = 'midi'
      assert.strictEqual(
        Buffer.compare(
          midiData,
          expectedMidiData
        ),
        0,
        `${red('Failed')} for "${testName}" test`
      )
      process.stdout.write(`"${testName}" ${green('passed')} for ${testType}\n\n`)
      listOfPassedTests.push({
        name: testName
      })
    } catch (error) {
      process.stdout.write(`"${testName}" ${red('failed')} for ${testType}\n\n`)
      listOfFailedTests.push({
        name: testName,
        // Which artifact gave way, so the test viewer can open straight to it.
        testType
      })
    } finally {
      await Promise.all(
        [
          fs.writeFile(`${ROOT}/svg/actual/${testName}.svg`, allSvgPages),
          fs.writeFile(`${ROOT}/page-schema/actual/${testName}.json`, stringifiedPageSchema),
          fs.writeFile(`${ROOT}/html-highlights/actual/${testName}.html`, htmlHighlightsForAllPages),
          fs.writeFile(`${ROOT}/errors/actual/${testName}.json`, stringifiedErrors),
          fs.writeFile(`${ROOT}/custom-styles/actual/${testName}.json`, stringifiedCustomStyles),
          fs.writeFile(`${ROOT}/midi-settings/actual/${testName}.json`, stringifiedMidiSettings),
          fs.writeFile(`${ROOT}/comments/actual/${testName}.json`, stringifiedComments),
          fs.writeFile(`${ROOT}/midi/actual/${testName}.mid`, midiData)
        ]
      )
    }
  }
  console.timeEnd(`Total time spent for audio tests`)
  await fs.writeFile(
    `${ROOT}/list-of-failed-tests.json`,
    JSON.stringify(listOfFailedTests)
  )
  await fs.writeFile(
    `${ROOT}/list-of-passed-tests.json`,
    JSON.stringify(listOfPassedTests)
  )
  if (listOfFailedTests.length > 0) {
    throw new Error(
      `There are (${listOfFailedTests.length})  failed audio tests. Please check https://127.0.0.1:8889/html/test-viewer.html#audio\n\n`
    )
  } else {
    process.stdout.write(`All audio tests passed. Please check https://127.0.0.1:8889/html/test-viewer.html#audio\n\n`)
  }
}
