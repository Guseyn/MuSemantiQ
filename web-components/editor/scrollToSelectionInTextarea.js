import textWidthInTextarea from '#msq/editor/textWidthInTextarea.js'

export default (textarea, textareaLineHeight) => {
  const selectionStartInTextarea = textarea.selectionStart
  const textareaValueSplittedInLines = textarea.value.split('\n')
  const numberOfCharsInEachLineInTextarea = textareaValueSplittedInLines.map(value => value.length)
  const lineIndexWhereCaretIsOn = textarea.value.substr(0, selectionStartInTextarea).split('\n').length - 1
  const numberOfCharsInEachLineBeforeTheLineWhereCaretIsOn = numberOfCharsInEachLineInTextarea.slice(0, lineIndexWhereCaretIsOn)
  const numberOfCharsBeforeFirstCharOnTheLineWhereCaretIsOn = (numberOfCharsInEachLineBeforeTheLineWhereCaretIsOn.length >= 1)
    ? numberOfCharsInEachLineBeforeTheLineWhereCaretIsOn.reduce((totalNumberOfChars, numberOfCharsOnTheLineWhereCaretIsOn) => totalNumberOfChars + numberOfCharsOnTheLineWhereCaretIsOn)
    : 0
  const totalNumberOfCharsBeforeSelectionStartInTextarea = selectionStartInTextarea
  const numberOfNewLineCharsBeforeTheLineWhereCaretIsOn = lineIndexWhereCaretIsOn
  const columnNumberWhereCaretIsOn = totalNumberOfCharsBeforeSelectionStartInTextarea - numberOfCharsBeforeFirstCharOnTheLineWhereCaretIsOn - numberOfNewLineCharsBeforeTheLineWhereCaretIsOn
  const textareaValueOnTheLineWhereCarretIsOn = textareaValueSplittedInLines[lineIndexWhereCaretIsOn]
  const textTillCurrentColumnNumberAndTheLineNumberWhereCaretIsOn = textareaValueOnTheLineWhereCarretIsOn.slice(0, columnNumberWhereCaretIsOn)
  const widthOfTextTillCurrentColumnNumberAndTheLineNumberWhereCaretIsOn = textWidthInTextarea(textarea, textTillCurrentColumnNumberAndTheLineNumberWhereCaretIsOn)
  const yPositionOfCaretInTextarea = textareaLineHeight * (lineIndexWhereCaretIsOn + 1)
  const xPositionOfCaretInTextarea = widthOfTextTillCurrentColumnNumberAndTheLineNumberWhereCaretIsOn
  const caretInTextareaIsOutOfVerticalView = (
    (textarea.scrollTop > (yPositionOfCaretInTextarea + textareaLineHeight)) ||
    (textarea.scrollTop < (yPositionOfCaretInTextarea - textarea.clientHeight))
  )
  const caretInTextareaIsOutOfHorizontalView = (
    (textarea.scrollLeft > xPositionOfCaretInTextarea) ||
    (textarea.scrollLeft < (xPositionOfCaretInTextarea - textarea.clientWidth))
  )
  if (caretInTextareaIsOutOfVerticalView) {
    const negativeTopPaddingSoThatCaretWillBeSomewhatInTheMiddleOfVerticalView = 1 / 3
    textarea.scrollTop = yPositionOfCaretInTextarea - textarea.clientHeight * negativeTopPaddingSoThatCaretWillBeSomewhatInTheMiddleOfVerticalView
  }
  if (caretInTextareaIsOutOfHorizontalView) {
    const negativeLeftPaddingSoThatCaretWillBeSomewhatInTheMiddleOfHorizontalView = 1 / 3
    textarea.scrollLeft = xPositionOfCaretInTextarea - textarea.clientWidth * negativeLeftPaddingSoThatCaretWillBeSomewhatInTheMiddleOfHorizontalView
  }
}
