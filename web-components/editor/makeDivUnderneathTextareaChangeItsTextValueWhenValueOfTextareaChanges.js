import highlightTextareaValueInDivUnderneathItWithoutRefIds from '#msq/editor/highlightTextareaValueInDivUnderneathItWithoutRefIds.js'
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
    const textareaTextLengthHasChangedOnOneChar = (Math.abs(textarea.value.length - textarea.textareaTextLengthBeforeNextChange) === 1)
    highlightTextareaValueInDivUnderneathItWithoutRefIds(
      divUnderneathTextarea,
      textarea,
      !textareaTextLengthHasChangedOnOneChar || textarea.isRenderedWithLatestInputText
    )
    textarea.isRenderedWithLatestInputText = false
    textarea.isModified = true
    textarea.textareaTextLengthBeforeNextChange = updatedTextareaTextLength
  })
}
