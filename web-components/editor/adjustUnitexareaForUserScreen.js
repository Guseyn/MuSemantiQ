export default (textarea, divUnderneathTextarea, lineNumbersColumn) => {
  const computedStyleOfLineNumbersColumn = window.getComputedStyle(lineNumbersColumn)
  const computedStyleOfTexareaParent = window.getComputedStyle(textarea.parentElement)
  const lineNumbersColumnWidth = computedStyleOfLineNumbersColumn.getPropertyValue('width').split('px')[0] * 1
  const lineNumbersColumnLeft = computedStyleOfLineNumbersColumn.getPropertyValue('left').split('px')[0] * 1
  const textareaParentWidth = computedStyleOfTexareaParent.getPropertyValue('width').split('px')[0] * 1
  const additionalSpace = 12
  const lineNumbersColumnAdjustment = lineNumbersColumnWidth + lineNumbersColumnLeft + additionalSpace
  textarea.style.left = `${lineNumbersColumnAdjustment}px`
  divUnderneathTextarea.style.left = textarea.style.left
  textarea.style.width = `${textareaParentWidth - lineNumbersColumnAdjustment - additionalSpace}px`
  divUnderneathTextarea.style.width = textarea.style.width
}
