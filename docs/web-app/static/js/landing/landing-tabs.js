/*
<div is="landing-tabs" data-tabs>
  <div data-tab-list> <button data-tab="api">Low-level API</button> … </div>
  <div data-tab-panel="api"> … </div> …
</div>

One panel at a time, chosen by the buttons above. The buttons and panels are
paired by name (data-tab and data-tab-panel), and the roles, ids and keyboard
are wired here, so the markup stays a plain list of buttons and a plain list of
panels: ← and → move along the tabs, Home and End go to the first and last.

Without JavaScript every panel is shown, one after another, which is still the
whole of the content.
*/
let tabsOnPage = 0

class LandingTabs extends HTMLDivElement {
  #buttons = []
  #panels = []

  connectedCallback() {
    // Its own tabs only: a panel can hold tabs of its own (the web components do)
    const list = this.querySelector(':scope > [data-tab-list]')
    this.#buttons = list ? [ ...list.querySelectorAll(':scope > [data-tab]') ] : []
    this.#panels = [ ...this.querySelectorAll(':scope > [data-tab-panel]') ]
    if (!list || !this.#buttons.length) {
      return
    }

    const prefix = `landing-tabs-${++tabsOnPage}`
    list.setAttribute('role', 'tablist')
    for (const button of this.#buttons) {
      const panel = this.#panelOf(button)
      button.setAttribute('role', 'tab')
      button.id = `${prefix}-tab-${button.dataset.tab}`
      if (panel) {
        panel.setAttribute('role', 'tabpanel')
        panel.id = `${prefix}-panel-${button.dataset.tab}`
        panel.setAttribute('aria-labelledby', button.id)
        button.setAttribute('aria-controls', panel.id)
      }
      button.addEventListener('click', this.#onClick)
    }
    list.addEventListener('keydown', this.#onKeydown)
    this.setAttribute('data-enhanced', 'true')
    this.#select(this.#buttons[0], { focus: false })
  }

  #panelOf(button) {
    return this.#panels.find((panel) => panel.dataset.tabPanel === button.dataset.tab)
  }

  #onClick = (event) => {
    this.#select(event.currentTarget, { focus: false })
  }

  #onKeydown = (event) => {
    const index = this.#buttons.indexOf(document.activeElement)
    if (index === -1) {
      return
    }
    const last = this.#buttons.length - 1
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last
    }[event.key]
    if (next === undefined) {
      return
    }
    event.preventDefault()
    this.#select(this.#buttons[next], { focus: true })
  }

  #select(chosen, { focus }) {
    for (const button of this.#buttons) {
      const isChosen = button === chosen
      button.setAttribute('aria-selected', String(isChosen))
      // Only the chosen tab is in the Tab order; the arrows move between them
      button.tabIndex = isChosen ? 0 : -1
      const panel = this.#panelOf(button)
      if (panel) {
        panel.hidden = !isChosen
      }
    }
    if (focus) {
      chosen.focus()
    }
  }
}

customElements.define('landing-tabs', LandingTabs, { extends: 'div' })
