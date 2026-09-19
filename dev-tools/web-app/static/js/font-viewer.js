import '#msq/web-components/msq-editor-template.js'
import scaffold from '#tools/smufl/scaffold.js'
import './searchable-select.js'
import worker from '#msq/web-components/utils/worker-instance.js'
import { registerFontNames } from '#msq/web-components/utils/fontNames.js'

// --- what the page's e-json elements hand over ------------------------------

/*
The page's two requests are made by the <e-json> elements in the markup, which
also fill every picker from them — the option lists are templates there rather
than loops here. What the script still needs is the answers themselves: the
config that registers the faces with the worker, and the entry list the glyph
walk steps through.
*/
/**
 * Take delivery of what one of the page's e-json elements fetched.
 *
 * This module and everything it imports — the scaffold alone is sixteen hundred
 * lines — is fetched and parsed while those requests are already in flight, so
 * the answer regularly arrives before there is anything here to receive it.
 * That is why the page both leaves the body on the window and calls in: this
 * picks up whichever happened, and there is no order to get wrong.
 *
 * `askAgain` re-triggers the request and waits for the answer that follows,
 * which is how the page re-reads the fonts after one has been uploaded.
 */
const handedOver = (name, box) => {
  const waiting = []
  let answer = window[box]

  window[name] = (body) => {
    answer = body
    while (waiting.length) {
      waiting.shift()(body)
    }
    return body
  }

  return {
    next: () => answer !== undefined
      ? Promise.resolve(answer)
      : new Promise((resolve) => waiting.push(resolve)),
    askAgain: (id) => {
      const asking = new Promise((resolve) => waiting.push(resolve))
      // So a failure to answer cannot be satisfied by the last answer.
      answer = undefined
      document.getElementById(id).trigger()
      return asking
    }
  }
}

const fontsFromTheServer = handedOver('fontsRead', 'fontsAnswer')
const entriesFromTheServer = handedOver('entriesRead', 'entriesAnswer')

// --- one entry's yCorrection, as text --------------------------------------------------

/**
 * Reading one entry's yCorrection out of a music-js font, as text.
 *
 * The font viewer engraves through the editor, which engraves in the worker off
 * the font module the worker imported — so a value typed into the page cannot
 * reach the score by any other route than giving the worker a different module.
 * Patching the source here lets that happen without writing anything to disk.
 *
 * These files are generated, so their formatting is regular enough to walk by
 * line: one property per line, objects opened by `<name>: {` and closed by `}`
 * at the same indent.
 */

/**
 * Walk the file, calling back with the line index of the entry's yCorrection.
 */
function locate(lines, entryPath) {
  const stack = []
  let inside = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const closing = line.match(/^(\s*)\}/)
    if (closing) {
      while (stack.length && stack[stack.length - 1].indent >= closing[1].length) {
        stack.pop()
      }
      inside = stack.map((frame) => frame.name).join('.') === entryPath
    }

    const opening = line.match(/^(\s*)(?:'([^']*)'|([A-Za-z0-9_]+)): \{\s*$/)
    if (opening) {
      const indent = opening[1].length
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      stack.push({ indent, name: opening[2] === undefined ? opening[3] : opening[2] })
      inside = stack.map((frame) => frame.name).join('.') === entryPath
      continue
    }

    if (!inside) {
      continue
    }

    const correction = line.match(
      /^(\s*)yCorrection: (-?[\d.]+) \* intervalBetweenStaveLines(,?)\s*$/
    )
    if (correction) {
      return {
        line: index,
        indent: correction[1].length,
        value: Number(correction[2]),
        comma: correction[3] === ','
      }
    }
  }
  return null
}

/**
 * The yCorrection an entry currently carries, in stave-line intervals, or null
 * when it has none — most glyphs are positioned by yOffset or not at all.
 */
function readYCorrection(source, entryPath) {
  const found = locate(source.split('\n'), entryPath)
  return found ? found.value : null
}

// --- the music each glyph is judged in -------------------------------------

/*
Each entry in the glyph table has a file of its own under dev-tools/glyph-examples,
holding the music that glyph is judged in — an accent above and below a note, a
flag on a stem both ways, a clef on a stave. They are files rather than generated
strings so that a bad example can be fixed by writing music, not code.

None of them names a music font: the viewer puts `music font is <name>` in front,
so switching font rewrites that one line and nothing else.
*/
const PLAIN_EXAMPLE = `measure
stave with treble clef
e f g a
b c5 d5 e5`

