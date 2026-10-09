/*
The highlights are the textarea's text with spans around words, so the length
of the text before a span is where its word starts in the textarea.

The caret has to be there: a focused textarea scrolls back to its caret, so
with the caret anywhere else the word would be scrolled out of view again.
*/
export default (span, divUnderneathTextarea, textarea) => {
  const range = document.createRange()
  range.setStart(divUnderneathTextarea.textContainer, 0)
  range.setEnd(span, 0)
  const position = range.toString().length
  textarea.setSelectionRange(position, position)
}
