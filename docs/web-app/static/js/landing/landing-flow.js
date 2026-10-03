/*
<div is="landing-flow" data-flow-layout>
  <ol data-flow> <li data-stage="…"> <button data-stage-button [data-output="…"]> … </ol>
  <div data-flow-notes> <div data-note-for="…"> … </div>
</div>

The pipeline diagram and the prose beside it are one thing: pointing at a stage
shows what that stage is. The notes are stacked in a single grid cell, so only
the current one is visible and the column never changes height.

While its screen is the one in view, Tab and Shift + Tab move to the next and
the previous stage, wherever the focus was, so the steps can be read one after
another from the keyboard. Past the first or the last stage they do what they
always do, and move on through the page.
*/
class LandingFlow extends HTMLDivElement {
  #buttons = []
  #notes = []
  #current = 0

  connectedCallback() {
    this.#buttons = [ ...this.querySelectorAll('[data-stage-button]') ]
    this.#notes = [ ...this.querySelectorAll('[data-note-for]') ]
    if (!this.#buttons.length || !this.#notes.length) {
      return
    }

    for (const button of this.#buttons) {
      button.addEventListener('mouseenter', this.#showStageOf)
      button.addEventListener('focus', this.#showStageOf)
      button.addEventListener('click', this.#showStageOf)
    }
    document.addEventListener('keydown', this.#onKeydown)

    // The stages arrive one after the other, so the pipeline is read downwards.
    this.querySelectorAll('[data-flow] li').forEach((stage, index) => {
      stage.style.setProperty('--d', `${index * 130}ms`)
    })

    this.#show(keyOf(this.#buttons[0]))
  }

  disconnectedCallback() {
    for (const button of this.#buttons) {
      button.removeEventListener('mouseenter', this.#showStageOf)
      button.removeEventListener('focus', this.#showStageOf)
      button.removeEventListener('click', this.#showStageOf)
    }
    document.removeEventListener('keydown', this.#onKeydown)
  }

  #onKeydown = (event) => {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) {
      return
    }
    if (!this.#screenIsInView()) {
      return
    }
    // Focus already on a stage counts from that stage; anywhere else, from the one shown
    const focused = this.#buttons.indexOf(document.activeElement)
    const from = focused === -1 ? this.#current : focused
    const next = from + (event.shiftKey ? -1 : 1)
    if (next < 0 || next >= this.#buttons.length) {
      return
    }
    event.preventDefault()
    // Focusing the button shows its stage (the focus listener above)
    this.#buttons[next].focus({ preventScroll: true })
  }

  // The screen holding the flow is the one the reader is on
  #screenIsInView() {
    const screen = this.closest('[data-screen]')
    if (!screen) {
      return false
    }
    const box = screen.getBoundingClientRect()
    return box.top < window.innerHeight * 0.5 && box.bottom > window.innerHeight * 0.5
  }

  #showStageOf = (event) => {
    this.#show(keyOf(event.currentTarget))
  }

  #show(key) {
    this.#current = Math.max(0, this.#buttons.findIndex((button) => keyOf(button) === key))
    for (const button of this.#buttons) {
      button.setAttribute('aria-current', String(keyOf(button) === key))
    }
    for (const note of this.#notes) {
      note.setAttribute('data-current', String(note.dataset.noteFor === key))
    }
  }
}

// A stage's own name, or the particular output the button stands for.
function keyOf(button) {
  return button.dataset.output || button.closest('[data-stage]').dataset.stage
}

customElements.define('landing-flow', LandingFlow, { extends: 'div' })