/**
 * Which file an entry is kept in.
 *
 * Two entries can differ only in case — `noteLetters.T` and `noteLetters.t` —
 * and a file system that ignores case would let one quietly overwrite the
 * other. Where that happens the upper-case one takes a `.upper` suffix, decided
 * from the glyph table itself so this and the files agree without a manifest.
 */
function glyphExampleFile(name) {
  const clashes = entryNames().some(
    (other) => other !== name && other.toLowerCase() === name.toLowerCase()
  )
  const tail = name.split('.').pop()
  return clashes && tail !== tail.toLowerCase() ? `${name}.upper.txt` : `${name}.txt`
}

const readExamples = new Map()

/**
 * The music in one example file, read once and then remembered.
 */
async function exampleIn(file) {
  if (!readExamples.has(file)) {
    try {
      const response = await fetch(`/glyph-examples/${encodeURIComponent(file)}`)
      if (!response.ok) {
        throw new Error(`the server answered ${response.status}`)
      }
      readExamples.set(file, { msq: (await response.text()).trim(), from: file })
    } catch {
      readExamples.set(file, { msq: PLAIN_EXAMPLE, from: `no ${file} — showing a plain stave` })
    }
  }
  return readExamples.get(file)
}

const glyphExample = (name) => exampleIn(glyphExampleFile(name))

/**
 * Keep an example, and show it as kept.
 */
async function saveExample({ file, msq, what, says }) {
  if (!msq) {
    window.showError('Open the source in the editor and write something first.')
    return
  }

  const confirmed = await window.confirmAction(
    `Keep this as the example for ${what}? It is written to dev-tools/glyph-examples/${file}.`,
    'Save it', 'Leave it'
  )
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/dev/glyph-example', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file, msq })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || `the server answered ${response.status}`)
    }
    // What is on disk has changed, so what was held for it must match.
    readExamples.set(file, { msq, from: file })
    says.textContent = `saved to ${result.at}`
    window.showToast(`Saved the example for ${what}.`)
  } catch (error) {
    window.showError(`Could not save it: ${error.message}`)
  }
}

/**
 * What is in an editor now, without the lines the viewer put in front.
 */
function musicIn(container) {
  const host = container.querySelector('div[data-rendered-by]')
  const textarea = host && host.shadowRoot.querySelector('textarea[data-msq-input]')
  if (!textarea) {
    return null
  }
  return textarea.value
    .split('\n')
    .filter((line, index, lines) => {
      const isFontLine = /^(music font is|text font is|chord letters font is|font size is) /.test(line)
      // The blank line the viewer leaves after them goes with them.
      const afterTheFontLines = lines.slice(0, index).every(
        (earlier) => earlier === '' || /^(music font is|text font is|chord letters font is|font size is) /.test(earlier)
      )
      return !(isFontLine || (line === '' && afterTheFontLines))
    })
    .join('\n')
    .trim()
}

// --- the page ---------------------------------------------------------------

const FONT_SOURCES_REFERENCE = 'msqFontSources'
const COORDINATE_DECIMALS = 2

// The layout is fetched before the page's own markup is placed, so nothing can
// be looked up until it is there.
await window.whenPresent('#editor')

const control = (id) => document.getElementById(id)
const elements = {
  font: control('font'), entry: control('entry'), codepoint: control('codepoint'),
  size: control('size'), interval: control('interval'), correction: control('correction'),
  editor: control('editor'), status: control('status'), points: control('points'),
  metrics: control('metrics'),
  previousGlyph: control('previous-glyph'), nextGlyph: control('next-glyph'),
  glyphPlace: control('glyph-place'),

  textFont: control('text-font'), textMusicFont: control('text-music-font'),
  textEditor: control('text-editor'), textSays: control('text-says'),

  chordFont: control('chord-font'), chordMusicFont: control('chord-music-font'),
  chordEditor: control('chord-editor'), chordSays: control('chord-says')
}

/*
Which faces there are, read off the disk rather than written down here.

The page used to carry its own list of the four music fonts and the four text
files, which meant a face added to src/drawer/font was invisible until someone
remembered to add it here too. `/dev/fonts` walks those folders and returns both
the faces and the config that registers them, under the names the language
accepts.
*/
let faces = { music: [], text: [], 'chord-letters': [], config: {} }


/**
 * Wait for a picker EHTML is filling.
 *
 * `mapToTemplate` puts the `e-for-each` template into the select, and the
 * mutation observer expands it into options a microtask later — so the options
 * are not there the moment the response has been handled, and there is no event
 * to say when they are.
 *
 * What is waited on is the template going, rather than options arriving: a
 * family with nothing usable in it produces no options at all, and waiting for
 * one would wait for ever.
 */
