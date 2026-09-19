/**
 * Hearing a rendered set.
 *
 * A sample set is judged by ear, not by its file count: whether the samples are
 * in tune, whether the instrument is the one asked for, whether a note sounds at
 * all. So this tab engraves a short passage and plays it through whichever set
 * you pick — the same folder, at the same URL, that either app would load.
 */

import '#msq/web-components/msq-font-loader-template.js'
import '#msq/web-components/msq-editor-template.js'

await window.whenPresent('#sound-font-editor')

const at = (id) => document.getElementById(id)
const FONT_SOURCES_REFERENCE = 'magentaTestFonts'

/*
The passage, built around whatever the chosen set actually holds.

A stave sounds as the instrument its title names, and Magenta's player simply
skips a note whose program is not in the set — logging it and falling silent,
with no error. So naming an instrument the set does not have is the surest way
to hear nothing at all, and the passage asks for what is there instead.

The instrument folders are named after their General MIDI patch, lower-cased
with underscores, which is the same name the language takes once the
underscores are spaces.
*/
const instrumentTitle = (folder) =>
  folder.replace(/_/g, ' ').replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

const passageFor = (instruments) => {
  const [ first, second ] = instruments
  const upper = first ? instrumentTitle(first.name) : 'Piano'
  const lower = second ? instrumentTitle(second.name) : upper

  return `title is "Hearing a set"

measure
instrument title is "Piano" for stave 1
instrument title is "Piano" for stave 2
stave with treble clef
1/4 c5, d5, e5, f5
stave with bass clef
1/2 chord
c e g
1/2 chord
d f a

measure
stave
1/2 g5, 1/4 e5, 1/4 c5
stave
1 chord
c e g c5`
}

/**
 * The sets that have been rendered, as the player takes them: a folder under
 * /magenta-sound-font, which is the symlink into src/midi.
 */
let sets = []

async function fillSets() {
  const picker = at('test-sound-font')
  const says = at('test-sound-font-says')

  try {
    sets = (await (await fetch('/dev/magenta/sets')).json()).sets || []
  } catch (error) {
    says.textContent = `Could not read the sets: ${error.message}`
    return []
  }

  picker.replaceChildren()

  /*
  The default is Magenta's own soundfont, served from their storage. It is what
  the player falls back to, and having it in the list is what makes a rendered
  set comparable with something.
  */
  const theirs = document.createElement('option')
  theirs.value = ''
  theirs.textContent = "Magenta's own (over the network)"
  picker.appendChild(theirs)

  for (const set of sets) {
    const option = document.createElement('option')
    option.value = `/magenta-sound-font/${set.name}`
    option.textContent = `${set.name} — ${set.count} instrument${set.count === 1 ? '' : 's'}`
    picker.appendChild(option)
  }

  if (sets.length) {
    picker.value = `/magenta-sound-font/${sets[0].name}`
  }
  says.textContent = sets.length
    ? 'A note only sounds if the set holds the instrument it asks for.'
    : 'Nothing has been rendered yet — only Magenta’s own soundfont is available.'
  return sets
}

/*
An msq-editor cannot be re-rendered: it replaces itself with the engraved view
and guards on having rendered once. So changing the set builds a fresh one,
which is the element's own lifecycle.
*/
function engrave(soundFont) {
  const chosen = sets.find((set) => `/magenta-sound-font/${set.name}` === soundFont)
  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', FONT_SOURCES_REFERENCE)
  template.setAttribute('data-editor-height', '300px')
  template.setAttribute('data-sound-font', soundFont)
  template.innerState = passageFor(chosen ? chosen.instruments : [])
  at('sound-font-editor').replaceChildren(template)

  const says = at('test-sound-font-says')
  if (!chosen) {
    says.textContent = "Magenta's own soundfont, which holds every instrument."
  } else {
    says.textContent = chosen.instruments.length
      ? `Written for ${chosen.instruments.map((one) => instrumentTitle(one.name)).slice(0, 2).join(' and ')},` +
        ` which is what ${chosen.name} holds.`
      : `${chosen.name} holds no instruments yet, so nothing will sound.`
  }
}

/*
The fonts are registered once, by letting a loader unwrap itself where the
editor will go — the components only start asking for an engraving once the
worker has the fonts, and the loader's unwrapping is what says so.
*/
async function setUpFonts() {
  const config = (await (await fetch('/dev/fonts')).json()).config

  const loader = document.createElement('template', { is: 'msq-font-loader' })
  loader.setAttribute('data-font-sources-reference', FONT_SOURCES_REFERENCE)
  loader.setAttribute('data-font-config', JSON.stringify(config))

  /*
  The loader inserts a *copy* of its content, so the marker has to be
  recognisable by attribute — a reference to the node put in would point at the
  original, which never reaches the document.
  */
  const ready = document.createElement('div')
  ready.setAttribute('data-fonts-ready', '')
  loader.content.appendChild(ready)
  at('sound-font-editor').replaceChildren(loader)

  await new Promise((resolve) => {
    new MutationObserver((records, observer) => {
      if (at('sound-font-editor').querySelector('[data-fonts-ready]')) {
        observer.disconnect()
        resolve()
      }
    }).observe(at('sound-font-editor'), { childList: true, subtree: true })
  })
}

at('test-sound-font').addEventListener('change', () => {
  engrave(at('test-sound-font').value)
})

/*
Nothing is engraved until the tab is opened: an editor measures itself as it
renders, and a tab that is not showing has no size to measure. It also means
opening the page does not pull a soundfont over the network.
*/
let started = false
async function startTheBench() {
  if (started) {
    return
  }
  started = true
  try {
    await fillSets()
    await setUpFonts()
    engrave(at('test-sound-font').value)
  } catch (error) {
    started = false
    window.showError(`Could not set the test bench up: ${error.message}`)
  }
}

/*
`e-tabs` builds its nav one microtask after EHTML activates it and offers no
event when a tab is chosen, so the buttons it generates are what we listen on.
*/
async function watchTabs() {
  while (!(at('steps') && at('steps').querySelector('nav'))) {
    await new Promise((resolve) => setTimeout(resolve))
  }
  const steps = at('steps')
  const buttons = [ ...steps.querySelector('nav').querySelectorAll('button') ]
  const bench = buttons.length - 1
  buttons.forEach((button, position) => {
    button.addEventListener('click', () => {
      if (position === bench) {
        startTheBench()
      }
    })
  })
  /*
  Opened straight onto the bench. Which tab that is comes from e-tabs, which
  reads the hash and records the answer — naming the hash here would be a copy
  of the tab's title, spelled its way, to keep in step by hand.
  */
  if (Number(steps.getAttribute('data-current-tab')) === bench) {
    startTheBench()
  }
}

watchTabs()
