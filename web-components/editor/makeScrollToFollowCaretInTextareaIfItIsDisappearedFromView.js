import scrollToSelectionInTextarea from '#msq/web-components/editor/scrollToSelectionInTextarea.js'

export default (textarea) => {
  textarea.addEventListener('input', () => {
    scrollToSelectionInTextarea(textarea)
  })
}