function whenFilled(picker) {
  const stillToRun = () => picker.querySelector('template')
  if (!stillToRun()) {
    return Promise.resolve(picker)
  }
  return new Promise((resolve) => {
    const watching = new MutationObserver(() => {
      if (!stillToRun()) {
        watching.disconnect()
        resolve(picker)
      }
    })
    watching.observe(picker, { childList: true, subtree: true })
  })
}

/**
 * Choose an option, keeping what was chosen if it is still offered.
 *
 * EHTML empties the select before it refills it, so whatever was showing is
 * gone by the time this runs — which is why the choice is passed in rather than
 * read off the element.
 */
function keepTheChoice(picker, chosen, fallback) {
  if (!picker) {
    return
  }
  const offered = [ ...picker.options ].map((option) => option.value)
  picker.value = offered.includes(chosen)
    ? chosen
    : (offered.includes(fallback) ? fallback : offered[0] || '')
  picker.refresh()
}

const faceNamed = (family, name) => faces[family].find((one) => one.name === name)

/*
Every glyph the scaffold defines, flattened so nested letter maps are pickable.

This is where the codepoint, the drawn size and the yOffset defaults come from —
things the font files do not carry. What is *offered* is a wider list than this:
the server merges it with whatever every traced font turns out to hold, so a
glyph added to the fonts by hand is pickable even though the scaffold has never
heard of it.
*/
const glyphs = new Map()
const collect = (nodes, prefix) => {
  for (const node of nodes) {
    if (node.kind === 'glyph') {
      glyphs.set(prefix + node.name, node)
    } else if (node.kind === 'group') {
      collect(node.entries, `${prefix}${node.name}.`)
    }
  }
}
collect(scaffold, '')

// What the picker offers, in the order it offers it — filled from
// /dev/music-js-entries by the template in the page.
let offeredEntries = []
const entryNames = () => offeredEntries.map((one) => one.name)

/**
 * What is known about an entry: the scaffold's node where there is one, and
 * otherwise just the codepoint the fonts agree it draws.
 */
const entryNamed = (name) => glyphs.get(name) ||
  (offeredEntries.find((one) => one.name === name) &&
    { smufl: offeredEntries.find((one) => one.name === name).unicode })

/**
 * Accepts a literal character or any of U+E050 / e050 / 0xE050.
 */
function charactersFrom(value) {
  const text = value.trim()
  const codepoint = text.match(/^(?:U\+|0x)?([0-9a-fA-F]{4,6})$/)
  return codepoint ? String.fromCodePoint(parseInt(codepoint[1], 16)) : text
}

const unicodeLabel = (characters) => [ ...characters ].map(
  (character) => 'U+' + character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
).join(' ')

/**
 * Lay a point array out the way the music-js fonts hold it — the same shape the
 * generator writes, so what is copied from here can be pasted straight in.
 */
function pointArrayLines(points) {
  const lines = []
  let coordinates = []
  const flush = () => {
    if (coordinates.length) {
      lines.push(coordinates.join(', '))
      coordinates = []
    }
  }
  for (const point of points) {
    if (typeof point === 'string') {
      flush()
      lines.push(`'${point}'`)
    } else {
      const written = Object.is(point, -0)
        ? `-${(0).toFixed(COORDINATE_DECIMALS)}`
        : point.toFixed(COORDINATE_DECIMALS)
      coordinates.push(`${written} * intervalBetweenStaveLines`)
    }
  }
  flush()
  return lines.map((line, index) => index === lines.length - 1 ? line : `${line},`)
}

let traced = []

/**
 * Trace the current character at the current size, and show the result.
 */
async function traceGlyph() {
  const characters = charactersFrom(elements.codepoint.value)
  if (!characters) {
    return
  }

  const interval = Number(elements.interval.value) || 8.5
  const size = Number(elements.size.value) || 4.0

  const answer = await askWorker({
    name: 'glyph.trace',
    fontSourcesReference: currentReference,
    musicFontName: elements.font.value,
    characters,
    musicFontSourceSize: size,
    intervalBetweenStaveLines: interval
  })

  if (answer.missingCharacters.length) {
    traced = []
    elements.points.value = ''
    elements.metrics.innerHTML =
      `<span is="e-tag">${unicodeLabel(characters)} is not in this font</span>`
    return
  }

  traced = answer.points.map(
    (point) => typeof point === 'string'
      ? point
      : Number((point / interval).toFixed(COORDINATE_DECIMALS))
  )
  elements.points.value = pointArrayLines(traced).join('\n')

  const numbers = traced.filter((point) => typeof point === 'number')
  const xs = numbers.filter((value, index) => index % 2 === 0)
  const ys = numbers.filter((value, index) => index % 2 === 1)
  elements.metrics.innerHTML = [
    unicodeLabel(characters),
    `width ${(Math.max(...xs) - Math.min(...xs)).toFixed(2)}`,
    `height ${(Math.max(...ys) - Math.min(...ys)).toFixed(2)}`,
    `${numbers.length / 2} points`
  ].map((metric) => `<span is="e-tag">${metric}</span>`).join('')
}

