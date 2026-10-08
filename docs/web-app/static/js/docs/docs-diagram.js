/*
<docs-diagram>, a diagram written as Mermaid inside it, drawn as SVG in its
place. diagram-extension.js turns a ```mermaid fence into one.

Mermaid is vendored in lib/mermaid (MIT, see its LICENSE): its ES module
build, as it is published, readable and unbundled, found through the import
map as #mermaid. It is several megabytes, so it is imported only when the first
diagram on a page connects, and only once: most pages have none.

The theme is set here rather than in each diagram, so every diagram looks like
the rest of the docs: white boxes with e-ui's border, and the interface font.
A node can also be an icon, from the Material Symbols in diagram-icons.js,
with arrows that meet the icon rather than its label (arrows-to-icons.js).

e-markdown moves its children out of itself once it has rendered them, which
disconnects the element and connects it again, so it draws on the first
connect only.
*/
import materialIcons from '#docs/diagram-icons.js'
import arrowsToIcons from '#docs/arrows-to-icons.js'

let mermaidLoaded = null
let numberOfDiagrams = 0

function loadedMermaid() {
  mermaidLoaded ??= import('#mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      themeVariables: {
        fontSize: '16px',
        primaryColor: '#ffffff',
        primaryBorderColor: '#c0c0c0',
        primaryTextColor: '#0f172a',
        lineColor: '#36454f',
        edgeLabelBackground: '#ffffff'
      },
      // At its own size rather than stretched to the card, so docs.css can centre it
      flowchart: { curve: 'basis', padding: 12, useMaxWidth: false }
    })
    // node@{ icon: "material:…" } draws a node as one of these, see diagram-icons.js
    mermaid.registerIconPacks([ { name: 'material', icons: materialIcons } ])
    return mermaid
  })
  return mermaidLoaded
}

/*
Mermaid measures every label as it draws. In a tab that is not open, or anything
else with display: none, everything measures as zero and the drawing comes out
collapsed, so a hidden diagram waits until it first has a size of its own.
*/
function shown(element) {
  if (element.getClientRects().length > 0) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (element.getClientRects().length > 0) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(element)
  })
}

class DocsDiagram extends HTMLElement {
  #drawn = false

  async connectedCallback() {
    if (this.#drawn) {
      return
    }
    this.#drawn = true
    const source = this.textContent
    await shown(this)
    const mermaid = await loadedMermaid()
    numberOfDiagrams += 1
    try {
      const { svg } = await mermaid.render(`docs-diagram-${numberOfDiagrams}`, source)
      this.innerHTML = svg
      // Measured, so only once it is in the page
      const drawing = this.querySelector('svg')
      arrowsToIcons(drawing)
      /*
      A diagram shrinks to fit the card, but past three quarters of its size its
      words get too small to read, on a phone most of all: from there the card
      scrolls sideways instead, as a code block does.
      */
      const naturalWidth = drawing.viewBox.baseVal && drawing.viewBox.baseVal.width
      if (naturalWidth) {
        drawing.style.minWidth = `${Math.round(naturalWidth * 0.75)}px`
      }
      this.setAttribute('data-drawn', '')
      /*
      Drawn, the diagram is taller than its placeholder, which moves everything
      below it. A page opened at a heading further down is on its way there,
      often in a smooth scroll that has already chosen where to stop, so the
      heading is gone to again, at once.
      */
      const target = window.location.hash && document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      if (target && (this.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        target.scrollIntoView({ behavior: 'instant' })
      }
    } catch (error) {
      // The source stays on the page, as text, so a broken diagram is still read
      this.setAttribute('data-broken', '')
      console.error(error)
    }
  }
}

customElements.define('docs-diagram', DocsDiagram)
