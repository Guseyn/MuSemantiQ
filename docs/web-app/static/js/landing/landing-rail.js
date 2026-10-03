import scrollToScreen from '/js/landing/scrollToScreen.js'

/*
<nav is="landing-rail" data-rail aria-label="Sections"></nav>

One notehead per screen, built from the screens themselves, so there is one
list to change. The screens do not all exist at load: everything that engraves
is inside the font loader, which is a <template> until the fonts are registered.
So the rail is rebuilt, in document order, whenever a screen says it has
arrived in the document, and a screen that turns up late still lands in the
right place rather than on the end.
*/
class LandingRail extends HTMLElement {
  /*
  Kept rather than read back off the dots, because the dots do not last: the
  rail is rebuilt when the rest of the screens come in, and the first screen
  has usually been marked current by then. It does not become current again
  until the reader scrolls, so without this the rebuilt rail would show none.
  */
  #currentId = null
  #rebuildIsQueued = false

  connectedCallback() {
    this.#rebuild()
    document.addEventListener('landing:screen-connected', this.#queueRebuild)
    document.addEventListener('landing:screen-current', this.#onCurrent)
    this.addEventListener('click', this.#onClick)
  }

  disconnectedCallback() {
    document.removeEventListener('landing:screen-connected', this.#queueRebuild)
    document.removeEventListener('landing:screen-current', this.#onCurrent)
    this.removeEventListener('click', this.#onClick)
  }

  // The screens inside the font loader all arrive in one insertion: one rebuild.
  #queueRebuild = () => {
    if (this.#rebuildIsQueued) {
      return
    }
    this.#rebuildIsQueued = true
    queueMicrotask(() => {
      this.#rebuildIsQueued = false
      this.#rebuild()
    })
  }

  #rebuild() {
    const dots = document.createDocumentFragment()
    for (const screen of document.querySelectorAll('[data-screen]')) {
      const label = screen.getAttribute('data-label') || screen.id
      const dot = document.createElement('a')
      dot.href = `#${screen.id}`
      dot.setAttribute('data-label', label)
      dot.setAttribute('aria-label', label)
      dots.appendChild(dot)
    }
    this.replaceChildren(dots)
    this.#mark()
  }

  #onCurrent = (event) => {
    this.#currentId = event.detail.id
    this.#mark()
  }

  #mark() {
    for (const dot of this.children) {
      if (this.#currentId && dot.getAttribute('href') === `#${this.#currentId}`) {
        dot.setAttribute('aria-current', 'true')
      } else {
        dot.removeAttribute('aria-current')
      }
    }
  }

  #onClick = (event) => {
    const dot = event.target.closest('a[href^="#"]')
    if (dot && scrollToScreen(dot.getAttribute('href').slice(1))) {
      event.preventDefault()
    }
  }
}

customElements.define('landing-rail', LandingRail, { extends: 'nav' })