/**
 * The fonts the page registers.
 *
 * The config comes from the server with the faces, so it holds whatever is on
 * disk. `musicJs` overrides where one music font's module comes from, which is
 * how a typed correction reaches the worker.
 */
function fontConfig(musicJs = {}) {
  const config = JSON.parse(JSON.stringify(faces.config || {}))
  for (const [ name, url ] of Object.entries(musicJs)) {
    if (config.music && config.music[name]) {
      config.music[name] = { ...config.music[name], js: url }
    }
  }
  return config
}

/*
The music-js source of each font, read from the same file Apply writes.

It used to come from the generated mirror under /js/msq/worker/, which is a copy
made at build time — so an applied change appeared to revert until that copy was
rebuilt. Reading the source directly is what makes Apply visible.
*/
const fontSources = new Map()
async function musicJsSource(name) {
  if (!fontSources.has(name)) {
    const response = await fetch(`/dev/font-source/${name}`)
    if (!response.ok) {
      throw new Error(`could not read ${name}.js`)
    }
    fontSources.set(name, await response.text())
  }
  return fontSources.get(name)
}

/*
Registering a preview.

The worker refuses a second registration under a reference it already holds, so
each preview gets its own. The patched font goes in as a blob: the worker
imports it like any other module, and nothing is written to disk.
*/
let previewCount = 0
const previews = new Map()

/**
 * A reference whose font carries what has been traced.
 *
 * The score is drawn by the worker out of the font module it imported, so the
 * only way a traced glyph — at whatever size and interval it was traced — can
 * reach the stave is to give the worker a different module. The server makes
 * that module by the same edit Apply would write, without writing it, and it
 * goes in as a blob: nothing on disk changes until Apply is pressed.
 */
async function referenceWithTracing(font, entry, correction) {
  /*
  Until one of the three values has been touched, what is on screen is the font
  as it stands — and registering a preview of it would mean re-reading every
  font in the config for no difference at all.
  */
  if (!tuning || !traced.length) {
    return currentReference
  }

  const key = `${currentReference}|${font}|${entry}|${correction}|${traced.join(' ')}`
  if (previews.has(key)) {
    return previews.get(key)
  }

  const response = await fetch('/dev/font-glyph/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      font,
      entry,
      points: traced,
      yCorrection: correction === null ? undefined : correction
    })
  })
  if (!response.ok) {
    const failed = await response.json().catch(() => ({}))
    throw new Error(failed.error || `the server answered ${response.status}`)
  }

  const url = URL.createObjectURL(new Blob([ await response.text() ], { type: 'text/javascript' }))
  const reference = `${FONT_SOURCES_REFERENCE}-preview-${++previewCount}`
  const config = fontConfig({ [font]: url })

  await registerWithWorker(reference, config)
  registerFontNames(reference, config)
  previews.set(key, reference)
  return reference
}

/*
Rendering the example.

An msq-editor cannot be re-rendered: it replaces itself with the engraved view
and guards on having rendered once. So each time anything changes we build a
fresh template and let insertion drive it, which is the element's own lifecycle.
*/
async function renderEditor() {
  const entry = elements.entry.value
  const font = elements.font.value
  const example = await glyphExample(entry)

  /*
  The interval between stave lines is what the page is measured in, and in the
  language it is spelled `font size` — the same property, under the name the
  style command uses. Putting it in the source is what makes the input change
  the whole example rather than only the glyph: the traced points are written
  against the interval, so a glyph keeps its proportions while everything around
  it grows with the stave.

  The size input above is the other half of that pair, and deliberately not this:
  it scales the one glyph being traced, against a stave that stays put.
  */
  const interval = Number(elements.interval.value)
  const staveSize = Number.isFinite(interval) && interval > 0
    ? `font size is ${interval}\n`
    : ''
  const source = `music font is ${font}\n${staveSize}\n${example.msq}`

  const typed = elements.correction.value === '' ? null : Number(elements.correction.value)
  let reference = currentReference
  try {
    reference = await referenceWithTracing(font, entry, typed)
  } catch (error) {
    window.showError(`Could not preview it: ${error.message}`)
  }

  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', reference)
  template.setAttribute('data-editor-height', '320px')
  // The source goes in through innerState rather than as content, which is the
  // hook MSQTemplateElement reads before falling back to its template content.
  template.innerState = source

  elements.editor.replaceChildren(template)
  elements.status.textContent = `${entry} — engraved with ${font}` +
    (reference === currentReference ? '' : ', showing what you have traced') +
    ` · ${example.from}`
  showGlyphPlace()
}

