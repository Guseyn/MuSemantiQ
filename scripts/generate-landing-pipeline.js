#!/usr/bin/env node

/*
"How it works" on the landing page, as the engine really runs it.

The screen walks one tiny piece of MSQ through the pipeline and shows what each
step makes of it: the intermediate structures the parser returns, the styles
derived from them, and the outputs. None of that is drawn by hand. This script
runs the pipeline once and writes every step's real result:

  md/landing/pipeline/<step>.md   each structure, fenced, for e-markdown to show
                                  (JSON, and the highlighted HTML)
  images/pipeline/score.svg       the engraved score
  images/pipeline/midi.svg        the performance as a piano roll, drawn from the
                                  notes read back out of the MIDI file
  images/pipeline/example.mid     the MIDI file itself

    npm run docs:pipeline

Everything is committed: it changes only when this script, the example or the
engine changes, and the landing page should not have to start the engine to
explain it. Rerun it after any of those changes.
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import {
  setupFonts,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage,
  generateMidiForSinglePage
} from '#msq/api.js'
import { Midi } from '#msq/midi/lib/@tonejs/Midi.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const staticDir = path.join(projectRoot, 'docs', 'web-app', 'static')
const mdDir = path.join(staticDir, 'md', 'landing', 'pipeline')
const imagesDir = path.join(staticDir, 'images', 'pipeline')

/*
Two lines of music, and three lines that give every structure something to
show: a comment, a style and a MIDI setting. With the music alone, half of the
structures would be empty, and an empty {} explains nothing. The style narrows
the page to the music, so the engraved score is not five notes at the edge of
an empty stave.
*/
const EXAMPLE = `comment: "A first page."
page line width is 300
default instrument is guitar
treble clef
c d e f g`

const fontPath = (...parts) => path.join(projectRoot, 'src', 'drawer', 'font', ...parts)

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

function fenced(language, text) {
  return `\`\`\`${language}\n${text}\n\`\`\`\n`
}

function json(value) {
  return fenced('json', JSON.stringify(value, null, 2))
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  console.log(`✓ ${path.relative(projectRoot, file)}`)
}

/*
The page styles hold the loaded fonts too, which are objects of their own (and
circular), so only the plain values are shown: the numbers, names and flags
that every measurement on the page is derived from.
*/
function plainValuesOf(styles) {
  return Object.fromEntries(
    Object.entries(styles).filter(([ , value ]) => [ 'number', 'string', 'boolean' ].includes(typeof value))
  )
}

