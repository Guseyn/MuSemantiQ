/*
  The drawer's output, examined.

  Nothing here reads the drawer's internals: an msq-editor engraves the page and
  everything on this page is walked out of the SVG that comes back. `data-name`
  says what an element is, `ref-ids` which word asked for it, and
  `data-left/right/top/bottom` where it ended up. So the diagram cannot fall
  behind the drawer — it shows whatever the drawer actually made.

  It is not re-rendered by hand: an msq-editor cannot be. It renders once, and
  again when its own "Render the score" is pressed, and a MutationObserver on the
  score container is what says the tree should be read again.
*/

import '#msq/web-components/msq-font-loader-template.js'
import '#msq/web-components/msq-editor-template.js'

const FONT_SOURCES_REFERENCE = 'msqFontSources'
const DEFAULT_MSQ = `page number is "1/4"
page line width is 940
font size is 7.0
page bottom padding is 15
page number bottom offset is 3

stretch units by 1.12 times in line 1
stretch units by 1.32 times in line 2
stretch units by 1.65 times in line 3
stretch units by 1.4 times in line 4

title is "Allegro Burlesco" 
subtitle is "Sonatinaop.88, no.3, Mvmt.3"
right subtitle  is "Friedrich Kuhlau"

measure numbers for first measures

new line

measure
time signature is 2:4 for each line
key signature is c major for each line 
brace from stave 1 to stave 2 for each line
stave with treble clef
1/8 g5 is crushed grace, with sharp key, with dynamic "p" below stave
a5 with spiccato, beamed with next, with stem down
a with staccato
a with staccato
a with staccato, not beamed with next
stave with bass clef
voice
1/8 g4 is rest, with dynamic "pp"
chord beamed with next
c4 e4 
chord
c4 e4
chord not beamed with next
c4 e4
voice
1/2 a3

measure
stave
a dotted, with stem up, beamed with next 
1/32 c5 
b 
1/8 a
g with staccato below stave, not beamed with next
stave
voice
1/8 a3 beamed with next
chord
c4 e4
chord
c4 e4
chord not beamed with next
c4 e4
voice
1/4 a3

measure
stave
1/16 a beamed, with stem down
 b c5 b not beamed  
a beamed 
b c5 d5  
stave
voice
1/8 a3 beamed with next
chord
c4 e4

a3
chord not beamed
c4 e4
voice
1/4 a3
1/4 a3

measure
stave
1/2 e5
stave
voice
g4 is rest
chord beamed with next
b3 e4
chord
b3 e4
chord not beamed with next
b3 e4
voice
1/2 g3

new line
stave
1/8 d6 is crushed grace, with sharp key, with stem up, not beamed with next
e6 with spiccato; beamed with next; stem down
e5 with staccato
e5 with staccato
e5 with staccato;  not beamed with next
stave
voice
g4 is rest
chord beamed with next
b3 d4 e4
chord
b3 d4 e4
chord not beamed with next
b3 d4 e4
voice
1/2 g3, with # key

measure
stave
e5 beamed; dotted
1/32 g5 with natural key
f5 not beamed
1/8 e5 beamed
e5 with staccato; not beamed
stave
voice
g4 is rest
chord beamed with next
b3 d4 e4
chord
b3 d4 e4
chord not beamed with next
b3 d4 e4
voice
1/2 g3 with # key

measure
stave
1/16 e5 beamed
f5 g5 with natural key; f5 not beamed
e5 beamed; d5 c5 b4
stave
voice
1/8 g3 beamed with next
chord
b3 d4 e4

g3
chord not beamed
b3 d4 e4
voice
1/4 g3 with # key
1/4 g3 with # key

new line
measure
stave
1/4 a dotted; stem up
1/8 g5 is crushed grace; with sharp key; not beamed
a5 with stem down; with spiccato; with dynamic "f" below stave
stave
voice
1/8 g4 is rest
chord beamed
c4 e4 
chord not beamed
c4 e4 

g4 is rest
voice
1/4 a3 dotted

measure
stave
1/4 a dotted; stem up
1/8 g5 is crushed grace; with sharp key; not beamed
a5 with stem down; with spiccato; with dynamic "f" below stave
stave
voice
1/8 g4 is rest
chord is beamed with next
d4 f4 
chord not beamed
d4 f4 

g4 is rest
voice
1/4 a3 dotted

measure
stave
1/4 a dotted;
1/16 b beamed; stem up; with dynamic "p" below; 
a not beamed
stave
voice
1/8 g4 is rest
chord beamed
c4 e4 
chord not beamed
c4 e4 

g4 is rest
voice
1/4 a3 dotted

measure
stave
1/16 g beamed, with # key, with stem down;
a b c5 not beamed
d5 beamed; e5; f5 with # key; g5 with # key;
stave
voice
1/8 g4 is rest
chord beamed with next
b3 d4
chord 
b3 d4
chord not beamed with next
b3 d4
voice 
1/2 e3   
 
new line 
measure 
stave
1/16 a5 beamed; b5, c6, d6 not beamed
1/8 e6 beamed
d6 is crushed grace, with stem up, with # key
e6 with spiccato, with stem down, with dynamic "f" below
stave
1/4 a3
a3 is rest

measure
stave
1/4 e5 with dot
1/8 d6 is crushed grace, with stem up, with # key
e6 with spiccato, stem down
stave with treble clef
voice
1/8 b is rest
chord  beamed with next
e g with # key b
chord not beamed
e g b

b is rest
voice
1/4 d dotted

measure
stave
1/4 e5 with dot
1/8 d6 is crushed grace, with stem up, with # key 
e6 with spiccato, stem down
stave 
voice
1/8 b is rest
chord beamed with next
e g with # key b
chord not beamed
e g b

b is rest
voice
1/4 c dotted

measure
stave
1/8 e5 with spiccato beamed
1/8 d6 is crushed grace, with stem up, with # key
e6 with spiccato, stem down
1/8 e5 with spiccato
1/8 d6 is crushed grace, with stem up, with # key
e6 with spiccato, stem down
stave with bass clef
chord with stem down
g3 with # key b3 d4 e4

f3 is rest

chord
a3 c4 e4

f3 is rest

slur in first line, in first measure, in first stave
from unit 1 to unit 2
with right point attached to note head

slur in first line, in second measure, in first stave
starts below unit 1 to unit 4
with roundness 5

slur in second line, in first measure, in first stave
from unit 1 to unit 2
with right point attached to note head

slur in second line, in second measure, in first stave
from unit 1 to unit 4
with roundness 5

slur in line 4, in measure 1, in stave 1
from unit 6 to unit 7
with right point attached to note head

slur in line 4, in measure 2, in stave 1
from unit 2 to unit 3
with right point attached to note head

slur in line 4, in measure 3, in stave 1
from unit 2 to unit 3
with right point attached to note head

slur in line 4, in measure 4, in stave 1
from unit 2 to unit 3
with right point attached to note head

slur in line 4, in measure 4, in stave 1
from unit 5 to unit 6
with right point attached to note head`
const LEAVES = 'path,line,rect,text,polyline,circle,ellipse'