let renderSoon = null
function refresh({ retrace = true } = {}) {
  clearTimeout(renderSoon)
  renderSoon = setTimeout(async () => {
    if (retrace) {
      await traceGlyph()
    }
    await renderEditor()
  }, 120)
}

/**
 * Picking an entry fills in its codepoint, its size and its correction, so the
 * three inputs always describe the glyph on screen.
 */
async function loadEntry() {
  const glyph = entryNamed(elements.entry.value)
  if (!glyph) {
    return
  }
  tuning = false
  elements.codepoint.value = unicodeLabel(glyph.smufl).split(' ')[0]
  const sourceSize = scaffold.find((node) => node.name === 'musicFontSourceSize')
  elements.size.value = String((sourceSize ? sourceSize.value : 4) * (glyph.scale || 1))
  await syncCorrectionFromFont()
}

/**
 * Show the yCorrection the selected font actually holds for the selected entry.
 *
 * It comes out of that font's own music-js file rather than out of the scaffold,
 * whose value is only the midpoint the font started from — switching font has to
 * show what that font says, since that is what Apply would overwrite.
 *
 * Most glyphs are not positioned by a yCorrection at all: an articulation sits at
 * a yOffset from the note, and many entries carry neither. Offering an input for
 * a value the entry does not have would invite tuning something that can never
 * take effect, so it is disabled and says which value the glyph does use.
 */
async function syncCorrectionFromFont() {
  const glyph = glyphs.get(elements.entry.value)
  let correction = null
  try {
    correction = readYCorrection(
      await musicJsSource(elements.font.value), elements.entry.value
    )
  } catch {
    correction = null
  }

  const offset = ((glyph && glyph.rest) || []).find((one) => one.name === 'yOffset')
  elements.correction.value = correction === null ? '' : String(correction)
  elements.correction.disabled = correction === null
  elements.correction.placeholder = correction !== null
    ? ''
    : offset
      ? `not used — positioned by yOffset ${offset.value}`
      : 'not used by this glyph'
  refresh()
}

/**
 * Step to the glyph before or after this one in the table.
 *
 * The order is the scaffold's, which is the order the font file is written in —
 * so walking it goes through a family at a time rather than alphabetically
 * across unrelated signs.
 */
async function stepGlyph(by) {
  const names = entryNames()
  const at = names.indexOf(elements.entry.value)
  const next = names[(at + by + names.length) % names.length]
  if (!next) {
    return
  }
  elements.entry.value = next
  elements.entry.refresh()
  await loadEntry()
  writeUrl({ push: true })
}

/**
 * Where in the table you are, so walking it has a sense of distance.
 */
function showGlyphPlace() {
  const names = entryNames()
  const at = names.indexOf(elements.entry.value)
  elements.glyphPlace.textContent = at === -1
    ? ''
    : `${at + 1} of ${names.length}`
}

/*
Whether anything has been tuned since the glyph was picked.

The preview is not free — it asks the server for a patched font and hands the
worker a fresh registration — so it is only built once a value has actually been
changed. Picking another glyph puts you back to looking at the font as it is.
*/
let tuning = false

/*
The controls live in the address bar.

Everything the page shows is derived from these six values, so putting them in
the query string makes a view reloadable and shareable, and lets the back button
walk through what was looked at. Only committed changes are recorded — picking a
font or a glyph, or leaving a field — so a back press steps between states rather
than between keystrokes.
*/
const URL_FIELDS = [ 'font', 'entry', 'codepoint', 'size', 'interval', 'correction' ]
let applyingUrl = false

