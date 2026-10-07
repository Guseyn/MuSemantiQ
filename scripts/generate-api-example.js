#!/usr/bin/env node

/*
The files the Node.js example on the Low-level API page says you will get.

The page shows a script that reads two pages of MSQ and writes score.svg and
score.mid, and links to both, so a reader can see the result before running
anything. This runs the same calls on the same two pages and writes:

  images/api/score.svg   the engraved score, both pages, one under another
  images/api/score.mid   both pages, performed as one piece

    npm run docs:api-example

The pages are read from the page itself, from the fences after `pages/1.txt`
and `pages/2.txt`, so the files cannot drift from the text beside them. Both
files are committed; rerun this after changing those pages or the engine.
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  setupFonts,
  supportedFontNamesFrom,
  generateIntermediateStructuresForMultiplePages,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages,
  generateMidiForMultiplePages
} from '#msq/api.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const staticDir = path.join(projectRoot, 'docs', 'web-app', 'static')
const pageWithTheExample = path.join(staticDir, 'md', 'api', 'overview.md')
const outputDir = path.join(staticDir, 'images', 'api')

function pageTextAfter(markdown, fileName) {
  const fence = new RegExp('`' + fileName.replace('.', '\\.') + '`[^\\n]*\\n+```text\\n([\\s\\S]*?)\\n```')
  const match = markdown.match(fence)
  if (!match) {
    throw new Error(`no \`\`\`text fence after \`${fileName}\` in ${pageWithTheExample}`)
  }
  return match[1]
}

const markdown = fs.readFileSync(pageWithTheExample, 'utf-8')
const multiplePagesText = [ 'pages/1.txt', 'pages/2.txt' ].map((fileName) => pageTextAfter(markdown, fileName))

const fontPath = (...parts) => path.join(projectRoot, 'src', 'drawer', 'font', ...parts)

// The fonts the example names, from this repository rather than a copy
const fontConfig = {
  'chord-letters': {
    'gentium plus': fontPath('chord-letters', 'GentiumPlus-Regular.ttf')
  },
  'text': {
    'noto-serif': {
      'regular': fontPath('text', 'NotoSerif-Regular.ttf'),
      'bold': fontPath('text', 'NotoSerif-Bold.ttf')
    }
  },
  'music': {
    'bravura': {
      'font': fontPath('music', 'Bravura.otf'),
      'js': '#msq/drawer/font/music-js/bravura.js'
    }
  }
}

const supportedFontSources = await setupFonts(fontConfig)
const supportedFontNames = supportedFontNamesFrom(supportedFontSources)

const {
  pageSchemaForEachPage,
  errorsForEachPage,
  customStylesForEachPage,
  midiSettingsForEachPage
} = generateIntermediateStructuresForMultiplePages({
  multiplePagesText,
  supportedFontNames
})

// The example is meant to parse cleanly; files made from a page with errors would show something else
const errors = errorsForEachPage.flatMap((pageErrors, pageIndex) => pageErrors.map((error) => `page ${pageIndex + 1}: ${error.trim()}`))
if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

const pageStylesForEachPage = generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
})

const svg = generateSvgForMultiplePages({
  pageSchemaForEachPage,
  pageStylesForEachPage
})

const midi = generateMidiForMultiplePages({
  pageSchemaForEachPage,
  midiSettingsForEachPage
})

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(path.join(outputDir, 'score.svg'), svg)
fs.writeFileSync(path.join(outputDir, 'score.mid'), midi.data)

console.log(`[generate-api-example] wrote ${path.relative(projectRoot, outputDir)}/score.svg and score.mid`)