await window.whenPresent('#editor')
const structure = document.getElementById('structure')
const says = document.getElementById('says')
const SVGNS = 'http://www.w3.org/2000/svg'
let score = null
let tree = []
let pinned = null

// --- moving the structure ---------------------------------------------------

/*
  The head drags the panel, and the corner is the browser's own grip
  (`resize: both`). There is no event of its own for that one, so the size is
  read whenever the panel changes. Where it was and how big it was are kept
  between visits: a tool should open where it was left.
*/
const PANEL_KEY = 'drawer-inspector-structure'

function heldFor(panel) {
  const rect = panel.getBoundingClientRect()
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

function remember(panel) {
  localStorage.setItem(PANEL_KEY, JSON.stringify(heldFor(panel)))
}

function restore(panel) {
  let held = null
  try {
    held = JSON.parse(localStorage.getItem(PANEL_KEY))
  } catch {
    // A value from some other page: the default position will do.
  }
  if (!held || !Number.isFinite(held.left) || !Number.isFinite(held.top)) {
    return
  }
  panel.style.left = `${held.left}px`
  panel.style.top = `${held.top}px`
  panel.style.right = 'auto'
  panel.style.width = `${held.width}px`
  panel.style.height = `${held.height}px`
}

function makeMovable(panel) {
  const head = panel.querySelector('[data-inspector-head]')
  head.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button, input, select, a')) {
      return
    }
    event.preventDefault()
    const rect = panel.getBoundingClientRect()
    const byX = event.clientX - rect.left
    const byY = event.clientY - rect.top
    panel.style.left = `${rect.left}px`
    panel.style.top = `${rect.top}px`
    panel.style.right = 'auto'
    const move = (moving) => {
      panel.style.left = `${Math.max(0, Math.min(window.innerWidth - 96, moving.clientX - byX))}px`
      panel.style.top = `${Math.max(0, Math.min(window.innerHeight - 48, moving.clientY - byY))}px`
    }
    const letGo = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', letGo)
      remember(panel)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', letGo)
  })

  let writing = null
  new ResizeObserver(() => {
    clearTimeout(writing)
    writing = setTimeout(() => remember(panel), 200)
  }).observe(panel)
}

