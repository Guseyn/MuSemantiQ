import './searchable-select.js'

await window.whenPresent('#xml-in')

const at = (id) => document.getElementById(id)

const escaped = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]))

/**
 * A rendered page, as an image the browser can scroll rather than a document it
 * has to lay out — the score is the whole point of the tool, so it gets room.
 */
const scoreMarkup = (svg, label) => svg
  ? `<e-scrollable data-show-scrollbar data-score>
       <img src="data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}" alt="${escaped(label)}">
     </e-scrollable>`
  : `<p is="e-p"><span is="e-muted">nothing was engraved</span></p>`

/**
 * What a conversion could not carry over, which is the part worth reading.
 */
function reportMarkup(report) {
  if (!report) {
    return ''
  }
  const lines = []
  for (const one of report.unsupported || []) {
    lines.push(`${escaped(one.what)} — ${one.count} time${one.count === 1 ? '' : 's'}`)
  }
  for (const note of report.notes || []) {
    lines.push(escaped(note))
  }
  if (!lines.length) {
    return `<p is="e-p"><span is="e-muted" data-font-size="sm">Everything in the file has a place on the page.</span></p>`
  }
  return `<div is="e-info" data-padding="md" data-margin-top="md">
      <b is="e-b">Not carried over</b>
      <ul is="e-list" data-type="bullet">
        ${lines.map((line) => `<li is="e-list-item">${line}</li>`).join('')}
      </ul>
    </div>`
}

const detailsMarkup = (summary, body, { open = false, wraps = false } = {}) => `
  <details is="e-details" data-margin-top="md"${open ? ' open' : ''}>
    <summary>${escaped(summary)}</summary>
    <pre is="e-pre" data-out${wraps ? ' data-wraps' : ''}>${escaped(body)}</pre>
  </details>`

// --- MusicXML in ------------------------------------------------------------

async function convertIn() {
  const xml = at('xml-in').value
  if (!xml.trim()) {
    window.showError('Paste a MusicXML document first.')
    return
  }
  at('in-status').textContent = 'converting…'
  at('in-result').innerHTML = ''

  try {
    const response = await fetch('/dev/musicxml/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ xml })
    })
    const result = await response.json()
    at('in-status').textContent = ''

    if (result.error) {
      window.showError(result.error)
      at('in-result').innerHTML =
        `<div is="e-info" data-padding="md">${escaped(result.error)}</div>`
      return
    }

    const measures = (result.pageSchema.measuresParams || []).length
    const staves = ((result.pageSchema.measuresParams || [])[0] || {}).stavesParams || []

    at('in-result').innerHTML = `
      <div is="e-row" data-justify-content="space-between" data-keep-flex-direction-row-in-mobile>
        <h2 is="e-h">${escaped(result.pageSchema.title || 'Untitled')}</h2>
        <span is="${result.valid ? 'e-muted' : 'e-tag'}" data-font-size="sm">
          ${measures} measure${measures === 1 ? '' : 's'}, ${staves.length} stave${staves.length === 1 ? '' : 's'}
          ${result.valid ? '' : ' · the page schema is not valid'}
        </span>
      </div>
      ${result.drawingError
        ? `<div is="e-info" data-padding="md">could not engrave it: ${escaped(result.drawingError)}</div>`
        : scoreMarkup(result.svg, 'the imported score')}
      ${reportMarkup(result.report)}

      <div is="e-row" data-gap="sm" data-margin-top="md" data-keep-flex-direction-row-in-mobile>
        <button type="button" data-primary id="copy-msq"
          ${result.msq ? '' : 'disabled'}>Copy the MSQ</button>
        <span is="e-muted" data-font-size="sm">
          ${result.msqError
            ? `it could not be written as MSQ: ${escaped(result.msqError)}`
            : 'the same page, written back as the language'}
        </span>
      </div>

      ${detailsMarkup('msq', result.msq || result.msqError || '', { open: true, wraps: true })}
      ${detailsMarkup('page schema', JSON.stringify(result.pageSchema, null, 2))}
      ${detailsMarkup('custom styles', JSON.stringify(result.customStyles, null, 2))}
      ${detailsMarkup('midi settings', JSON.stringify(result.midiSettings, null, 2))}`

    const copyMsq = at('copy-msq')
    if (copyMsq && result.msq) {
      copyMsq.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(result.msq)
          window.showToast('MSQ copied.')
        } catch {
          window.showError('The clipboard refused; copy it from the panel below.')
        }
      })
    }
  } catch (error) {
    at('in-status').textContent = ''
    window.showError(`Could not convert: ${error.message}`)
  }
}

// --- MusicXML out -----------------------------------------------------------

