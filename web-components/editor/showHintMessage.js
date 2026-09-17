/**
 * A transient message centred over the element.
 *
 * It goes inside div[data-inner-wrapper] rather than into the shadow root or the
 * host's light DOM: the wrapper is the only positioned ancestor, so that is what
 * `position: absolute; top/left: 50%` in css/editor.js resolves against.
 * Appended to the shadow root it would centre on the whole page instead, and in
 * the host's light DOM it would not render at all.
 *
 * Only one hint shows at a time — a second replaces the first.
 */
export default function showHintMessage(shadowHost, text) {
  const wrapper = shadowHost.shadowRoot.querySelector('div[data-inner-wrapper]')
  if (!wrapper) {
    return
  }
  const previousHint = wrapper.querySelector('[data-hint]')
  if (previousHint) {
    previousHint.remove()
  }
  const hintMessage = document.createElement('div')
  hintMessage.setAttribute('data-hint', '')
  // It disappears on its own, so it has to be announced where it stands.
  hintMessage.setAttribute('role', 'status')
  hintMessage.textContent = text
  wrapper.appendChild(hintMessage)
  setTimeout(() => {
    hintMessage.remove()
  }, 5000)
  return hintMessage
}
