import './searchable-select.js'
import '#msq/web-components/msq-font-loader-template.js'
import '#msq/web-components/msq-editor-template.js'
import highlightsCss from '#msq/web-components/css/highlights.js'

await window.whenPresent('#viewer')

const viewer = document.getElementById('viewer')
const tabs = document.getElementById('suites')
const picker = document.getElementById('suite-picker')
const testSelect = document.getElementById('test')
const at = (id) => document.getElementById(id)

const index = await (await fetch('/dev/tests')).json()
const visual = index.suites.filter((suite) => suite.kind === 'visual')
const audio = index.suites.filter((suite) => suite.kind === 'audio')

const firstOf = (group) => (group[0] ? group[0].name : null)

/*
The visual corpus to begin with. Which tab the page actually opens on is
e-tabs' decision — it reads the hash — and the suite is moved to match once it
has made it, at the foot of this file.
*/
const state = { suite: firstOf(visual), test: null, artifact: null }

const suiteNamed = (name) => index.suites.find((one) => one.name === name)

const escaped = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]))

/**
 * Fill the picker with the tests of whichever suite is showing.
 *
 * It sits above the tabs, so switching tab repoints it rather than replacing it,
 * and the test that was being looked at is kept if the new suite also has one by
 * that name — which it usually does, since the two visual suites run the same
 * corpus against different fonts.
 */
function fillTestSelect() {
  const suite = suiteNamed(state.suite)
  const failing = new Set(suite.failed)
  const wanted = state.test

  testSelect.replaceChildren()
  for (const name of suite.tests) {
    const option = document.createElement('option')
    option.value = name
    option.textContent = failing.has(name) ? `${name} — failing` : name
    testSelect.appendChild(option)
  }

  state.test = suite.tests.includes(wanted) ? wanted : null
  testSelect.value = state.test || ''
  testSelect.refresh()
  showPlaceInTheSuite()
}

/**
 * Where in the suite this test is, so walking it has a sense of distance.
 */
function showPlaceInTheSuite() {
  const tests = suiteNamed(state.suite).tests
  const index = tests.indexOf(state.test)
  at('test-place').textContent = index === -1
    ? `${tests.length} tests`
    : `${index + 1} of ${tests.length}`
}

/**
 * Step to the test before or after this one, in the order the runner walks
 * them — which is the order the names sort in, so a prefix stays together.
 */
function stepTest(by) {
  const tests = suiteNamed(state.suite).tests
  if (!tests.length) {
    return
  }
  const index = tests.indexOf(state.test)
  state.test = index === -1
    ? tests[by > 0 ? 0 : tests.length - 1]
    : tests[(index + by + tests.length) % tests.length]
  state.artifact = null
  testSelect.value = state.test
  testSelect.refresh()
  showPlaceInTheSuite()
  render()
}

/**
 * Read the index again, after a test has been added.
 *
 * The suites are fetched once at load, so a new test is invisible until they
 * are asked for again — and the one just written is the one to look at.
 */
async function refreshTheIndex() {
  const fresh = await (await fetch('/dev/tests')).json()
  /*
  The suites are updated in place rather than replaced: the visual and audio
  lists hold these very objects, and swapping the array would leave them
  pointing at the old one.
  */
  for (const suite of index.suites) {
    const again = fresh.suites.find((one) => one.name === suite.name)
    if (again) {
      suite.tests = again.tests
      suite.failed = again.failed
    }
  }
}

window.testWritten = async function (name) {
  try {
    await refreshTheIndex()
    state.test = name
    fillTestSelect()
    render()
    at('new-test').close()
  } catch (error) {
    window.showError(`Written, but the list could not be read again: ${error.message}`)
  }
}

/*
The editor in the dialog engraves as you write, which means the worker needs the
fonts. They are registered the first time the dialog is opened rather than on
load: most visits to this page never write a test.
*/
const EDITOR_FONTS = 'testViewerFonts'
let fontsAreReady = null

