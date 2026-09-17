const NEW_LINE = '\n'

export default (textareaValue) => {
  if (textareaValue[textareaValue.length - 1] === NEW_LINE) {
    textareaValue += NEW_LINE
  }
  return textareaValue
}
