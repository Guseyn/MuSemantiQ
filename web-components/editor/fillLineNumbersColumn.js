import adjustUnitexareaForUserScreen from '#msq/editor/adjustUnitexareaForUserScreen.js'

export default (lineNumbersColumn, textarea, divUnderneathTextarea) => {
  const numberOfLines = textarea.value.split('\n').length
  const numbersForEachLine = new Array(numberOfLines).fill().map((undefinedNumber, numberIndex) => {
    return `<span data-line-number id="line-number-${numberIndex + 1}">${numberIndex + 1}</span>`
  }).join('\n')
  lineNumbersColumn.innerHTML = numbersForEachLine
  adjustUnitexareaForUserScreen(textarea, divUnderneathTextarea, lineNumbersColumn)
}
