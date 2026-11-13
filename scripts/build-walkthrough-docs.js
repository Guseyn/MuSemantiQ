// Builds dev-docs/language.html, drawer.html and midi.html from the source
// files themselves: every function of every file becomes a frame with its
// real code. Files that no process tab claims join an "everything else" tab,
// so a new file can never stay invisible. `--check` only verifies that the
// committed pages match a fresh build and fails when they went stale.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import buildWalkthroughTabFromSource from './build-walkthrough-tab-from-source.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DEV_DOCS = path.join(ROOT, 'dev-docs')
const SRC = path.join(ROOT, 'src')

const PLAYER_TEMPLATE = fs.readFileSync(new URL('./walkthrough-docs/player-template.js', import.meta.url), 'utf8')
const EXTRA_STYLES = fs.readFileSync(new URL('./walkthrough-docs/styles.css', import.meta.url), 'utf8')
const PAGE_TEMPLATE = fs.readFileSync(new URL('./walkthrough-docs/page-template.html', import.meta.url), 'utf8')

// each tab is one process: the files it touches and the function it starts at
const TABS = {
  'language.html': ['src/language', [
    ['the parser', ['language/api.js', 'language/parser/**/*.js', 'language/lib/*.js'], 'generateIntermediateStructuresForSinglePage'],
    ['the serializer', ['language/serializer/*.js'], 'serialize'],
    ['the schema', ['language/schema/*.js'], 'validatePageSchema']
  ]],
  'drawer.html': ['src/drawer', [
    ['styles', ['drawer/generateStyles.js'], 'generateStyles'],
    ['the page', ['drawer/elements/basic/**/*.js', 'drawer/elements/the-page/**/*.js', 'drawer/elements/shared/**/*.js'], 'drawPage'],
    ['notes on a page', ['drawer/elements/notes-on-a-page/**/*.js'], 'drawNotesOnAPage'],
    ['grouping notes', ['drawer/elements/grouping-notes/**/*.js'], 'drawBeams'],
    ['marks and spans', ['drawer/elements/marks-on-units/**/*.js', 'drawer/elements/spans/**/*.js'], 'drawArticulationsAboveOrBelowStave'],
    ['furniture and layout', ['drawer/elements/measure-furniture/**/*.js', 'drawer/elements/layout-and-styles/**/*.js'], 'drawBarlineFermatas']
  ]],
  'midi.html': ['src/midi', [
    ['the walk', ['midi/generateMidi.js', 'midi/toolbox.js', 'midi/orderTimeFrames.js', 'midi/fillTimeStampsMappedWithRefs.js', 'midi/markUnitParamsIfItIsLastSingleUnitInVoiceOnPageLine.js', 'midi/normalizedPitches.js', 'midi/pitchesByNoteNames.js'], 'generateMidi'],
    ['time frames', ['midi/add*.js'], 'addTimeFramesToIndicateNotes'],
    ['calculations', ['midi/calculate*.js'], 'calculatePitchForNoteTimeFrame'],
    ['adjustments', ['midi/adjust*.js', 'midi/untie*.js', 'midi/split*.js', 'midi/sort*.js', 'midi/create*.js', 'midi/clear*.js'], 'adjustMidiNoteWithArticulations'],
    ['the rest', ['midi/assign*.js', 'midi/attach*.js', 'midi/delete*.js', 'midi/does*.js', 'midi/fill*.js', 'midi/find*.js', 'midi/instrument*.js', 'midi/is*.js', 'midi/insert*.js', 'midi/release*.js', 'midi/should*.js', 'midi/tempo*.js', 'midi/update*.js'], 'attachTrackToNote']
  ]]
}

const CATCH_ALL_TAB = 'everything else'

const H1 = {
  'language.html': 'src/language: the words become a tree',
  'drawer.html': 'src/drawer: the tree becomes a score',
  'midi.html': 'src/midi: the score becomes sound'
}
const INTRO = {
  'language.html': 'Every function of the parser and its reverse, file by file. Each tab holds the files that process touches; each frame lights one function, and its file is highlighted in the folder structure. Click a file to jump to its first frame; the code on the right is the code in the repository.',
  'drawer.html': 'Every function of the engraver, file by file — and every element, block by block. Each tab holds the files that process touches; each frame lights one function and highlights its file in the folder structure. Click a file to jump to its first frame; the code is read from the repository.',
  'midi.html': 'Every function of the MIDI engine, file by file. Each tab holds the files that process touches; each frame lights one function and highlights its file in the folder structure. Click a file to jump to its first frame; the code is read from the repository.'
}

