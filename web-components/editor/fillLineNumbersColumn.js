import adjustUnitexareaForUserScreen from '#msq/web-components/editor/adjustUnitexareaForUserScreen.js'

export default (lineNumbersColumn, textarea, divUnderneathTextarea) => {
  const numberOfLines = textarea.value.split('\n').length
  /*
    Rewritten only when the number of lines changes. Every keystroke used to
    rebuild all of it — one span per line — and re-measure the gutter, which is
    where the text field's own width is taken from; neither changes while lines
    are only getting longer or shorter.
  */
  if (lineNumbersColumn.numberOfLinesItHolds === numberOfLines) {
    return
  }
  const numbersForEachLine = new Array(numberOfLines).fill().map((undefinedNumber, numberIndex) => {
    return `<span data-line-number id="line-number-${numberIndex + 1}">${numberIndex + 1}</span>`
  }).join('\n')
  lineNumbersColumn.innerHTML = numbersForEachLine
  lineNumbersColumn.numberOfLinesItHolds = numberOfLines
  adjustUnitexareaForUserScreen(textarea, divUnderneathTextarea, lineNumbersColumn)
}
