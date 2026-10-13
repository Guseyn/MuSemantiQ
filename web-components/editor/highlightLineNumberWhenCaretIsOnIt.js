import highlightLineNumber from '#msq/web-components/editor/highlightLineNumber.js'

export default (shadowRoot, textarea, lineNumbersColumn) => {
  document.addEventListener('selectionchange', () => {
    if (shadowRoot.activeElement === textarea) {
      highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
    }
  })
  textarea.addEventListener('input', () => {
    highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
  })
  // The caret also moves without typing — arrow keys, Home/End, clicking — and
  // the selectionchange event never fires for a textarea's own caret, so those
  // moves are caught here.
  textarea.addEventListener('keyup', () => {
    highlightLineNumber(shadowRoot, textarea, lineNumbersColumn)
  })
  textarea.addEventListener('mouseup', () => {
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
