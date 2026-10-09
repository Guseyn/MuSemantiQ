/*
The highlights div only mirrors the textarea's scroll, so the textarea is the
one to scroll: the div and the line numbers follow it. Its scroll event comes
later, and the span is flashed right away, so all three are set here.

scrollIntoView is not used for the editor itself: it would also scroll the
textarea's ancestors, and the word would land at the very edge. Like the
caret, the word is put a third of the way into the view.
*/
export default (span, divUnderneathTextarea, textarea, lineNumbersColumn) => {
  const spanRect = span.getBoundingClientRect()
  const divRect = divUnderneathTextarea.getBoundingClientRect()
  const spanTop = spanRect.top - divRect.top + divUnderneathTextarea.scrollTop
  const spanLeft = spanRect.left - divRect.left + divUnderneathTextarea.scrollLeft
  const spanIsOutOfVerticalView = (
    (spanTop < divUnderneathTextarea.scrollTop) ||
    (spanTop + spanRect.height > divUnderneathTextarea.scrollTop + divUnderneathTextarea.clientHeight)
  )
  const spanIsOutOfHorizontalView = (
    (spanLeft < divUnderneathTextarea.scrollLeft) ||
    (spanLeft + spanRect.width > divUnderneathTextarea.scrollLeft + divUnderneathTextarea.clientWidth)
  )
  if (spanIsOutOfVerticalView) {
    textarea.scrollTop = spanTop - divUnderneathTextarea.clientHeight / 3
  }
  if (spanIsOutOfHorizontalView) {
    textarea.scrollLeft = spanLeft - divUnderneathTextarea.clientWidth / 3
  }
  divUnderneathTextarea.scrollTop = textarea.scrollTop
  divUnderneathTextarea.scrollLeft = textarea.scrollLeft
  lineNumbersColumn.scrollTop = textarea.scrollTop
  // The editor itself can be partly off the screen. 'nearest' scrolls the page
  // only if the word is not on it, and only as far as needed.
  span.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