function readyTheFonts() {
  if (!fontsAreReady) {
    fontsAreReady = (async () => {
      const config = (await (await fetch('/dev/fonts')).json()).config
      const loader = document.createElement('template', { is: 'msq-font-loader' })
      loader.setAttribute('data-font-sources-reference', EDITOR_FONTS)
      loader.setAttribute('data-font-config', JSON.stringify(config))
      /*
      The loader inserts a copy of its content, so the marker has to be findable
      by attribute — a reference to the node put in would point at the original,
      which never reaches the document.
      */
      const ready = document.createElement('div')
      ready.setAttribute('data-fonts-ready', '')
      loader.content.appendChild(ready)
      at('new-test-editor').replaceChildren(loader)

      await new Promise((resolve) => {
        new MutationObserver((records, observer) => {
          if (at('new-test-editor').querySelector('[data-fonts-ready]')) {
            observer.disconnect()
            resolve()
          }
        }).observe(at('new-test-editor'), { childList: true, subtree: true })
      })
    })()
  }
  return fontsAreReady
}

/*
An msq-editor cannot be re-rendered — it replaces itself with the engraved view
and guards on having rendered once — so every time the dialog opens it gets a
fresh one.
*/
function engraveInTheDialog(msq) {
  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', EDITOR_FONTS)
  template.setAttribute('data-editor-height', '320px')
  template.innerState = msq
  at('new-test-editor').replaceChildren(template)
}

/**
 * What is in the dialog's editor now.
 *
 * Global because the button that saves is an EHTML one, and its `onclick` is
 * evaluated in global scope.
 */
window.musicInTheDialog = function musicInTheDialog() {
  const host = at('new-test-editor').querySelector('div[data-rendered-by]')
  const textarea = host && host.shadowRoot.querySelector('textarea[data-msq-input]')
  return textarea ? textarea.value.trim() : ''
}

/**
 * Open the writing dialog, either on a blank test or on one that exists.
 *
 * The two differ in three things — the title, where the request goes, and
 * whether the name can still be chosen — so they are one dialog rather than two
 * that would drift apart.
 */
async function openTheDialog({ editing }) {
  const kind = suiteNamed(state.suite).kind
  const suites = kind === 'visual' ? visual : audio

  at('new-test-kind').value = kind
  at('new-test-title').textContent = editing ? `Edit ${state.test}` : 'A new test'
  at('new-test-says').textContent =
    `It will be written into ${suites.map((one) => one.name).join(' and ')}.`

  const button = at('write-test')
  button.setAttribute('data-request-url', editing ? '/dev/tests/source' : '/dev/tests/new')
  button.textContent = editing ? 'Save and run it' : 'Write it'

  const name = at('new-test-name')
  name.readOnly = editing
  name.value = editing ? state.test : ''
  at('new-test-msq').value = ''

  let music = 'measure\ntreble clef\n1/4 c, d, e, f'

  if (editing) {
    /*
    The source comes from the suite that is showing, without its `music font is`
    line: that line belongs to the suite rather than to the test, and is written
    back on save.
    */
    try {
      const source = await (await fetch(
        `/dev/tests/source?suite=${encodeURIComponent(state.suite)}&test=${encodeURIComponent(state.test)}`
      )).json()
      if (source.error) {
        throw new Error(source.error)
      }
      music = source.msq
    } catch (error) {
      window.showError(`Could not read the test: ${error.message}`)
      return
    }
  }

  at('new-test').showModal()

  /*
  The editor measures itself as it renders, so it is built after the dialog is
  open and has a size — before that it would lay out against nothing.
  */
  try {
    await readyTheFonts()
    engraveInTheDialog(music)
  } catch (error) {
    window.showError(`Could not open the editor: ${error.message}`)
  }
}

/*
The tab a suite belongs to. `e-tabs` builds its nav one microtask after EHTML
activates it, and offers no event when a tab is chosen, so the buttons it
generates are what we listen on.
*/
async function watchTabs() {
  while (!tabs.querySelector('nav')) {
    await new Promise((resolve) => setTimeout(resolve))
  }
  tabs.querySelector('nav').querySelectorAll('button').forEach((button, position) => {
    button.addEventListener('click', () => {
      const group = position === 0 ? visual : audio
      if (group.length && !group.some((one) => one.name === state.suite)) {
        showSuite(group[0].name)
      }
    })
  })
  return tabs
}

/**
 * One button per suite of the kind the tab has chosen, between the tabs and the
 * test picker — the visual tests are the same corpus once per font, so which
 * font is being looked at is a step of its own.
 *
 * A kind with a single suite has nothing to choose, so the row is left empty
 * rather than showing one button that does nothing.
 */