async function convertOut() {
  const msq = at('msq-in').value
  if (!msq.trim()) {
    window.showError('Write some MSQ first, or pick a test.')
    return
  }
  at('out-status').textContent = 'converting…'
  at('out-result').innerHTML = ''

  try {
    const response = await fetch('/dev/musicxml/export', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ msq })
    })
    const result = await response.json()
    at('out-status').textContent = ''

    if (result.error) {
      window.showError(result.error)
      return
    }

    const errors = (result.errors || []).length

    at('out-result').innerHTML = `
      <div is="e-row" data-justify-content="space-between" data-keep-flex-direction-row-in-mobile>
        <h2 is="e-h">Converted</h2>
        <span is="${errors ? 'e-tag' : 'e-muted'}" data-font-size="sm">
          ${errors ? `${errors} parse error${errors === 1 ? '' : 's'} in the source` : 'the source parsed cleanly'}
        </span>
      </div>

      <p is="e-p" data-margin-top="sm">
        <span is="e-muted" data-font-size="sm">
          On the left, the page as MuSemantiQ engraves it. On the right, the same
          page written out as MusicXML and read straight back in. They should be
          the same music.
        </span>
      </p>

      <div data-sides data-margin-top="sm">
        <div>
          <b is="e-b">from the source</b>
          ${scoreMarkup(result.svg, 'the source page')}
        </div>
        <div>
          <b is="e-b">after the round trip</b>
          ${scoreMarkup(result.backSvg, 'the page read back from MusicXML')}
        </div>
      </div>

      <div is="e-row" data-gap="sm" data-margin-top="md" data-keep-flex-direction-row-in-mobile>
        <button type="button" data-primary id="copy-xml">Copy the MusicXML</button>
        <button type="button" data-primary data-fill="outlined" id="reimport-xml">Send it to the other tab</button>
      </div>

      ${detailsMarkup('musicxml', result.xml)}`

    at('copy-xml').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(result.xml)
        window.showToast('MusicXML copied.')
      } catch {
        window.showError('The clipboard refused; open the details below and copy from there.')
      }
    })
    at('reimport-xml').addEventListener('click', () => {
      at('xml-in').value = result.xml
      document.getElementById('directions').selectTab(0)
      convertIn()
    })
  } catch (error) {
    at('out-status').textContent = ''
    window.showError(`Could not convert: ${error.message}`)
  }
}

// --- the corpus, so there is always something to try ------------------------

async function fillTests() {
  try {
    const index = await (await fetch('/dev/tests')).json()
    const suite = index.suites.find((one) => one.kind === 'visual')
    if (!suite) {
      return
    }
    const select = at('pick-test')
    const blank = document.createElement('option')
    blank.value = ''
    blank.textContent = 'pick a corpus test…'
    select.appendChild(blank)
    for (const name of suite.tests) {
      const option = document.createElement('option')
      option.value = `/tests/${suite.name}/msq/${name}.txt`
      option.textContent = name
      select.appendChild(option)
    }
    select.value = ''
    select.refresh()
    select.addEventListener('change', async () => {
      if (!select.value) {
        return
      }
      at('msq-in').value = await (await fetch(select.value)).text()
      convertOut()
    })
  } catch {
    // The corpus is a convenience; the tool works without it.
  }
}

// --- dropping a file anywhere -----------------------------------------------

for (const event of [ 'dragenter', 'dragover' ]) {
  document.body.addEventListener(event, (dropped) => {
    dropped.preventDefault()
    document.body.setAttribute('data-dropping', '')
  })
}
for (const event of [ 'dragleave', 'drop' ]) {
  document.body.addEventListener(event, () => document.body.removeAttribute('data-dropping'))
}
document.body.addEventListener('drop', async (dropped) => {
  dropped.preventDefault()
  const file = dropped.dataTransfer && dropped.dataTransfer.files[0]
  if (!file) {
    return
  }
  at('xml-in').value = await file.text()
  document.getElementById('directions').selectTab(0)
  convertIn()
})

at('convert-in').addEventListener('click', convertIn)
at('convert-out').addEventListener('click', convertOut)
at('sample-in').addEventListener('click', async () => {
  // The sample is made by converting a corpus test, so it is always a score
  // this build can actually produce.
  at('out-status').textContent = 'building a sample…'
  const msq = await (await fetch('/tests/visual-tests/bravura/msq/score-two-part-invention.txt')).text()
  const response = await fetch('/dev/musicxml/export', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ msq })
  })
  const result = await response.json()
  at('out-status').textContent = ''
  if (result.xml) {
    at('xml-in').value = result.xml
    convertIn()
  }
})

fillTests()