function writeUrl({ push = false } = {}) {
  if (applyingUrl) {
    return
  }
  const params = new URLSearchParams()
  for (const field of URL_FIELDS) {
    const value = elements[field].value
    if (value !== '' && !elements[field].disabled) {
      params.set(field, value)
    }
  }
  const url = `${location.pathname}?${params}`
  if (url === `${location.pathname}${location.search}`) {
    return
  }
  history[push ? 'pushState' : 'replaceState'](null, '', url)
}

async function applyUrl() {
  const params = new URLSearchParams(location.search)
  applyingUrl = true

  if (params.has('font') && [ ...elements.font.options ].some((o) => o.value === params.get('font'))) {
    elements.font.value = params.get('font')
    elements.font.refresh()
  }
  if (params.has('entry') && entryNames().includes(params.get('entry'))) {
    elements.entry.value = params.get('entry')
    elements.entry.refresh()
  }

  // Fill in the entry's own defaults first, so anything the url does not carry
  // still describes the glyph rather than whatever was on screen before.
  await loadEntry()

  for (const field of [ 'codepoint', 'size', 'interval', 'correction' ]) {
    if (params.has(field) && !elements[field].disabled) {
      elements[field].value = params.get(field)
    }
  }
  applyingUrl = false
  // Seed the address bar so the very first view is reloadable too, without
  // adding a history entry for simply having opened the page.
  writeUrl()
  refresh()
}

window.addEventListener('popstate', () => { applyUrl() })

elements.entry.addEventListener('change', async () => {
  await loadEntry()
  writeUrl({ push: true })
})
control('save-example').addEventListener('click', () => saveExample({
  file: glyphExampleFile(elements.entry.value),
  msq: musicIn(elements.editor),
  what: `"${elements.entry.value}"`,
  says: control('example-says')
}))

elements.previousGlyph.addEventListener('click', () => stepGlyph(-1))
elements.nextGlyph.addEventListener('click', () => stepGlyph(1))
elements.font.addEventListener('change', async () => {
  await syncCorrectionFromFont()
  writeUrl({ push: true })
})
for (const id of [ 'codepoint', 'size', 'interval', 'correction' ]) {
  elements[id].addEventListener('change', () => writeUrl({ push: true }))
}
/*
Typing redraws but does not touch the address bar. Replacing the current entry
on every keystroke would overwrite the very state a back press should return to,
so the url only moves when a value is committed — on blur, on Enter, or on
picking from a list.
*/
/*
The codepoint and the size change the glyph itself, so they put the page into
tuning — which is what builds a preview font for the stave to be drawn from.
*/
for (const id of [ 'codepoint', 'size' ]) {
  elements[id].addEventListener('input', () => {
    tuning = true
    refresh()
  })
}

/*
The interval does not. A glyph is traced at `size × interval` and its numbers
written back divided by the interval, so the interval cancels out of what is
stored — it is the size of the stave, not of the glyph, and it reaches the
example as `font size is …` in the source rather than through a patched font.
*/
elements.interval.addEventListener('input', () => refresh())
elements.correction.addEventListener('input', () => {
  tuning = true
  refresh({ retrace: false })
})

control('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(elements.points.value)
    window.showToast('Points copied.')
  } catch {
    elements.points.select()
    window.showToast('Selected — press Cmd/Ctrl+C.')
  }
})

control('apply').addEventListener('click', async () => {
  const entry = elements.entry.value
  const font = elements.font.value
  if (!traced.length) {
    window.showError('Nothing traced to apply.')
    return
  }

  const confirmed = await window.confirmAction(
    `Write the traced points for "${entry}" into src/drawer/font/music-js/${font}.js?` +
    ' This changes a file in the working tree.',
    'Write it', 'Leave it'
  )
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/dev/font-glyph', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        font,
        entry,
        points: traced,
        yCorrection: elements.correction.value === ''
          ? undefined
          : Number(elements.correction.value)
      })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || `the server answered ${response.status}`)
    }
    // What is on disk has changed, so the cached copy the preview patches must go.
    fontSources.delete(result.font)
    window.showToast(
      `Wrote ${result.wrote} point lines into ${result.font}.js` +
      `${result.yCorrection ? ' and its yCorrection' : ''}.`
    )
  } catch (error) {
    window.showError(`Could not apply: ${error.message}`)
  }
})

// Surface what the element swallows: render() is called without await.
window.addEventListener('unhandledrejection', (event) => {
  window.showError(`Render failed: ${event.reason?.message || event.reason}`)
})

// --- the text and chord-letter tabs -----------------------------------------

