'use strict'

/**
 * A <select> you can type into.
 *
 *   <select is="searchable-select" data-placeholder="Search fonts…">
 *
 * A native select is fine for four fonts and useless for two hundred glyph
 * names, so on connect the element hides itself behind a text input and a
 * filtered listbox. It stays the value holder — `select.value`, `selectedIndex`
 * and `change` all behave as they did — which is why this extends the built-in
 * rather than replacing it.
 *
 * It belongs to the dev tools rather than to web-components/: e-ui has no
 * single-select-with-search, and nothing that renders a score needs one.
 *
 * Options may be added after connect; the list reads them when it opens. After
 * setting `value` from script, call `refresh()` so the input shows the new label.
 */
class SearchableSelect extends HTMLSelectElement {
  connectedCallback() {
    if (this.isEnhanced) {
      return
    }
    this.isEnhanced = true
    this.#enhance()

    /*
    Options can arrive long after this — the pages fill their pickers from a
    request, and EHTML writes the options straight into the select. The list
    reads them fresh every time it opens, so searching is right either way; the
    input showing the current label is not, since it is written once and has no
    way of knowing the option behind it was replaced. So it is rewritten
    whenever the options change.
    */
    new MutationObserver(() => this.refresh()).observe(this, { childList: true })
  }

  /**
   * Show the label of whatever is selected now.
   */
  refresh() {
    if (this.input) {
      const option = this.selectedOptions[0]
      this.input.value = option ? option.textContent.trim() : ''
    }
  }

  #enhance() {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-combobox', '')

    const input = document.createElement('input')
    input.type = 'text'
    input.autocomplete = 'off'
    input.spellcheck = false
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-expanded', 'false')
    input.setAttribute('aria-autocomplete', 'list')
    if (this.dataset.placeholder) {
      input.placeholder = this.dataset.placeholder
    }

    const list = document.createElement('ul')
    list.setAttribute('data-combobox-list', '')
    list.setAttribute('role', 'listbox')
    list.hidden = true
    list.id = `combobox-list-${Math.random().toString(36).slice(2, 9)}`
    input.setAttribute('aria-controls', list.id)

    if (this.id) {
      const label = document.querySelector(`label[for="${this.id}"]`)
      if (label) {
        input.id = `${this.id}-combobox`
        label.setAttribute('for', input.id)
      }
    }

    this.parentNode.insertBefore(wrapper, this)
    wrapper.append(input, list, this)
    this.hidden = true
    this.tabIndex = -1
    this.input = input

    let active = -1
    let shown = []
    /*
    Whether anything has been typed since the box was focused.

    Until it has, the input still holds the label of what is selected, and that
    label must not be read as a search — focusing a list of two hundred glyphs
    and being shown only the one already chosen is the opposite of useful.
    */
    let typed = false

    const labelOf = (option) => option.textContent.trim()

    const close = () => {
      list.hidden = true
      input.setAttribute('aria-expanded', 'false')
      active = -1
    }

    const highlight = (index, { scroll = true } = {}) => {
      active = index
      for (const [ position, item ] of [ ...list.children ].entries()) {
        const current = position === index
        item.toggleAttribute('data-active', current)
        item.setAttribute('aria-selected', String(current))
        if (current && scroll) {
          /*
          Scroll the list itself rather than calling scrollIntoView, which walks
          up the ancestors and would drag the whole page to reach an option two
          hundred rows down.

          Where the option sits is measured against the list's own scroll box.
          `offsetTop` cannot be used directly: the list is positioned, so it is
          its options' offsetParent here but need not be under other styling,
          and the two cases differ by the height of the input above it.
          */
          const box = list.getBoundingClientRect()
          const above = item.getBoundingClientRect().top - box.top -
            list.clientTop + list.scrollTop
          const below = above + item.offsetHeight
          if (above < list.scrollTop) {
            list.scrollTop = above
          } else if (below > list.scrollTop + list.clientHeight) {
            list.scrollTop = below - list.clientHeight
          }
        }
      }
    }

    const choose = (option) => {
      this.value = option.value
      this.dispatchEvent(new Event('change', { bubbles: true }))
      this.refresh()
      close()
      /*
      What the input holds now is a label, not a query — the box keeps focus
      after a choice, so without this the next click would search for the name
      just chosen and reopen on that one option.
      */
      typed = false
    }

    const open = (query = '') => {
      const needle = query.trim().toLowerCase()
      shown = [ ...this.options ].filter(
        (option) => !needle || labelOf(option).toLowerCase().includes(needle)
      )
      list.replaceChildren(...shown.map((option, index) => {
        const item = document.createElement('li')
        item.setAttribute('data-combobox-option', '')
        item.setAttribute('role', 'option')
        item.setAttribute('aria-selected', 'false')
        item.textContent = labelOf(option)
        item.addEventListener('mousedown', (event) => {
          // Choose before the input loses focus, so blur does not close first.
          event.preventDefault()
          choose(option)
        })
        // Moving the pointer over the list should not scroll it under the pointer.
        item.addEventListener('mouseenter', () => highlight(index, { scroll: false }))
        return item
      }))
      if (!shown.length) {
        const empty = document.createElement('li')
        empty.setAttribute('data-combobox-empty', '')
        empty.textContent = 'No matches'
        list.replaceChildren(empty)
      }
      list.hidden = false
      input.setAttribute('aria-expanded', 'true')

      /*
      Open on what is selected, not on the top of the list. A filtered list
      starts at its best match; an unfiltered one starts where you already are,
      scrolled into view, so the list opens showing its answer.
      */
      const selected = this.selectedOptions[0]
      const at = selected ? shown.indexOf(selected) : -1
      highlight(shown.length ? (at === -1 ? 0 : at) : -1)
    }

    /*
    Select the text on focus so the first keystroke replaces the current label
    rather than being appended to it — typing into an input already reading
    "treble" would otherwise search for "treblea" and find nothing.
    */
    input.addEventListener('focus', () => {
      typed = false
      input.select()
      open()
    })

    // Keep focus when the pointer lands on the list's padding or its scrollbar.
    list.addEventListener('mousedown', (event) => {
      if (event.target === list) {
        event.preventDefault()
      }
    })

    input.addEventListener('input', () => {
      typed = true
      open(input.value)
    })
    // A click lands right after the focus that opened the list; reopening it on
    // the untouched label would filter the list down to the one already chosen.
    input.addEventListener('click', () => {
      if (list.hidden) {
        open(typed ? input.value : '')
      }
    })
    input.addEventListener('blur', () => {
      // Restore the label of what is selected, not a half-typed query.
      setTimeout(() => {
        // Focus can come straight back — a choice made with the pointer, or the
        // box refocused before the turn ends. A stale blur must not close the
        // list that focus has just reopened.
        if (document.activeElement === input) {
          return
        }
        this.refresh()
        close()
        typed = false
      }, 0)
    })

    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (list.hidden) {
          return open(typed ? input.value : '')
        }
        const step = event.key === 'ArrowDown' ? 1 : -1
        highlight((active + step + shown.length) % Math.max(1, shown.length))
        return
      }
      if (event.key === 'Enter' && !list.hidden && shown[active]) {
        event.preventDefault()
        choose(shown[active])
        return
      }
      if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault()
        this.refresh()
        close()
      }
    })

    this.refresh()
  }
}

customElements.define('searchable-select', SearchableSelect, { extends: 'select' })

export default SearchableSelect
