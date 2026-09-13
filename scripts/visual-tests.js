import fs from 'fs/promises'
import path from 'path'
import assert from 'assert'

// API
import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages,
  areAllPageSchemasValid,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages,
} from '#msq/api.js'

const visualTestsForEachFont = (
  await fs.readdir(
    'visual-tests',
    { withFileTypes: true }
  )
).filter(vt => {
  return vt.isDirectory()
}).map(vt => vt.name)

const PAGE_DELIMITER = '====next page===='
const EMPTY_STRING = ''

for (const visualTestDirForFont of visualTestsForEachFont) {
  await runVisualTestForFont(visualTestDirForFont)
}

function green(str) {
  return `\x1b[32m${str}\x1b[0m`
}

function red(str) {
  return `\x1b[31m${str}\x1b[0m`
}

async function runVisualTestForFont(visualTestDirForFont) {
  const listOfMSQInputFiles = await fs.readdir(`visual-tests/${visualTestDirForFont}/msq`)
  const listOfFailedTests = []
  const listOfPassedTests = []
  console.time('Total time spent for visual tests')

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
    const msqInputFileFullPath = `visual-tests/${visualTestDirForFont}/msq/${msqInputFile}`

    const msqText = (await fs.readFile(msqInputFileFullPath, 'utf-8'))

    const multiplePagesText = msqText.split(PAGE_DELIMITER)
    const {
      pageSchemaForEachPage,
      htmlHighlightsForEachPage,
      errorsForEachPage,
      customStylesForEachPage,
      mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage,
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

    const stringifiedPageSchema = JSON.stringify(pageSchemaForEachPage)
    const stringifiedErrors = JSON.stringify(errorsForEachPage)
    const stringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios = JSON.stringify(mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage.flat())
    const stringifiedComments = JSON.stringify(commentsForEachPage)
    const stringifiedCustomStyles = JSON.stringify(customStylesForEachPage)

    let expectedSvgAsString
    let expectedStringifiedPageSchema
    let expectedStringifiedHtmlHighlights
    let expectedStringifiedErrors
    let expectedStringifiedCustomStyles
    let expectedStringifiedComments
    let expectedStringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios

    let testType
    try {
      [
        expectedSvgAsString,
        expectedStringifiedPageSchema,
        expectedStringifiedHtmlHighlights,
        expectedStringifiedErrors,
        expectedStringifiedCustomStyles,
        expectedStringifiedComments,
        expectedStringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios
      ] = await Promise.all(
        [
          fs.readFile(`visual-tests/${visualTestDirForFont}/svg/expected/${testName}.svg`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/page-schema/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/html-highlights/expected/${testName}.html`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/errors/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/custom-styles/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/comments/expected/${testName}.json`, 'utf-8'),
          fs.readFile(`visual-tests/${visualTestDirForFont}/char-progressions/expected/${testName}.json`, 'utf-8')
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
      testType = 'char-progressions'
      assert.strictEqual(
        stringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios,
        expectedStringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios,
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
      testType = 'comments'
      assert.strictEqual(
        stringifiedComments,
        expectedStringifiedComments,
        `${red('failed')} for "${testName}" test`
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
          fs.writeFile(`visual-tests/${visualTestDirForFont}/svg/actual/${testName}.svg`, allSvgPages),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/page-schema/actual/${testName}.json`, stringifiedPageSchema),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/html-highlights/actual/${testName}.html`, htmlHighlightsForAllPages),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/errors/actual/${testName}.json`, stringifiedErrors),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/custom-styles/actual/${testName}.json`, stringifiedCustomStyles),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/comments/actual/${testName}.json`, stringifiedComments),
          fs.writeFile(`visual-tests/${visualTestDirForFont}/char-progressions/actual/${testName}.json`, stringifiedMapOfCharIndexesWithProgressionOfCommandsFromScenarios)
        ]
      )
    }
  }
  console.timeEnd('Total time spent for visual tests')
  await fs.writeFile(
    `visual-tests/${visualTestDirForFont}/list-of-failed-tests.json`,
    JSON.stringify(listOfFailedTests)
  )
  await fs.writeFile(
    `visual-tests/${visualTestDirForFont}/list-of-passed-tests.json`,
    JSON.stringify(listOfPassedTests)
  )
  if (listOfFailedTests.length > 0) {
    throw new Error(
      `There are (${listOfFailedTests.length})  failed visual tests. Please check https://127.0.0.1:8889/html/test-viewer.html#visual\n\n`
    )
  } else {
    process.stdout.write(`All visual tests passed. Please check https://127.0.0.1:8889/html/test-viewer.html#visual\n\n`)
  }
}