/*
What each face is asked to set.

A face is judged where it is used, so each example is the work that face does
and nothing else: the text one carries every piece of type on a page, and the
chord one the figures a chord face has to cope with.

Both are files, like the glyph examples, so a poor example can be rewritten as
music. Neither names a font: which faces are engraved with is the business of
the controls above, and putting them in the file would pin the example to one.
*/
const TEXT_EXAMPLE_FILE = '_text.txt'
const CHORD_EXAMPLE_FILE = '_chord-letters.txt'

/*
An engraved example, built the way the music tab builds its own: an msq-editor
cannot be re-rendered, so each time anything changes a fresh template is made
and insertion drives it.
*/
function engrave(where, source, height = '300px') {
  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', currentReference)
  template.setAttribute('data-editor-height', height)
  template.innerState = source
  where.replaceChildren(template)
}

async function renderTextExample() {
  const face = faceNamed('text', elements.textFont.value)
  if (!face) {
    elements.textSays.textContent = 'No text face is available.'
    return
  }
  const example = await exampleIn(TEXT_EXAMPLE_FILE)
  elements.textSays.textContent = `${face.name} — ${face.says} · ${example.from}`
  engrave(
    elements.textEditor,
    `music font is ${elements.textMusicFont.value}\ntext font is ${face.name}\n\n${example.msq}`,
    '260px'
  )
}

async function renderChordExample() {
  const face = faceNamed('chord-letters', elements.chordFont.value)
  if (!face) {
    elements.chordSays.textContent = 'No chord face is available.'
    return
  }
  const example = await exampleIn(CHORD_EXAMPLE_FILE)
  elements.chordSays.textContent = `${face.name} — ${face.says} · ${example.from}`
  engrave(
    elements.chordEditor,
    `music font is ${elements.chordMusicFont.value}\nchord letters font is ${face.name}\n\n${example.msq}`,
    '240px'
  )
}

// --- registering what is on disk ---------------------------------------------

/*
The worker refuses a second registration under a reference it already holds, so
a changed set of faces is registered under a fresh one. That is also how the
music tab previews a correction, and the two are kept apart by name.
*/
let currentReference = FONT_SOURCES_REFERENCE
let registrations = 0

function askWorker(message) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()
    const onMessage = (event) => {
      if (event.data.id !== id) {
        return
      }
      worker.removeEventListener('message', onMessage)
      event.data.error ? reject(new Error(event.data.error)) : resolve(event.data)
    }
    worker.addEventListener('message', onMessage)
    worker.postMessage({ id, ...message })
  })
}

function registerWithWorker(reference, config) {
  return askWorker({
    name: 'fonts.setup', fontConfig: config, fontSourcesReference: reference
  })
}

/**
 * Read the faces again and put them in front of the worker and the pickers.
 *
 * Called on load, and after anything is added — which is what makes a face
 * usable the moment it lands rather than after a reload.
 */
async function loadFaces({ choose = null, askAgain = false } = {}) {
  /*
  What is showing now, before the pickers are emptied: EHTML refills a select by
  clearing it, so a choice not written down here is gone by the time the new
  options arrive. A face just added is the one you want to look at, so it wins
  over what was showing.
  */
  const wasChosen = {
    font: choose || elements.font.value,
    textMusicFont: elements.textMusicFont.value,
    chordMusicFont: elements.chordMusicFont.value,
    textFont: choose || elements.textFont.value,
    chordFont: choose || elements.chordFont.value
  }

  const answered = askAgain
    ? await fontsFromTheServer.askAgain('fonts')
    : await fontsFromTheServer.next()
  if (!answered) {
    throw new Error('the fonts could not be read')
  }
  faces = answered

  const pickers = [
    [ elements.font, wasChosen.font, 'bravura' ],
    [ elements.textMusicFont, wasChosen.textMusicFont, 'bravura' ],
    [ elements.chordMusicFont, wasChosen.chordMusicFont, 'bravura' ],
    [ elements.textFont, wasChosen.textFont, 'noto-serif' ],
    [ elements.chordFont, wasChosen.chordFont, 'gentium plus' ]
  ]
  await Promise.all(pickers.map(([ picker ]) => whenFilled(picker)))
  for (const [ picker, chosen, fallback ] of pickers) {
    keepTheChoice(picker, chosen, fallback)
  }

  const reference = registrations === 0
    ? FONT_SOURCES_REFERENCE
    : `${FONT_SOURCES_REFERENCE}-${registrations}`
  await registerWithWorker(reference, fontConfig())
  registerFontNames(reference, fontConfig())
  registrations += 1
  currentReference = reference
}

/**
 * The glyph entries the picker offers, and the default to open on.
 */
