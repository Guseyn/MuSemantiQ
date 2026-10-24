/*
  Tab with no suggestion to insert.

  The autocomplete owns Tab while its list is open — there it inserts the
  suggestion and marks the key handled. With no suggestion the key used to fall
  through to the browser, which moved focus on to the next control and left the
  editor. So Tab indents: one tab character where the selection is. The list's
  handler runs first, and what it has already handled is left alone.
*/
export default (textarea) => {
  textarea.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || event.shiftKey || event.defaultPrevented) {
      return
    }
    event.preventDefault()
    // A real insert fires a real input event, which is what the highlight
    // layer, the line numbers and the undo history all listen to.
    const inserted = document.execCommand('insertText', false, '\t')
    if (!inserted) {
      textarea.setRangeText('\t', textarea.selectionStart, textarea.selectionEnd, 'end')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
}
