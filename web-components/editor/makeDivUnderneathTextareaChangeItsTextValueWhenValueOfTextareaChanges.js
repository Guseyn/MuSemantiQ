import highlightTextareaValueInDivUnderneathItWithoutRefIds from '#msq/web-components/editor/highlightTextareaValueInDivUnderneathItWithoutRefIds.js'
const NEW_LINE = '\n'

export default (divUnderneathTextarea, textarea) => {
  textarea.mapOfCharIndexesWithProgressionOfCommandsFromScenarios = {}
  textarea.addEventListener('beforeinput', () => {
    if (textarea.textareaTextLengthBeforeNextChange === undefined) {
      textarea.textareaTextLengthBeforeNextChange = textarea.value.length
    }
    if (textarea.numberOfLinesInTextareaBeforeNextChange === undefined) {
      textarea.numberOfLinesInTextareaBeforeNextChange = textarea.value.split(NEW_LINE).length
    }
  })
  textarea.addEventListener('input', () => {
    const updatedTextareaTextLength = textarea.value.length
    const updatedNumberOfLines = textarea.value.split(NEW_LINE).length
    const textareaTextLengthHasChangedOnOneChar = (Math.abs(textarea.value.length - textarea.textareaTextLengthBeforeNextChange) === 1)
    // A change that adds or removes a line moves every character after it, and
    // the incremental parse splices its per-character map and its per-line nodes
    // by absolute index — indices that no longer mean the same thing. Colours
    // land on the line above, or the layer loses hold of its own nodes and the
    // new line never appears at all. So a line change colours the page whole,
    // which is what keeps the map and the layer in step.
    const numberOfLinesHasChanged = updatedNumberOfLines !== textarea.numberOfLinesInTextareaBeforeNextChange
    highlightTextareaValueInDivUnderneathItWithoutRefIds(
      divUnderneathTextarea,
      textarea,
      !textareaTextLengthHasChangedOnOneChar || textarea.isRenderedWithLatestInputText || numberOfLinesHasChanged
    )
    textarea.isRenderedWithLatestInputText = false
    textarea.isModified = true
    textarea.textareaTextLengthBeforeNextChange = updatedTextareaTextLength
    textarea.numberOfLinesInTextareaBeforeNextChange = updatedNumberOfLines
  })
}
