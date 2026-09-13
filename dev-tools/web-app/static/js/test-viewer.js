import '#msq/font-viewer/searchable-select.js'

await window.whenPresent('#viewer')

const viewer = document.getElementById('viewer')
const tabs = document.getElementById('suites')
const testSelect = document.getElementById('test')

const index = await (await fetch('/dev/tests')).json()
const visual = index.suites.filter((suite) => suite.kind === 'visual')
const audio = index.suites.filter((suite) => suite.kind === 'audio')

const state = { suite: visual[0] ? visual[0].name : null, test: null, artifact: null }

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
}

/*
The tab a suite belongs to. `e-tabs` builds its nav one microtask after EHTML
activates it, and offers no event when a tab is chosen, so the buttons it
generates are what we listen on.
*/
function watchTabs() {
  const nav = tabs.querySelector('nav')
  if (!nav) {
    return queueMicrotask(watchTabs)
  }
  nav.querySelectorAll('button').forEach((button, position) => {
    button.addEventListener('click', () => {
      const group = position === 0 ? visual : audio
      if (group.length && !group.some((one) => one.name === state.suite)) {
        state.suite = group[0].name
        state.artifact = null
        fillTestSelect()
        render()
      }
    })
  })
}

/**
 * The suite picker, shown only where a tab holds more than one suite — the
 * visual tests have one per font.
 */
function suitePicker() {
  const group = suiteNamed(state.suite).kind === 'visual' ? visual : audio
  if (group.length < 2) {
    return ''
  }
  return `
    <div is="e-row" data-gap="sm" data-margin-bottom="md" data-keep-flex-direction-row-in-mobile>
      ${group.map((suite) => `
        <button type="button" data-primary
          ${suite.name === state.suite ? '' : 'data-fill="outlined"'}
          data-pick-suite="${escaped(suite.name)}">${escaped(suite.label)}</button>
      `).join('')}
    </div>`
}

function render() {
  viewer.innerHTML = `
    ${suitePicker()}
    <div id="detail">
      ${state.test
        ? '<p is="e-p"><span is="e-muted">Loading…</span></p>'
        : '<p is="e-p"><span is="e-muted">Pick a test to compare it.</span></p>'}
    </div>`

  viewer.querySelectorAll('[data-pick-suite]').forEach((button) => {
    button.addEventListener('click', () => {
      state.suite = button.getAttribute('data-pick-suite')
      state.artifact = null
      fillTestSelect()
      render()
    })
  })

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
  return `<e-scrollable data-show-scrollbar data-scrolls>` +
    `<pre is="e-pre" data-load="${url}">loading…</pre></e-scrollable>`
}

async function fillTextSides(root) {
  for (const node of root.querySelectorAll('pre[data-load]')) {
    try {
      const response = await fetch(node.getAttribute('data-load'))
      const text = await response.text()
      node.textContent = node.getAttribute('data-load').endsWith('.json')
        ? JSON.stringify(JSON.parse(text), null, 2)
        : text
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
    await renderDetail()
  } catch (error) {
    window.showError(`Could not adopt: ${error.message}`)
  }
}

testSelect.addEventListener('change', () => {
  state.test = testSelect.value || null
  state.artifact = null
  render()
})

// The midi player is only needed once a midi artifact is looked at, and it pulls
// in a soundfont, so it is loaded lazily rather than on every page view.
let midiPlayerLoaded = false
const loadMidiPlayer = async () => {
  if (!midiPlayerLoaded) {
    midiPlayerLoaded = true
    await import('#msq/lib/html-midi-player/player.js')
  }
}
new MutationObserver(() => {
  if (viewer.querySelector('midi-player')) {
    loadMidiPlayer()
  }
}).observe(viewer, { childList: true, subtree: true })

watchTabs()
fillTestSelect()
render()