function drawSuitePicker() {
  const group = suiteNamed(state.suite).kind === 'visual' ? visual : audio
  if (group.length < 2) {
    return picker.replaceChildren()
  }
  picker.innerHTML = `
    <div is="e-row" data-gap="sm" data-margin-top="md" data-keep-flex-direction-row-in-mobile>
      ${group.map((suite) => `
        <button type="button" data-primary
          ${suite.name === state.suite ? '' : 'data-fill="outlined"'}
          data-pick-suite="${escaped(suite.name)}">${escaped(suite.label)}</button>
      `).join('')}
    </div>`

  picker.querySelectorAll('[data-pick-suite]').forEach((button) => {
    button.addEventListener('click', () => {
      showSuite(button.getAttribute('data-pick-suite'))
    })
  })
}

/**
 * Look at another suite: the picker, the test list and the comparison all
 * follow from it.
 */
function showSuite(name) {
  if (name === state.suite) {
    return
  }
  state.suite = name
  state.artifact = null
  drawSuitePicker()
  fillTestSelect()
  render()
}

function render() {
  viewer.innerHTML = `
    <div id="detail">
      ${state.test
        ? '<p is="e-p"><span is="e-muted">Loading…</span></p>'
        : '<p is="e-p"><span is="e-muted">Pick a test to compare it.</span></p>'}
    </div>`

  if (state.test) {
    renderDetail()
  }
}

/**
 * One side of one artifact, rendered as what it is: a score, a sound, a tree or
 * text.
 */
function sideMarkup(artifact, side, present) {
  const url = `${artifact.url}/${side}/${artifact.file}`
  if (!present) {
    return `<p is="e-p"><span is="e-muted">no ${side} file</span></p>`
  }
  if (artifact.extension === 'svg') {
    return `<e-scrollable data-show-scrollbar data-scrolls data-score>` +
      `<img src="${url}" alt="${side} ${artifact.name}" loading="lazy"></e-scrollable>`
  }
  if (artifact.extension === 'mid') {
    return `<div data-sounds><midi-player data-src="${url}" sound-font></midi-player></div>`
  }
  /*
  The highlight artifact is markup, and what it is meant to look like is the
  point of it — a colour that came out wrong is invisible in the source and
  obvious on the page. The markup is kept underneath for the times the question
  is which span carries which class.
  */
  if (artifact.extension === 'html') {
    return `<e-scrollable data-show-scrollbar data-scrolls>` +
      `<div data-highlights data-load="${url}">loading…</div></e-scrollable>` +
      `<details is="e-details" data-margin-top="sm">` +
      `<summary>markup</summary>` +
      `<pre is="e-pre" data-load="${url}">loading…</pre></details>`
  }
  return `<e-scrollable data-show-scrollbar data-scrolls>` +
    `<pre is="e-pre" data-load="${url}">loading…</pre></e-scrollable>`
}

/*
The highlight colours, as the editor defines them, plus the two properties they
are written against — which the editor declares on its own `:host` and so does
not reach a page.
*/
const HIGHLIGHT_STYLE = /* css */`
  :host {
    display: block;
    --editor-font-color: #1f2d3a;
    --muted-font-color: #4c5866;
  }
  pre {
    margin: 0;
    font-family: var(--e-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--editor-font-color);
  }
` + highlightsCss

/**
 * The highlight fragment, rebuilt out of what it is allowed to contain.
 *
 * The highlighter wraps the source in `<span>`s and nothing else, and it copies
 * the matched text through without escaping it — so an MSQ comment holding a
 * tag would arrive here as that tag. Rebuilding from a whitelist renders every
 * artifact these tests actually produce exactly as written, and renders a file
 * that smuggled something else as the text it looks like.
 */
function safeHighlights(html) {
  const source = new DOMParser().parseFromString(html, 'text/html').body
  const fragment = document.createDocumentFragment()
  const copy = (from, to) => {
    for (const node of from.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        to.appendChild(document.createTextNode(node.nodeValue))
      } else if (node.nodeType !== Node.ELEMENT_NODE) {
        // comments and the rest carry nothing worth showing
      } else if (node.tagName !== 'SPAN') {
        // Not markup the highlighter writes: show what it says, not what it is.
        to.appendChild(document.createTextNode(node.outerHTML))
      } else {
        const span = document.createElement('span')
        for (const name of [ 'class', 'ref-id' ]) {
          if (node.hasAttribute(name)) {
            span.setAttribute(name, node.getAttribute(name))
          }
        }
        to.appendChild(span)
        copy(node, span)
      }
    }
  }
  copy(source, fragment)
  return fragment
}