async function loadEntries() {
  const answered = await entriesFromTheServer.next()
  if (!answered) {
    throw new Error('the glyph entries could not be read')
  }
  offeredEntries = answered.entries || []
  await whenFilled(elements.entry)
  /*
  A select with options selects its first one, so there is nothing to keep here
  — the page opens on the treble clef, which is the glyph worth seeing first,
  and the url overrides that a moment later if it names one.
  */
  keepTheChoice(elements.entry, null, 'treble')
}

/*
Called from the upload forms, which are EHTML and know nothing of any of this.
*/
window.fontsChanged = async function (name) {
  try {
    // What is on disk has changed, so anything cached from it must go.
    fontSources.clear()
    await loadFaces({ choose: name, askAgain: true })
    renderShownTab()
  } catch (error) {
    window.showError(`Could not read the fonts again: ${error.message}`)
  }
}

// --- which tab is showing ----------------------------------------------------

/*
An editor measures itself as it renders, and a tab that is not showing has no
size — so each example is engraved when its tab is chosen rather than on load.
It also means opening the page engraves one score instead of three.
*/
let shownTab = 0
const rendered = new Set()

function renderShownTab({ force = true } = {}) {
  if (shownTab === 0) {
    refresh()
    return
  }
  if (!force && rendered.has(shownTab)) {
    return
  }
  rendered.add(shownTab)
  shownTab === 1 ? renderTextExample() : renderChordExample()
}

/*
`e-tabs` builds its nav one microtask after EHTML activates it and offers no
event when a tab is chosen, so the buttons it generates are what we listen on.

It is also what decides which tab opens, and it records that on itself — so
this waits for the nav and then hands the element back, rather than anything
here working out the answer a second time.
*/
async function watchTabs() {
  const families = control('families')
  while (!families.querySelector('nav')) {
    await new Promise((resolve) => setTimeout(resolve))
  }
  families.querySelector('nav').querySelectorAll('button').forEach((button, position) => {
    button.addEventListener('click', () => {
      shownTab = position
      renderShownTab({ force: false })
    })
  })
  return families
}

/*
The save button on each face tab, writing to that face's own file.
*/
for (const [ kind, file, editor ] of [
  [ 'text', TEXT_EXAMPLE_FILE, 'textEditor' ],
  [ 'chord', CHORD_EXAMPLE_FILE, 'chordEditor' ]
]) {
  control(`save-${kind}-example`).addEventListener('click', () => saveExample({
    file,
    msq: musicIn(elements[editor]),
    what: kind === 'text' ? 'the text face' : 'the chord face',
    says: control(`${kind}-example-says`)
  }))
}

for (const [ picker, render ] of [
  [ elements.textFont, renderTextExample ], [ elements.textMusicFont, renderTextExample ],
  [ elements.chordFont, renderChordExample ], [ elements.chordMusicFont, renderChordExample ]
]) {
  picker.addEventListener('change', render)
}

// --- starting up --------------------------------------------------------------

/*
Nothing can be engraved until the worker has the fonts, and the fonts are not
known until the server has been asked. So the order is: read the faces, register
them, then draw whichever tab is showing.
*/
/*
An e-json parses every answer as JSON and throws where it cannot — which is what
a server that does not know a route looks like, since an unknown one answers
`405 Not Allowed` in plain text. That throw happens inside EHTML, so the actions
that would have handed a failure over here never run, and waiting on them would
be waiting for ever. A page showing nothing and saying nothing is the worst of
the outcomes, so the wait is bounded and says what it was waiting for.
*/
const orGiveUp = (waiting, what) => Promise.race([
  waiting,
  new Promise((resolve, reject) => setTimeout(
    () => reject(new Error(
      `nothing came back for ${what} — if the dev server has been running since` +
      ' before this page changed, restart it'
    )),
    10000
  ))
])

try {
  await Promise.all([
    orGiveUp(loadFaces(), 'the fonts'),
    orGiveUp(loadEntries(), 'the glyph entries')
  ])
  /*
  Which tab is open, as e-tabs itself decided — from the hash where the page
  carries one, and the first otherwise. It writes that on the element as
  `data-current-tab`, so the page has only to read its answer; working the
  title-to-hash rule out again here would be a second copy of it to go stale.
  */
  const families = await watchTabs()
  shownTab = Number(families.getAttribute('data-current-tab')) || 0
  rendered.add(shownTab)
  shownTab === 0 ? applyUrl() : renderShownTab()
} catch (error) {
  window.showError(`Could not set the fonts up: ${error.message}`)
}
