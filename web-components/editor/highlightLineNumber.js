export default (shadowRoot, textarea, lineNumbersColumn) => {
  const selectionStartInTextarea = textarea.selectionStart
  const currentLineNumberWhereCaretIsOn = textarea.value.substr(0, selectionStartInTextarea).split('\n').length
  if (lineNumbersColumn.currentHighlightedNumber && lineNumbersColumn.currentHighlightedNumber !== currentLineNumberWhereCaretIsOn) {
    const lineNumberBlock = shadowRoot.getElementById(`line-number-${lineNumbersColumn.currentHighlightedNumber}`)
    if (lineNumberBlock) {
      lineNumberBlock.classList.remove('current')
    }
  }
  shadowRoot.getElementById(`line-number-${currentLineNumberWhereCaretIsOn}`).classList.add('current')
  lineNumbersColumn.currentHighlightedNumber = currentLineNumberWhereCaretIsOn
}
