import fillLineNumbersColumn from '#msq/editor/fillLineNumbersColumn.js'

export default (lineNumbersColumn, textarea, divUnderneathTextarea) => {
  textarea.addEventListener('input', () => {
    fillLineNumbersColumn(lineNumbersColumn, textarea, divUnderneathTextarea)
  })
}
