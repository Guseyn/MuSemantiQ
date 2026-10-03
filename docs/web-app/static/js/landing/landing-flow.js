/*
<div is="landing-flow" data-flow-layout>
  <ol data-flow> <li data-stage="…"> <button data-stage-button [data-output="…"]> … </ol>
  <div data-flow-notes> <div data-note-for="…"> … </div>
</div>

The pipeline diagram and the prose beside it are one thing: pointing at a stage
shows what that stage is. The notes are stacked in a single grid cell, so only
the current one is visible and the column never changes height.
*/
class LandingFlow extends HTMLDivElement {
  #buttons = []
  #notes = []

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
  }

  #showStageOf = (event) => {
    this.#show(keyOf(event.currentTarget))
  }

  #show(key) {
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
