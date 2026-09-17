import isPrintableKeycode from '#msq/editor/isPrintableKeycode.js'

export default (textarea) => {
  textarea.weAreTypingInTextarea = false
  let delayedTypingAction
  textarea.addEventListener('keydown', (event) => {
    if (delayedTypingAction) {
      window.clearTimeout(delayedTypingAction)
    }
    if (isPrintableKeycode(event.keyCode)) {
      textarea.weAreTypingInTextarea = true
    }
    delayedTypingAction = window.setTimeout(() => {
      textarea.weAreTypingInTextarea = false
    }, 500)
  })
}