// --- the fonts, once --------------------------------------------------------

/*
  The fonts are registered by letting a loader unwrap itself where the editor
  will go: the components only ask for an engraving once the worker has them,
  and the loader's unwrapping is what says so.
*/
async function setUpFonts() {
  const config = (await (await fetch('/dev/fonts')).json()).config
  const loader = document.createElement('template', { is: 'msq-font-loader' })
  loader.setAttribute('data-font-sources-reference', FONT_SOURCES_REFERENCE)
  loader.setAttribute('data-font-config', JSON.stringify(config))
  /*
    The loader inserts a *copy* of its content, so the marker is recognised by
    attribute: a reference to the node put in would point at the original, which
    never reaches the document.
  */
  const ready = document.createElement('div')
  ready.setAttribute('data-inspector-fonts-ready', '')
  loader.content.appendChild(ready)
  document.getElementById('editor').replaceChildren(loader)
  await window.whenPresent('#editor div[data-inspector-fonts-ready]')
}

/*
  An msq-editor cannot be re-rendered: it replaces itself with the engraved
  view and guards on having rendered once. A new source means a new element,
  which is the element's own lifecycle.
*/
function engrave(msq) {
  const template = document.createElement('template', { is: 'msq-editor' })
  template.setAttribute('data-font-sources', FONT_SOURCES_REFERENCE)
  template.setAttribute('data-editor-height', '420px')
  // Through innerState rather than as content: the hook MSQTemplateElement
  // reads before falling back to its template content.
  template.innerState = msq
  document.getElementById('editor').replaceChildren(template)
}

// --- the structure of what was engraved -------------------------------------

function namedOf(el) {
  let node = el
  while (node && node !== score) {
    if (node.getAttribute && node.getAttribute('data-name')) {
      return node
    }
    node = node.parentNode
  }
  return null
}

function kindsOf(svg) {
  const rows = []
  const seen = new Map()
  for (const el of svg.querySelectorAll('[data-name]')) {
    const kind = el.getAttribute('data-name')
    const above = []
    let node = el.parentNode
    while (node && node !== svg) {
      if (node.getAttribute && node.getAttribute('data-name')) {
        above.push(node.getAttribute('data-name'))
      }
      node = node.parentNode
    }
    const parent = above[0] || null
    if (seen.has(kind)) {
      const row = seen.get(kind)
      row.count += 1
      // The same kind is drawn in more than one place: `stavesPiece` comes with
      // the opening bar line and again behind the voices of its measure.
      if (parent !== null && !row.parents.includes(parent)) {
        row.parents.push(parent)
      }
      continue
    }
    const row = {
      kind,
      parent,
      parents: parent === null ? [] : [parent],
      depth: above.length,
      count: 1,
      refs: (el.getAttribute('ref-ids') || '').split(',').slice(0, 2).join(' ')
    }
    seen.set(kind, row)
    rows.push(row)
  }
  return rows
}

function renderStructure() {
  structure.replaceChildren()
  for (const row of tree) {
    const button = document.createElement('button')
    button.type = 'button'
    button.style.paddingLeft = `${row.depth * 14}px`
    button.innerHTML = `<span>${row.kind}</span>` +
      `<span data-count>×${row.count}</span>` +
      (row.parents.length > 1 ? `<span data-refs>in ${row.parents.join(' · ')}</span>` : '') +
      (row.refs ? `<span data-refs>${row.refs}</span>` : '')
    button.addEventListener('mouseenter', () => {
      if (!pinned) {
        apply(row.kind)
      }
    })
    button.addEventListener('mouseleave', () => {
      if (!pinned) {
        apply(null)
      }
    })
    button.addEventListener('click', () => {
      pinned = pinned === row.kind ? null : row.kind
      apply(pinned || row.kind)
    })
    structure.appendChild(button)
  }
}

// --- lighting one kind up ---------------------------------------------------

