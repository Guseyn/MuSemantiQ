#!/usr/bin/env node

'use strict'

import fs from 'node:fs/promises'
import {
  setupFonts,
  supportedFontNamesFrom,
  generateIntermediateStructuresForSinglePage,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages
} from '#msq/api.js'
import { parseSvgPrimitives } from '#msq/omr/training/raster/parseSvgPrimitives.js'

const OUT = 'dev-docs/math-figures/omr-examples'
const examples = {
  'simple-score': {
    msq: 'title is "A measured page"\n\nstave with treble clef\ntime signature is 4:4\n1/4 c5 a4 with flat key f4 dotted\nmeasure\n1/8 b4 a4'
  },
  'cross-stave-score': {
    path: 'test/visual-tests/bravura/msq/structure-cross-stave-chord.txt'
  }
}

const supportedFontSources = await setupFonts({
  'chord-letters': {
    'gentium plus': './src/drawer/font/chord-letters/GentiumPlus-Regular.ttf',
    'gothic a1': './src/drawer/font/chord-letters/GothicA1-Regular.ttf'
  },
  text: {
    'noto-serif': {
      regular: './src/drawer/font/text/NotoSerif-Regular.ttf',
      bold: './src/drawer/font/text/NotoSerif-Bold.ttf'
    },
    'noto-sans': {
      regular: './src/drawer/font/text/NotoSans-Regular.ttf',
      bold: './src/drawer/font/text/NotoSans-Bold.ttf'
    }
  },
  music: {
    bravura: {
      font: './src/drawer/font/music/Bravura.otf',
      js: '#msq/drawer/font/music-js/bravura.js'
    }
  }
})
const supportedFontNames = supportedFontNamesFrom(supportedFontSources)
await fs.mkdir(OUT, { recursive: true })

for (const [ name, example ] of Object.entries(examples)) {
  const pageText = example.path ? await fs.readFile(example.path, 'utf8') : example.msq
  const { pageSchema, customStyles, errors } = generateIntermediateStructuresForSinglePage({ pageText, supportedFontNames })
  if (errors.length) {
    throw new Error(`${name}: ${errors.map((error) => error.message).join(', ')}`)
  }
  const pageStylesForEachPage = generateStylesForMultiplePages({
    customStylesForEachPage: [ customStyles ],
    supportedFontSources
  })
  const svg = generateSvgForMultiplePages({
    pageSchemaForEachPage: [ pageSchema ],
    pageStylesForEachPage
  })
  await fs.writeFile(`${OUT}/${name}.svg`, svg)
  const document = parseSvgPrimitives(svg)
  const rows = document.groups.filter((group) => group.name && group.bounds).map((group) => [
    group.name,
    group.bounds.left,
    group.bounds.right,
    group.bounds.top,
    group.bounds.bottom
  ].join('\t'))
  await fs.writeFile(`${OUT}/${name}.tsv`, rows.join('\n') + '\n')
}
