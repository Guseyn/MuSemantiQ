import '#msq/msq-font-loader-template.js'
import '#msq/msq-editor-template.js'
import opentype from '#msq/worker/drawer/lib/opentype/opentype.js'
import generateUnicodePoints from '#msq/worker/drawer/generateUnicodePoints.js'
import scaffold from '#msq/worker/tools/smufl-font-scaffold.js'
import glyphExample from '#msq/font-viewer/glyphExamples.js'
import '#msq/font-viewer/searchable-select.js'
import { readYCorrection, patchYCorrection } from '#msq/font-viewer/patchYCorrection.js'
import worker from '#msq/utils/worker-instance.js'
import { registerFontNames } from '#msq/utils/fontNames.js'

const MUSIC_FONTS = [
  { name: 'bravura', file: 'Bravura.otf' },
  { name: 'leland', file: 'Leland.otf' },
  { name: 'petaluma', file: 'Petaluma.otf' },
  { name: 'musejazz', file: 'MuseJazz.otf' }
]
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
  metrics: control('metrics')
}

// Every glyph the scaffold defines, flattened so nested letter maps are pickable.
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

for (const { name } of MUSIC_FONTS) {
  const option = document.createElement('option')
  option.value = name
  option.textContent = name
  elements.font.appendChild(option)
}
for (const name of glyphs.keys()) {
  const option = document.createElement('option')
  option.value = name
  option.textContent = name
  elements.entry.appendChild(option)
}
elements.entry.value = 'treble'

const loadedFonts = new Map()
async function fontFor(name) {
  if (!loadedFonts.has(name)) {
    const { file } = MUSIC_FONTS.find((one) => one.name === name)
    loadedFonts.set(name, await opentype.load(`/font/music/${file}`))
  }
  return loadedFonts.get(name)
}

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
  const font = await fontFor(elements.font.value)

  const missing = [ ...characters ].filter(
    (character) => font.charToGlyphIndex(character) === 0
  )
  if (missing.length) {
    traced = []
    elements.points.value = ''
    elements.metrics.innerHTML =
      `<span is="e-tag">${unicodeLabel(characters)} is not in this font</span>`
    return
  }

  traced = generateUnicodePoints(characters, font, null, size, interval).map(
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
 * The fonts the page registers. `musicJs` overrides where one music font's
 * module comes from, which is how a typed correction reaches the worker.
 */
function fontConfig(musicJs = {}) {
  return {
    'chord-letters': {
      'gentium plus': '/font/chord-letters/GentiumPlus-Regular.ttf',
      'gothic a1': '/font/chord-letters/GothicA1-Regular.ttf'
    },
    'text': {
      'noto-serif': {
        'regular': '/font/text/NotoSerif-Regular.ttf', 'bold': '/font/text/NotoSerif-Bold.ttf'
      },
      'noto-sans': {
        'regular': '/font/text/NotoSans-Regular.ttf', 'bold': '/font/text/NotoSans-Bold.ttf'
      }
    },
    'music': Object.fromEntries(MUSIC_FONTS.map(({ name, file }) => [ name, {
      font: `/font/music/${file}`,
      js: musicJs[name] || `/js/msq/worker/drawer/font/music-js/${name}.js`
    } ]))
  }
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

async function referenceWithCorrection(font, entry, correction) {
  const source = await musicJsSource(font)
  const current = readYCorrection(source, entry)
  if (current === null || correction === null || correction === current) {
    return FONT_SOURCES_REFERENCE
  }

  const key = `${font}|${entry}|${correction}`
  if (previews.has(key)) {
    return previews.get(key)
  }

  const patched = patchYCorrection(source, entry, correction)
  const url = URL.createObjectURL(new Blob([ patched ], { type: 'text/javascript' }))
  const reference = `${FONT_SOURCES_REFERENCE}-preview-${++previewCount}`
  const config = fontConfig({ [font]: url })

  await new Promise((resolve, reject) => {
    const id = crypto.randomUUID()
    const onMessage = (event) => {
      if (event.data.id !== id) {
        return
      }
      worker.removeEventListener('message', onMessage)
      event.data.error ? reject(new Error(event.data.error)) : resolve()
    }
    worker.addEventListener('message', onMessage)
    worker.postMessage({ id, name: 'fonts.setup', fontConfig: config, fontSourcesReference: reference })
  })

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
  const source = `music font is ${font}\n\n${glyphExample(entry)}`

  const typed = elements.correction.value === '' ? null : Number(elements.correction.value)
  let reference = FONT_SOURCES_REFERENCE
  try {
    reference = await referenceWithCorrection(font, entry, typed)
  } catch (error) {
    window.showError(`Could not preview the correction: ${error.message}`)
  }

  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', reference)
  template.setAttribute('data-editor-height', '320px')
  // The source goes in through innerState rather than as content, which is the
  // hook MSQTemplateElement reads before falling back to its template content.
  template.innerState = source

  elements.editor.replaceChildren(template)
  elements.status.textContent = `${entry} — engraved with ${font}` +
    (reference === FONT_SOURCES_REFERENCE ? '' : `, yCorrection ${typed} previewed`)
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
  const glyph = glyphs.get(elements.entry.value)
  if (!glyph) {
    return
  }
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
  if (params.has('entry') && glyphs.has(params.get('entry'))) {
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
for (const id of [ 'codepoint', 'size', 'interval' ]) {
  elements[id].addEventListener('input', () => refresh())
}
elements.correction.addEventListener('input', () => refresh({ retrace: false }))

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

/*
Fonts are registered once for the life of the page — the worker refuses a second
registration under the same reference — by letting a font loader unwrap itself
around the mount point before anything asks for an engraving.
*/
const loader = document.createElement('template', { is: 'msq-font-loader' })
loader.setAttribute('data-font-sources-reference', FONT_SOURCES_REFERENCE)
loader.setAttribute('data-font-config', JSON.stringify(fontConfig()))

/*
The loader unwraps by inserting a *copy* of its content, so the marker has to be
recognisable by attribute — a reference to the node put in would point at the
original, which never reaches the document.
*/
const ready = document.createElement('div')
ready.setAttribute('data-fonts-ready', '')
loader.content.appendChild(ready)
elements.editor.replaceChildren(loader)

// The selects enhance themselves on connect; they only need telling when their
// value has been set from script rather than chosen from the list.
elements.font.refresh()
elements.entry.refresh()

// The loader replaces itself once the worker has the fonts; only then is there
// any point asking for an engraving.
new MutationObserver((records, observer) => {
  if (elements.editor.querySelector('[data-fonts-ready]')) {
    observer.disconnect()
    applyUrl()
  }
}).observe(elements.editor, { childList: true, subtree: true })