/*
  What lights up is decided by containment, not by kind alone.

  A kind can sit under more than one parent — `stavesPiece` is drawn with the
  opening bar line and again behind the voices of its measure — so a tree that
  remembers one parent per kind cannot say what belongs to a row. A row instead
  lights up its own elements and everything inside them, which is what
  `voicesWithStaveLines` means: the voices and the stave strip behind them.
*/
function apply(kind) {
  if (!score) {
    return
  }
  const matched = new Set(kind ? [...score.querySelectorAll(`[data-name="${kind}"]`)] : [])
  drawBoxes([...matched])
  const insideAMatch = (leaf) => {
    let node = leaf
    while (node && node !== score) {
      if (matched.has(node)) {
        return true
      }
      node = node.parentNode
    }
    return false
  }
  for (const leaf of score.querySelectorAll(LEAVES)) {
    if (leaf.closest('g[data-inspector-boxes]')) {
      continue
    }
    const on = !kind || insideAMatch(leaf)
    leaf.classList.toggle('di-lo', !!kind && !on)
    leaf.classList.toggle('di-hi', !!kind && on)
  }
  structure.querySelectorAll('button').forEach((button, index) => {
    button.toggleAttribute('data-selected', !!kind && tree[index].kind === kind)
  })
  if (!kind) {
    says.textContent = ''
    return
  }
  const row = tree.find((one) => one.kind === kind)
  const example = score.querySelector(`[data-name="${kind}"]`)
  const box = example && ['left', 'right', 'top', 'bottom']
    .map((side) => `${side} ${Number(example.getAttribute('data-' + side) ?? NaN).toFixed(2)}`)
    .join(' · ')
  says.innerHTML = `<b>${kind}</b> — ${row.count} on this page` +
    (row.refs ? ` · ref-ids <b>${row.refs}</b>` : '') +
    (box ? ` · ${box}` : '')
}

// --- the box of what is highlighted -----------------------------------------

/*
  A dashed box around the highlighted element itself — the parent group whose
  contents light up — and only while something is highlighted. Its box is the
  element's own `data-left/right/top/bottom`, written by the drawer in the
  coordinates of the page, so no measuring is needed. The layer takes no part
  in picking: `pointer-events: none`.
*/
function drawBoxes(matched) {
  const was = score.querySelector('g[data-inspector-boxes]')
  if (was) {
    was.remove()
  }
  if (!matched.length) {
    return
  }
  const layer = document.createElementNS(SVGNS, 'g')
  layer.setAttribute('data-inspector-boxes', '')
  for (const el of matched) {
    const left = Number(el.getAttribute('data-left'))
    const top = Number(el.getAttribute('data-top'))
    const right = Number(el.getAttribute('data-right'))
    const bottom = Number(el.getAttribute('data-bottom'))
    if (![ left, top, right, bottom ].every(Number.isFinite)) {
      continue
    }
    if (right - left < 0.5 || bottom - top < 0.5) {
      continue
    }
    const rect = document.createElementNS(SVGNS, 'rect')
    rect.setAttribute('x', left)
    rect.setAttribute('y', top)
    rect.setAttribute('width', right - left)
    rect.setAttribute('height', bottom - top)
    layer.appendChild(rect)
  }
  score.appendChild(layer)
}

function paintStyle(host) {
  if (host.shadowRoot.querySelector('style[data-inspector]')) {
    return
  }
  const style = document.createElement('style')
  style.setAttribute('data-inspector', '')
  style.textContent = /*css*/`
    svg .di-lo { opacity: .14; transition: opacity .2s; }
    svg .di-hi { filter: drop-shadow(0 0 1px var(--e-primary)); transition: opacity .2s; }
    svg g[data-inspector-boxes] { pointer-events: none; }
    svg g[data-inspector-boxes] rect {
      fill: none;
      /* The same colour as the box that links a word to its glyph, which the
         settings call "Colour of the box that links a word to its glyph". */
      stroke: #c40233;
      stroke-width: 1;
      stroke-dasharray: 4 3;
      opacity: 0.9;
    }
  `
  host.shadowRoot.appendChild(style)
}

// --- watching the score -----------------------------------------------------

async function watch() {
  const host = await window.whenPresent('#editor div[data-rendered-by]')
  paintStyle(host)
  const svgContainer = host.shadowRoot.querySelector('div[data-svg-container]')
  svgContainer.addEventListener('click', (event) => {
    const owner = namedOf(event.target)
    if (!owner) {
      return
    }
    pinned = owner.getAttribute('data-name')
    apply(pinned)
  })
  new MutationObserver(() => read()).observe(svgContainer, { childList: true })
  read()
}

function read() {
  const host = document.querySelector('#editor div[data-rendered-by]')
  const svg = host && host.shadowRoot.querySelector('div[data-svg-container] svg')
  if (!svg) {
    return
  }
  score = svg
  const keep = pinned && kindsOf(svg).some((row) => row.kind === pinned) ? pinned : null
  pinned = keep
  tree = kindsOf(svg)
  renderStructure()
  apply(keep)
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    pinned = null
    apply(null)
  }
})

const panel = await window.whenPresent('[data-floating]')
restore(panel)
makeMovable(panel)

await setUpFonts()
engrave(DEFAULT_MSQ)
watch()
