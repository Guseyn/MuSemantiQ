import scrollToSelectionInTextarea from '#msq/editor/scrollToSelectionInTextarea.js'

export default (textarea) => {
  const textareaComputedStyle = window.getComputedStyle(textarea)
  const textareaLineHeight = textareaComputedStyle.getPropertyValue('line-height').split('px')[0] * 1
  textarea.addEventListener('input', () => {
    scrollToSelectionInTextarea(textarea, textareaLineHeight)
  })
}
