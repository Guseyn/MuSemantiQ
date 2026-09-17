import highlightLineNumber from '#msq/editor/highlightLineNumber.js'

export default (shadowRoot, textarea, lineNumbersColumn) => {
  document.addEventListener('selectionchange', () => {
    if (shadowRoot.activeElement === textarea) {
      highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
    }
  })
  textarea.addEventListener('input', () => {
    highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
  })
  textarea.addEventListener('blur', () => {
    const lineNumberBlock = shadowRoot.getElementById(`line-number-${lineNumbersColumn.currentHighlightedNumber}`)
    if (lineNumberBlock) {
      lineNumberBlock.classList.remove('current')
    }
  })
  textarea.addEventListener('focus', () => {
    highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
  })
}