function allFilesUnder(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...allFilesUnder(full))
    else out.push(full)
  }
  return out.sort()
}

// font/ holds font data, lib/ holds vendored code: both stay out of the
// catch-all tab unless a process tab names them explicitly
function isVendored(relativeFile) {
  return relativeFile.includes('/lib/') || relativeFile.includes('/font/')
}

function buildTabs(page) {
  const [moduleDir, tabsDef] = TABS[page]
  const tabs = tabsDef.map(([name, globs, entry]) =>
    buildWalkthroughTabFromSource(name, globs, entry, SRC, ROOT))
  const claimed = new Set(tabs.flatMap(tab => tab.sourceFiles))
  // only real source files can be unclaimed; fonts and sound banks are data
  const leftovers = allFilesUnder(path.join(ROOT, moduleDir))
    .map(file => path.relative(SRC, file))
    .filter(file => file.endsWith('.js') && !claimed.has(file) && !isVendored(file))
  if (leftovers.length) {
    tabs.push(buildWalkthroughTabFromSource(CATCH_ALL_TAB, leftovers, '', SRC, ROOT))
  }
  return tabs
}

function buildPage(page) {
  const moduleDir = TABS[page][0]
  const tabs = buildTabs(page)
  const scenarios = []
  const blocks = []
  const seenBlocks = new Set()
  for (const tab of tabs) {
    scenarios.push({
      id: tab.name.replace(/\W+/g, '-'),
      name: tab.name + ' \u00b7 ' + tab.frames.length,
      frames: tab.frames,
      files: [...new Set(Object.values(tab.blocks).map(fn => fn.file))].sort()
    })
    for (const [key, fn] of Object.entries(tab.blocks)) {
      if (seenBlocks.has(key)) continue
      seenBlocks.add(key)
      blocks.push([key, fn])
    }
  }
  const scripts = blocks.map(([key, fn]) =>
    '<script type="text/plain" id="src-' + key + '" data-path="' + fn.file + '" data-start="' + fn.start + '">\n' + fn.text + '\n</script>'
  ).join('\n')
  // the data escapes like python's json.dumps does, so pages diff clean
  const data = JSON.stringify(scenarios, null, 1).replace(/[\u007f-\uffff]/g, c =>
    '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
  const engine = PLAYER_TEMPLATE.replace('__S__', data)
  const body = PAGE_TEMPLATE
    .replace('__MODULE__', moduleDir)
    .replace('__TITLE__', H1[page])
    .replace('__INTRO__', INTRO[page])
  // the shared page style is the first style block of language.html, as it
  // always was: it is what makes the three pages one family
  const styleSource = fs.readFileSync(path.join(DEV_DOCS, 'language.html'), 'utf8')
  const baseStyles = styleSource.slice(styleSource.indexOf('<style>'), styleSource.indexOf('</style>') + 8)
  const html = '<!DOCTYPE html>\n<meta charset="UTF-8">\n<title>MuSemantiQ \u2014 ' + moduleDir + '</title>\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + baseStyles + '<style>' + EXTRA_STYLES + '</style>'
    + body + '\n\n' + scripts + '\n\n<script>\n' + engine + '</script>\n'
  return { html, tabs, blocks }
}

const check = process.argv.includes('--check')
const stale = []
for (const page of Object.keys(TABS)) {
  const { html, tabs, blocks } = buildPage(page)
  const frames = tabs.reduce((sum, tab) => sum + tab.frames.length, 0)
  const out = path.join(DEV_DOCS, page)
  if (check) {
    const onDisk = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : ''
    if (onDisk !== html) stale.push(page)
  } else {
    fs.writeFileSync(out, html)
  }
  console.log(page + ': ' + tabs.length + ' tabs, ' + frames + ' frames, ' + blocks.length + ' functions, '
    + Math.floor(Buffer.byteLength(html) / 1024) + ' KB')
  const catchAll = tabs.find(tab => tab.name === CATCH_ALL_TAB)
  if (catchAll) console.log('   ' + CATCH_ALL_TAB + ': ' + catchAll.sourceFiles.join(', '))
}

if (stale.length) {
  console.error('stale walkthrough docs: ' + stale.join(', ') + ' — run npm run docs:walkthroughs')
  process.exit(1)
}
