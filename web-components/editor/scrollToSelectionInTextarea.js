import textWidthInTextarea from '#msq/web-components/editor/textWidthInTextarea.js'
import offsetsOfLineInTextarea from '#msq/web-components/editor/offsetsOfLineInTextarea.js'

// Brings the caret fully into view — never a caret half cut by an edge, which
// is what deleting a line could leave behind. The line it sits on is measured
// rather than multiplied (see offsetsOfLineInTextarea), and the view is left
// alone while the caret is already whole inside it. Only when it is not does
// the view move, and then the caret goes a third of the way down, where it is
// easiest to read from.
export default (textarea) => {
  const caret = textarea.selectionStart
  const lineStart = textarea.value.lastIndexOf('\n', caret - 1) + 1
  const lineIndex = textarea.value.slice(0, caret).split('\n').length - 1
  const caretX = textWidthInTextarea(textarea, textarea.value.slice(lineStart, caret))
  const { top: lineTop, bottom: lineBottom } = offsetsOfLineInTextarea(textarea, lineIndex)

  const caretIsWholeAboveAndBelow =
    lineTop >= textarea.scrollTop &&
    lineBottom <= textarea.scrollTop + textarea.clientHeight
  if (!caretIsWholeAboveAndBelow) {
    textarea.scrollTop = lineTop - textarea.clientHeight / 3
  }

  const caretIsWholeLeftAndRight =
    caretX >= textarea.scrollLeft &&
    caretX <= textarea.scrollLeft + textarea.clientWidth
  if (!caretIsWholeLeftAndRight) {
    textarea.scrollLeft = caretX - textarea.clientWidth / 3
  }
}
