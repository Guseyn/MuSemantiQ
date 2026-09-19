import fillLineNumbersColumn from '#msq/web-components/editor/fillLineNumbersColumn.js'

export default (lineNumbersColumn, textarea, divUnderneathTextarea) => {
  textarea.addEventListener('input', () => {
    fillLineNumbersColumn(lineNumbersColumn, textarea, divUnderneathTextarea)
  })
}