function renderHighlights(node, html) {
  // A shadow root, so two-letter class names like `.ch` cannot reach the page
  // and the page's own styling cannot reach the highlight.
  const shadow = node.shadowRoot || node.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = HIGHLIGHT_STYLE
  const pre = document.createElement('pre')
  pre.appendChild(safeHighlights(html))
  shadow.replaceChildren(style, pre)
  node.textContent = ''
}

async function fillTextSides(root) {
  // A highlight artifact is asked for twice, rendered and as markup; it is read
  // once.
  const reading = new Map()
  const textOf = (url) => {
    if (!reading.has(url)) {
      reading.set(url, fetch(url).then((response) => response.text()))
    }
    return reading.get(url)
  }

  for (const node of root.querySelectorAll('[data-load]')) {
    const url = node.getAttribute('data-load')
    try {
      const text = await textOf(url)
      if (node.hasAttribute('data-highlights')) {
        renderHighlights(node, text)
      } else {
        node.textContent = url.endsWith('.json')
          ? JSON.stringify(JSON.parse(text), null, 2)
          : text
      }
    } catch (error) {
      node.textContent = `could not read it: ${error.message}`
    }
  }
}

async function renderDetail() {
  const detail = viewer.querySelector('#detail')
  if (!detail || !state.test) {
    return
  }

  const status = await (await fetch(
    `/dev/tests/status?suite=${encodeURIComponent(state.suite)}&test=${encodeURIComponent(state.test)}`
  )).json()

  if (!status.artifacts) {
    detail.innerHTML = `<p is="e-p"><span is="e-muted">${escaped(status.error || 'nothing to show')}</span></p>`
    return
  }

  if (!state.artifact || !status.artifacts.some((one) => one.name === state.artifact)) {
    const differing = status.artifacts.find((one) => !one.equal)
    state.artifact = (differing || status.artifacts[0]).name
  }
  const artifact = status.artifacts.find((one) => one.name === state.artifact)
  const differing = status.artifacts.filter((one) => !one.equal).length

  detail.innerHTML = `
    <div is="e-row" data-justify-content="space-between" data-keep-flex-direction-row-in-mobile>
      <h2 is="e-h">${escaped(state.test)}</h2>
      <span is="${differing ? 'e-tag' : 'e-muted'}" data-font-size="sm">
        ${differing ? `${differing} of ${status.artifacts.length} artifacts differ` : 'everything matches'}
      </span>
    </div>

    <div data-artifact-list data-margin-top="sm">
      ${status.artifacts.map((one) => `
        <button type="button" data-primary data-fill="outlined"
          data-pick-artifact="${escaped(one.name)}"
          data-current="${one.name === artifact.name}">
          ${escaped(one.name)}${one.equal ? '' : ' •'}
        </button>`).join('')}
    </div>

    <div is="e-row" data-gap="sm" data-margin-top="md" data-keep-flex-direction-row-in-mobile>
      <button type="button" data-primary id="adopt-one"
        ${artifact.equal || !artifact.hasActual ? 'disabled' : ''}>
        Adopt ${escaped(artifact.name)}
      </button>
      <button type="button" data-primary data-fill="outlined" id="adopt-all"
        ${differing ? '' : 'disabled'}>
        Adopt all ${differing || ''}
      </button>
      <div is="e-spacer"></div>
      <a is="e-link" data-underlined href="${status.msq}" target="_blank">source</a>
    </div>

    <div is="e-row" data-gap="md" data-sides data-margin-top="md">
      <div data-side is="e-card" data-width="full" data-padding="md">
        <div is="e-row" data-justify-content="space-between" data-keep-flex-direction-row-in-mobile>
          <b is="e-b">expected</b>
          <span is="e-muted" data-font-size="sm">${window.readableBytes(artifact.bytes.expected)}</span>
        </div>
        ${sideMarkup(artifact, 'expected', artifact.hasExpected)}
      </div>
      <div data-side is="e-card" data-width="full" data-padding="md">
        <div is="e-row" data-justify-content="space-between" data-keep-flex-direction-row-in-mobile>
          <b is="e-b">actual</b>
          <span is="e-muted" data-font-size="sm">${window.readableBytes(artifact.bytes.actual)}</span>
        </div>
        ${sideMarkup(artifact, 'actual', artifact.hasActual)}
      </div>
    </div>`

  detail.querySelectorAll('[data-pick-artifact]').forEach((button) => {
    button.addEventListener('click', () => {
      state.artifact = button.getAttribute('data-pick-artifact')
      renderDetail()
    })
  })
  detail.querySelector('#adopt-one').addEventListener('click', () => adopt(artifact.name))
  detail.querySelector('#adopt-all').addEventListener('click', () => adopt(null))

  await fillTextSides(detail)
}

