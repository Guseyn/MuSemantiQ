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

/*
A run can be narrowed to the tests whose name matches, the way the serializer
runner already allows:

  node scripts/audio-tests.js --only=chord

It writes and compares only those, which is what lets one test be brought up to
date without walking the whole corpus.
*/
const only = process.argv.find((argument) => argument.startsWith('--only='))
const onlyPattern = only ? only.slice('--only='.length) : null
/*
A test is a `.txt` file and nothing else: the folder also collects whatever the
operating system leaves behind (`.DS_Store`), and a name taken from such a file
is empty, so it fails against an artifact that was never written for it.
*/
const wanted = (file) =>
  file.endsWith('.txt') && (!onlyPattern || file.includes(onlyPattern))


const audioTests = (
  await fs.readdir(
    ROOT,
    { withFileTypes: true }
  )
).filter(at => {
  return at.isDirectory()
}).map(at => at.name)

await runAudioTest()

/**
 * Write a verdict list, keeping what this run did not look at.
 *
 * `--only` runs a handful of tests, and writing just their results would throw
 * away every other test's verdict — so editing one test in the viewer used to
 * clear the "failing" label from all the rest. Only the tests that actually ran
 * are replaced; the others keep whatever the last full run said about them. A
 * run with no `--only` covers the corpus, so the merge is the same as a replace.
 */
async function writeVerdicts(at, verdicts, testsThatRan) {
  let kept = []
  try {
    kept = JSON.parse(await fs.readFile(at, 'utf-8'))
      .filter((one) => one && one.name && !testsThatRan.has(one.name))
  } catch {
    // No list yet, or an unreadable one — this run writes the whole of it.
  }
  const all = [ ...kept, ...verdicts ]
  all.sort((one, other) => one.name.localeCompare(other.name))
  await fs.writeFile(at, JSON.stringify(all))
}

function green(str) {
  return `\x1b[32m${str}\x1b[0m`
}

function red(str) {
  return `\x1b[31m${str}\x1b[0m`
}

async function runAudioTest() {
  const listOfMSQInputFiles = (await fs.readdir(`${ROOT}/msq`)).filter(wanted)
  const listOfFailedTests = []
  const listOfPassedTests = []
  console.time('Total time spent for audio tests')

  /*
  The two fonts that are properly set up, named rather than left to the
  defaults — which reach for all four, and so made this suite depend on font
  files no test asks for.
  */
  const supportedFontSources = await setupFonts({
    'chord-letters': {
      'gentium plus': './src/drawer/font/chord-letters/GentiumPlus-Regular.ttf',
      'gothic a1': './src/drawer/font/chord-letters/GothicA1-Regular.ttf'
    },
    'text': {
      'noto-serif': {
        'regular': './src/drawer/font/text/NotoSerif-Regular.ttf',
        'bold': './src/drawer/font/text/NotoSerif-Bold.ttf'
      },
      'noto-sans': {
        'regular': './src/drawer/font/text/NotoSans-Regular.ttf',
        'bold': './src/drawer/font/text/NotoSans-Bold.ttf'
      }
    },
    'music': {
      'bravura': {
        'font': './src/drawer/font/music/Bravura.otf',
        'js': '#msq/drawer/font/music-js/bravura.js'
      },
      'leland': {
        'font': './src/drawer/font/music/Leland.otf',
        'js': '#msq/drawer/font/music-js/leland.js'
      }
    }
  })

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
  const testsThatRan = new Set(
    [ ...listOfFailedTests, ...listOfPassedTests ].map((one) => one.name)
  )
  await writeVerdicts(`${ROOT}/list-of-failed-tests.json`, listOfFailedTests, testsThatRan)
  await writeVerdicts(`${ROOT}/list-of-passed-tests.json`, listOfPassedTests, testsThatRan)
  if (listOfFailedTests.length > 0) {
    throw new Error(
      `There are (${listOfFailedTests.length})  failed audio tests. Please check https://127.0.0.1:8889/html/test-viewer.html#audio\n\n`
    )
  } else {
    process.stdout.write(`All audio tests passed. Please check https://127.0.0.1:8889/html/test-viewer.html#audio\n\n`)
  }
}
