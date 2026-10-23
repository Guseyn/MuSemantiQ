/*
"How it works" is a pipeline of blocks laid out as lanes: one lane per thing
the words turn into. The blocks and where they sit belong to the page; this
element measures them and draws the arrows between the particular blocks — the
parser reads the words once and returns all of it, a score is made from the
schema and the measurements of the page, a performance from the schema and the
MIDI settings, the editor's colours from the highlights buffer.

Each arrow is drawn the way the docs draw theirs (the diagrams of the API
pages): a line of dashes sliding towards the block it enters, closed by a solid
head, all in the accent. Mermaid draws those, but lays a fan of this size out
downwards, and this one is laid out sideways; the arrows are drawn here in the
same language instead.

<div is="landing-diagram" data-pipeline>
  <div data-block="words"> … </div>
  …
  <svg data-arrows aria-hidden="true"></svg>
</div>

The arrows are measured rather than written down, so they follow the blocks
wherever the page puts them, and are redrawn when it reflows or the fonts
arrive. A head points into its block along the horizontal, so a line stops
where its head begins and the two never overlap.
*/
const HEAD = 9

const CONNECTIONS = [
  // the parser reads the words once, and returns all of this
  ['words', 'custom-styles'],
  ['words', 'page-schema'],
  ['words', 'midi-settings'],
  ['words', 'highlights-buffer'],
  ['words', 'comments'],
  ['words', 'errors'],
  ['words', 'command-map'],
  // every measurement of the page, from the styles the text set
  ['custom-styles', 'page-styles'],
  // what we get
  ['page-styles', 'svg'],
  ['page-schema', 'svg'],
  ['page-schema', 'midi'],
  ['midi-settings', 'midi'],
  ['highlights-buffer', 'highlights'],
  // and the command map is read by the editor, which suggests what can come next
  ['command-map', 'editor-autocomplete']
]

class LandingDiagram extends HTMLDivElement {
  #observer = null

  connectedCallback() {
    this.#draw()
    this.#observer = new ResizeObserver(() => this.#draw())
    this.#observer.observe(this)
    // Measured blocks, and a glyph's box is only its own size once the font lands
    document.fonts?.ready.then(() => this.#draw())
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
  }

  #draw() {
    const svg = this.querySelector('[data-arrows]')
    if (!svg) {
      return
    }
    const canvas = svg.getBoundingClientRect()
    svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`)
    svg.replaceChildren()
    for (const [from, to] of CONNECTIONS) {
      const source = this.querySelector(`[data-block="${from}"]`)?.getBoundingClientRect()
      const target = this.querySelector(`[data-block="${to}"]`)?.getBoundingClientRect()
      if (!source || !target) {
        continue
      }
      svg.append(...arrow(from, to, source, target, canvas))
    }
  }
}

function arrow(from, to, source, target, canvas) {
  const x1 = source.right - canvas.left
  const y1 = source.top + source.height / 2 - canvas.top
  const x2 = target.left - canvas.left
  const y2 = target.top + target.height / 2 - canvas.top
  const bend = Math.max(24, Math.min(140, (x2 - x1) * 0.5))

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - HEAD} ${y2}`)
  path.setAttribute('data-from', from)
  path.setAttribute('data-to', to)

  // The head closes the line at the block's edge, pointing into it
  const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  head.setAttribute('points', `0,0 ${-HEAD},4 ${-HEAD},-4`)
  head.setAttribute('transform', `translate(${x2} ${y2})`)

  return [path, head]
}

customElements.define('landing-diagram', LandingDiagram, { extends: 'div' })
