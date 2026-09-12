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

    const labelOf = (option) => option.textContent.trim()

    const close = () => {
      list.hidden = true
      input.setAttribute('aria-expanded', 'false')
      active = -1
    }

    const highlight = (index) => {
      active = index
      for (const [ position, item ] of [ ...list.children ].entries()) {
        const current = position === index
        item.toggleAttribute('data-active', current)
        item.setAttribute('aria-selected', String(current))
        if (current) {
          item.scrollIntoView({ block: 'nearest' })
        }
      }
    }

    const choose = (option) => {
      this.value = option.value
      this.dispatchEvent(new Event('change', { bubbles: true }))
      this.refresh()
      close()
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
        item.addEventListener('mouseenter', () => highlight(index))
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
      highlight(shown.length ? 0 : -1)
    }

    /*
    Select the text on focus so the first keystroke replaces the current label
    rather than being appended to it — typing into an input already reading
    "treble" would otherwise search for "treblea" and find nothing.
    */
    input.addEventListener('focus', () => {
      input.select()
      open()
    })

    // Keep focus when the pointer lands on the list's padding or its scrollbar.
    list.addEventListener('mousedown', (event) => {
      if (event.target === list) {
        event.preventDefault()
      }
    })

    input.addEventListener('input', () => open(input.value))
    input.addEventListener('click', () => {
      if (list.hidden) {
        open(input.value)
      }
    })
    input.addEventListener('blur', () => {
      // Restore the label of what is selected, not a half-typed query.
      setTimeout(() => { this.refresh(); close() }, 0)
    })

    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (list.hidden) {
          return open(input.value)
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