/*
The editor's colours, from the stylesheet the editor itself uses, scoped to the
one block they colour here so they cannot leak into the rest of the page.
*/
async function highlightsCss() {
  // web-components/ has no specifier of its own (#msq/ is src/), so it is imported by path
  const highlightsModule = path.join(projectRoot, 'web-components', 'css', 'highlights.js')
  const { default: css } = await import(pathToFileURL(highlightsModule).href)
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/([^{}]+)\{/g, (rule, selectors) => '\n' + selectors
      .split(',')
      .map((selector) => `[data-highlights] ${selector.trim()}`)
      .join(',\n') + ' {')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/*
The performance as a piano roll: one row per pitch that sounds, one bar per
note, along the seconds it lasts. Drawn from the notes read back out of the
MIDI file, so it shows what was written into the file, not what was meant to be.
*/
const NOTE_NAMES = [ 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b' ]

function pianoRoll(midiBytes) {
  const notes = new Midi(midiBytes).tracks.flatMap((track) => track.notes)
  const pitches = [ ...new Set(notes.map((note) => note.midi)) ].sort((a, b) => b - a)
  const end = Math.max(...notes.map((note) => note.time + note.duration))

  const labelWidth = 40
  const rowHeight = 22
  const secondWidth = 160
  const top = 10
  const width = labelWidth + end * secondWidth + 12
  const height = top + pitches.length * rowHeight + 30

  const rows = pitches.map((pitch, index) => {
    const y = top + index * rowHeight
    const name = `${NOTE_NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`
    return `<rect x="${labelWidth}" y="${y}" width="${end * secondWidth}" height="${rowHeight}" fill="${index % 2 ? '#fbfaf7' : '#ffffff'}"/>` +
      `<text x="${labelWidth - 8}" y="${y + rowHeight / 2 + 4}" text-anchor="end">${name}</text>`
  })
  const beats = []
  for (let second = 0; second <= end + 1e-9; second += 0.5) {
    const x = labelWidth + second * secondWidth
    beats.push(
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + pitches.length * rowHeight}" stroke="#e4e1d9"/>` +
      `<text x="${x}" y="${height - 8}" text-anchor="middle">${second}s</text>`
    )
  }
  const bars = notes.map((note) => {
    const x = labelWidth + note.time * secondWidth + 1.5
    const y = top + pitches.indexOf(note.midi) * rowHeight + 4
    return `<rect x="${x}" y="${y}" width="${note.duration * secondWidth - 3}" height="${rowHeight - 8}" rx="3" fill="#c40233"/>`
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" fill="#5f6672">` +
    rows.join('') + beats.join('') + bars.join('') +
    `</svg>\n`
}

const supportedFontSources = await setupFonts(fontConfig)

const structures = generateIntermediateStructuresForSinglePage({ pageText: EXAMPLE })
if (structures.errors.length) {
  throw new Error(`the example does not parse: ${structures.errors.join('; ')}`)
}

const pageStyles = generateStylesForSinglePage({
  customStyles: structures.customStyles,
  supportedFontSources
})

const svg = generateSvgForSinglePage({ pageSchema: structures.pageSchema, pageStyles })

/*
Measures are numbered the way the components number them before they ask for a
performance (see src/worker.js): the MIDI ref ids are built from these, and
without them they come out as NaN.
*/
structures.pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
  measureParams.pageIndex = 0
  measureParams.measureIndexOnPage = measureIndex
})
const midi = generateMidiForSinglePage({
  pageSchema: structures.pageSchema,
  midiSettings: structures.midiSettings
})
// The numbering was for the performance; the schema is shown as the parser made it.
structures.pageSchema.measuresParams.forEach((measureParams) => {
  delete measureParams.pageIndex
  delete measureParams.measureIndexOnPage
})

const highlightsHtml = structures.highlightsHtmlBuffer.join('')

write(path.join(mdDir, 'words.md'), fenced('text', EXAMPLE))
write(path.join(mdDir, 'page-schema.md'), json(structures.pageSchema))
write(path.join(mdDir, 'custom-styles.md'), json(structures.customStyles))
write(path.join(mdDir, 'midi-settings.md'), json(structures.midiSettings))
write(path.join(mdDir, 'comments.md'), json(structures.comments))
write(path.join(mdDir, 'errors.md'), json(structures.errors))
write(path.join(mdDir, 'scenarios.md'), json(structures.mapOfCharIndexesWithProgressionOfCommandsFromScenarios))
write(path.join(mdDir, 'highlights-buffer.md'), json(structures.highlightsHtmlBuffer))
write(path.join(mdDir, 'page-styles.md'), json(plainValuesOf(pageStyles)))
write(path.join(mdDir, 'timing.md'), json({
  timeStampsMappedWithRefsOn: midi.timeStampsMappedWithRefsOn,
  refsOnMappedWithTimeStamps: midi.refsOnMappedWithTimeStamps
}))
/*
The highlighted source is HTML already. A <pre> is one of showdown's block
tags, so it is passed through as written, and its colours come with it.
*/
write(
  path.join(mdDir, 'highlights.md'),
  `<style>\n${await highlightsCss()}\n</style>\n\n<pre data-highlights>${highlightsHtml}</pre>\n`
)

write(path.join(imagesDir, 'score.svg'), svg)
write(path.join(imagesDir, 'midi.svg'), pianoRoll(midi.data))
write(path.join(imagesDir, 'example.mid'), Buffer.from(midi.data))
