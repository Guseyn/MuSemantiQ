export default (divUnderneathTextarea, lineNumbersColumn, textarea) => {
  textarea.addEventListener('scroll', () => {
    divUnderneathTextarea.scrollTop = textarea.scrollTop
    divUnderneathTextarea.scrollLeft = textarea.scrollLeft
    lineNumbersColumn.scrollTop = textarea.scrollTop
  }, { passive: true })
}