async function adopt(artifactName) {
  const what = artifactName ? `the ${artifactName} baseline` : 'every differing baseline'
  const confirmed = await window.confirmAction(
    `Replace ${what} for "${state.test}" with what the last run produced?`,
    'Adopt it', 'Leave it'
  )
  if (!confirmed) {
    return
  }
  try {
    const response = await fetch('/dev/tests/adopt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ suite: state.suite, test: state.test, artifact: artifactName || undefined })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || `the server answered ${response.status}`)
    }
    window.showToast(`Adopted ${result.adopted.join(', ') || 'nothing'} for ${result.test}.`)

    /*
    The picker's "failing" label comes from the suite's failed list, which the
    server has just rewritten if this test now matches everywhere. Nothing else
    about the suite changed, so the label is updated in place rather than by
    reading the whole index again.
    */
    const failing = suiteNamed(state.suite).failed
    const already = failing.indexOf(result.test)
    if (result.failing === false && already !== -1) {
      failing.splice(already, 1)
      fillTestSelect()
    }

    await renderDetail()
  } catch (error) {
    window.showError(`Could not adopt: ${error.message}`)
  }
}

testSelect.addEventListener('change', () => {
  state.test = testSelect.value || null
  state.artifact = null
  showPlaceInTheSuite()
  render()
})

at('previous-test').addEventListener('click', () => stepTest(-1))
at('next-test').addEventListener('click', () => stepTest(1))

/*
Which kind is written follows the tab you are on: a visual test lands in every
visual suite, an audio one in the audio suite.
*/
/**
 * Take a test out of the corpus: its source and every artifact either side of
 * the comparison, in every suite of its kind.
 *
 * It is written into all of them at once and so it goes out of all of them at
 * once — a corpus where bravura has a test leland does not have has stopped
 * comparing anything. The walk then carries on at whatever took its place, so
 * you can clear a run of failures without going back to the picker each time.
 */
async function deleteTest() {
  if (!state.test) {
    return window.showError('Pick a test to delete first.')
  }
  const kind = suiteNamed(state.suite).kind
  const group = kind === 'visual' ? visual : audio
  const going = state.test

  const confirmed = await window.confirmAction(
    `Delete "${going}" — its source and every artifact — from ${group.map((one) => one.label).join(' and ')}?`,
    'Delete it', 'Keep it'
  )
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/dev/tests/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ test: going, kind })
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || `the server answered ${response.status}`)
    }

    /*
    Where the walk lands next: the test after the one that went, by position
    rather than by name, since the name is no longer in the list.
    */
    const was = suiteNamed(state.suite).tests.indexOf(going)
    await refreshTheIndex()
    const left = suiteNamed(state.suite).tests
    state.test = left[Math.min(was, left.length - 1)] || null
    state.artifact = null

    fillTestSelect()
    render()
    window.showToast(`${going} deleted — ${result.removed.length} files.`)
  } catch (error) {
    window.showError(`Could not delete it: ${error.message}`)
  }
}

at('delete-test').addEventListener('click', deleteTest)

at('add-test').addEventListener('click', () => openTheDialog({ editing: false }))
at('edit-test').addEventListener('click', () => {
  if (!state.test) {
    window.showError('Pick a test to edit first.')
    return
  }
  openTheDialog({ editing: true })
})

// The midi player is only needed once a midi artifact is looked at, and it pulls
// in a soundfont, so it is loaded lazily rather than on every page view.
let midiPlayerLoaded = false
const loadMidiPlayer = async () => {
  if (!midiPlayerLoaded) {
    midiPlayerLoaded = true
    await import('#msq/web-components/lib/html-midi-player/player.js')
  }
}
new MutationObserver(() => {
  if (viewer.querySelector('midi-player')) {
    loadMidiPlayer()
  }
}).observe(viewer, { childList: true, subtree: true })

/*
Which kind of test is showing is the tab's business, and e-tabs works it out
from the hash and records it as `data-current-tab` — so opening the page at
`#audio` lands on the audio corpus without anything here reading the hash, or
knowing how a tab title becomes one.
*/
const families = await watchTabs()
const group = Number(families.getAttribute('data-current-tab')) === 1 ? audio : visual
if (group.length) {
  state.suite = firstOf(group)
}

drawSuitePicker()
fillTestSelect()
render()
