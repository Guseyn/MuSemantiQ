import worker from '#msq/utils/worker-instance.js'
import trimMultilineText from '#msq/utils/trimMultilineText.js'
import errorsHtml from '#msq/utils/errorsHtml.js'

import tokens from '#msq/css/tokens.js'
import surface from '#msq/css/surface.js'
import errorsCss from '#msq/css/errors.js'

/**
 * Shared shell for every <template is="msq-*"> element.
 *
 * All of them do the same four things: take their own text content as input,
 * ask the worker for something, build a detached <div> with an open shadow root,
 * and replace themselves with it. Subclasses supply only `render()`.
 */
export default class MSQTemplateElement extends HTMLTemplateElement {
  constructor() {
    super()
    this.id = crypto.randomUUID()
    this.isRendered = false
  }

  connectedCallback() {
    if (this.isRendered === true) {
      return
    }
    this.isRendered = true
    this.render()
  }

  render() {
    throw new Error(`${this.constructor.name} must implement render()`)
  }

  get inputText() {
    const contentNode = document.importNode(this.content, true)
    return trimMultilineText(this.innerState || contentNode.textContent)
  }

  /**
   * The reference a msq-font-loader registered its fonts under. Required by
   * every element that engraves; msq-midi does not need fonts.
   */
  requiredFontSourcesReference() {
    const fontSourcesReference = this.getAttribute('data-font-sources')
    if (!fontSourcesReference) {
      throw new Error(
        `<template is="${this.getAttribute('is')}"> must have a "data-font-sources" attribute ` +
        `matching a "data-font-sources-reference" declared on a msq-font-loader`
      )
    }
    return fontSourcesReference
  }

  /**
   * One worker is shared by every element on the page, so replies must be
   * matched on id — including failures, which used to be broadcast to everyone.
   */
  requestFromWorker({ name, ...payload }) {
    return new Promise((resolve, reject) => {
      const messageHandler = (event) => {
        if (event.data.id !== this.id) {
          return
        }
        worker.removeEventListener('message', messageHandler)
        if (event.data.status === 'ok') {
          resolve(event.data)
          return
        }
        reject(new Error(event.data.error || `worker failed to handle "${name}"`))
      }
      worker.addEventListener('message', messageHandler)
      worker.postMessage({ id: this.id, name, ...payload })
    })
  }

  /**
   * `styles` are appended after the shared ones, so an element can override
   * them; `html` is the shadow root's markup, which must contain the
   * div[data-inner-wrapper] that updateErrors() appends to.
   *
   * `label` names the element for assistive technology. It is deliberately a
   * short description of the element rather than the MSQ source: the source is
   * already readable in the editor and copyable from the toolbar, and as a
   * label it would be read out in full every time focus entered the element.
   */
  createShadowHost({ renderedBy, label, styles = [], html }) {
    const elm = document.createElement('div')
    elm.attachShadow({ mode: 'open' })
    elm.setAttribute('role', 'group')
    elm.setAttribute('aria-label', label)
    elm.setAttribute('data-rendered-by', `template[is="${renderedBy}"]`)
    elm.shadowRoot.innerHTML = /*html*/`
      <style>${[ tokens, surface, errorsCss, ...styles ].join('\n')}</style>
      ${html}
    `
    return elm
  }

  /**
   * The score is a worker-generated <svg> with no accessible name of its own,
   * and it is inserted as markup, so it can only be labelled afterwards.
   */
  labelScore(container, label) {
    const svg = container.querySelector('svg')
    if (!svg) {
      return
    }
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', label)
    svg.setAttribute('focusable', 'false')
  }

  replaceSelf(elm) {
    this.parentElement.replaceChild(elm, this)
  }

  /**
   * Renders the errors table as the last row of the surface, or removes it
   * entirely when there is nothing to report. Safe to call repeatedly, which is
   * what the editor does on every highlight pass.
   */
  updateErrors(shadowRoot, errors) {
    const wrapper = shadowRoot.querySelector('div[data-inner-wrapper]')
    const html = errorsHtml(errors)
    let panel = wrapper.querySelector('div[data-errors]')

    if (!html) {
      if (panel) {
        panel.remove()
      }
      wrapper.removeAttribute('data-has-errors')
      return
    }

    if (!panel) {
      panel = document.createElement('div')
      panel.setAttribute('data-errors', '')
      panel.setAttribute('role', 'group')
      panel.setAttribute('aria-label', 'Errors')
      // Polite rather than an alert: the editor re-renders this on demand, and
      // interrupting whatever is being read for a parse error is too much.
      panel.setAttribute('aria-live', 'polite')
      wrapper.appendChild(panel)
    }
    panel.innerHTML = html
    wrapper.setAttribute('data-has-errors', '')
  }
}
