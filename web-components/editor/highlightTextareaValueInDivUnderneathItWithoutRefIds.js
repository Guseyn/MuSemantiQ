import adjustTextareaValueToKeepScrollingAlignedWhenItsValueEndsWithNewline from '#msq/editor/adjustTextareaValueToKeepScrollingAlignedWhenItsValueEndsWithNewline.js'
import parsedHighlights from '#msq/editor/parsedHighlights.js'
import refreshDivUnderneathTextareaWithNewHtml from '#msq/editor/refreshDivUnderneathTextareaWithNewHtml.js'

const NEW_LINE = '\n'
const EMPTY_STRING = ''
const COMMAND_IS_NOT_RECOGNIZABLE = 'command is not recognizable'
const SPAN = 'span'

const extendedLastLineIndexToParse = (inititalLastLineIndexToParse, numberOfCharsInEachLineInTextarea, currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios) => {
  const linesBelowInitialLastLineToParse = numberOfCharsInEachLineInTextarea.slice(inititalLastLineIndexToParse + 1)
  const numberOfCharsBetweenLastCharInInitialLastLineToParseAndLastCharInLastLineInGeneral = linesBelowInitialLastLineToParse.reduce((numberOfCharsInLines, numberOfCharsInCurrentLine) => numberOfCharsInLines + numberOfCharsInCurrentLine, 0)
  let charIndexFromWhichWeCanCaptureProgressionsAfterInitialLastLineIndexToParse = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios.length - numberOfCharsBetweenLastCharInInitialLastLineToParseAndLastCharInLastLineInGeneral
  let lastLineIndexToParseAsResult = inititalLastLineIndexToParse
  let weDontNeedToExploreFurtherLinesBelow = false
  let previousLineDoesNotContainNotRecognizableCommands = true
  const informationOnWhetherPreviousLinesReachedProgressionOfMoreThanOneCommand = []
  for (let lineIndex = inititalLastLineIndexToParse + 1; lineIndex < numberOfCharsInEachLineInTextarea.length; lineIndex++) {
    if (lastLineIndexToParseAsResult === (numberOfCharsInEachLineInTextarea.length - 1)) {
      return lastLineIndexToParseAsResult
    }
    const currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios.slice(
      charIndexFromWhichWeCanCaptureProgressionsAfterInitialLastLineIndexToParse, charIndexFromWhichWeCanCaptureProgressionsAfterInitialLastLineIndexToParse + numberOfCharsInEachLineInTextarea[lineIndex]
    )
    for (let valueIndex = 0; valueIndex < currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine.length; valueIndex++) {
      if (currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine[valueIndex].indexOf(COMMAND_IS_NOT_RECOGNIZABLE) !== -1) {
        if (lastLineIndexToParseAsResult === (numberOfCharsInEachLineInTextarea.length - 1)) {
          return lastLineIndexToParseAsResult
        }
        lastLineIndexToParseAsResult += 1
        charIndexFromWhichWeCanCaptureProgressionsAfterInitialLastLineIndexToParse += numberOfCharsInEachLineInTextarea[lineIndex]
        previousLineDoesNotContainNotRecognizableCommands = false
        break
      } else {
        previousLineDoesNotContainNotRecognizableCommands = true
      }
    }
    if (!previousLineDoesNotContainNotRecognizableCommands) {
      continue
    }
    for (let valueIndex = 0; valueIndex < currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine.length; valueIndex++) {
      if (lastLineIndexToParseAsResult === (numberOfCharsInEachLineInTextarea.length - 1)) {
        return lastLineIndexToParseAsResult
      }
      if (
        (currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine[valueIndex].length <= 1) &&
        informationOnWhetherPreviousLinesReachedProgressionOfMoreThanOneCommand[lineIndex - 1] &&
        previousLineDoesNotContainNotRecognizableCommands
      ) {
        weDontNeedToExploreFurtherLinesBelow = true
        break
      }
      if (currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosInCurrentLine[valueIndex].length > 1) {
        informationOnWhetherPreviousLinesReachedProgressionOfMoreThanOneCommand[lineIndex] = true
      } else {
        informationOnWhetherPreviousLinesReachedProgressionOfMoreThanOneCommand[lineIndex] = false
      }
    }
    if (weDontNeedToExploreFurtherLinesBelow) {
      break
    }
    if (lastLineIndexToParseAsResult === (numberOfCharsInEachLineInTextarea.length - 1)) {
      return lastLineIndexToParseAsResult
    }
    lastLineIndexToParseAsResult += 1
    charIndexFromWhichWeCanCaptureProgressionsAfterInitialLastLineIndexToParse += numberOfCharsInEachLineInTextarea[lineIndex]
  }
  return lastLineIndexToParseAsResult
}

const spanRootOfSpanNode = (spanNode) => {
  while (spanNode.parentNode) {
    if (
      (spanNode.nodeName.toLowerCase() === SPAN) &&
      (spanNode.parentNode.nodeName.toLowerCase() !== SPAN)
    ) {
      return spanNode
    }
    spanNode = spanNode.parentNode
  }
  return spanNode
}

const nodesSplittedInLines = (node, result = [ [] ]) => {
  if (node.nodeType === Node.TEXT_NODE && !node.isAlreadyPushedToItsLine) {
    if (node.parentNode.nodeName.toLowerCase() === SPAN) {
      const spanRootOfSpanNodeParent = spanRootOfSpanNode(node.parentNode)
      if (!spanRootOfSpanNodeParent.isAlreadyPushedToItsLine) {
        result[result.length - 1].push(spanRootOfSpanNodeParent)
        spanRootOfSpanNodeParent.isAlreadyPushedToItsLine = true
      }
    } else {
      if (node.nodeValue === EMPTY_STRING) {
        result[result.length - 1].push(node)
      } else {
        let nextNodeOnNewLine
        for (let charIndex = 0; charIndex < node.nodeValue.length; charIndex++) {
          if (node.nodeValue[charIndex] === NEW_LINE) {
            if (charIndex !== (node.nodeValue.length - 1)) {
              nextNodeOnNewLine = node.splitText(charIndex + 1)
            }
            result[result.length - 1].push(node)
            node.isAlreadyPushedToItsLine = true
            result.push([])
            break
          } else if (charIndex === (node.nodeValue.length - 1)) {
            result[result.length - 1].push(node)
            node.isAlreadyPushedToItsLine = true
          }
        }
        if (nextNodeOnNewLine !== undefined) {
          nodesSplittedInLines(nextNodeOnNewLine, result)
        }
      }
    }
  } else {
    for (let childIndex = 0; childIndex < node.childNodes.length; childIndex++) {
      nodesSplittedInLines(node.childNodes[childIndex], result)
    }
  }
  return result
}

const parentOfNodeClosestToDivUnderneathTextareaTextContainerOrDivUnderneathTextareaTextContainerItSelf = (divUnderneathTextareaTextContainer, node) => {
  while (node.parentNode) {
    if (node.parentNode.isSameNode(divUnderneathTextareaTextContainer)) {
      return node.parentNode
    }
    node = node.parentNode
  }
  return divUnderneathTextareaTextContainer
}

const updateHtmlHighlightsOnCertainLines = (textarea, divUnderneathTextarea, nodesSplittedInLines, firstLineIndex, secondLineIndex, parsedLinesWithHighlights) => {
  const wrapperTemplateReplacement = document.createElement('template')
  wrapperTemplateReplacement.innerHTML = parsedLinesWithHighlights
  const wrapperTemplateReplacementContentNode = document.importNode(wrapperTemplateReplacement.content, true)
  let firstNodeOnFirstLine = nodesSplittedInLines[firstLineIndex] ? nodesSplittedInLines[firstLineIndex][0] : null
  if (firstNodeOnFirstLine) {
    parentOfNodeClosestToDivUnderneathTextareaTextContainerOrDivUnderneathTextareaTextContainerItSelf(
      divUnderneathTextarea.textContainer,
      firstNodeOnFirstLine
    ).insertBefore(
      wrapperTemplateReplacementContentNode,
      firstNodeOnFirstLine
    )
  } else {
    divUnderneathTextarea.textContainer.appendChild(wrapperTemplateReplacementContentNode)
  }
  for (let lineIndex = firstLineIndex; lineIndex <= secondLineIndex; lineIndex++) {
    for (let nodeIndex = 0; nodeIndex < nodesSplittedInLines[lineIndex].length; nodeIndex++) {
      const node = nodesSplittedInLines[lineIndex][nodeIndex]
      if (node.nodeType === Node.TEXT_NODE) {
        node.remove()
      } else {
        node.parentNode.removeChild(node)
      }
    }
  }
  for (let lineIndex = 0; lineIndex < firstLineIndex; lineIndex++) {
    for (let nodeIndex = 0; nodeIndex < nodesSplittedInLines[lineIndex].length; nodeIndex++) {
      const node = nodesSplittedInLines[lineIndex][nodeIndex]
      node.isAlreadyPushedToItsLine = false
    }
  }
  for (let lineIndex = secondLineIndex + 1; lineIndex < nodesSplittedInLines.length; lineIndex++) {
    for (let nodeIndex = 0; nodeIndex < nodesSplittedInLines[lineIndex].length; nodeIndex++) {
      const node = nodesSplittedInLines[lineIndex][nodeIndex]
      node.isAlreadyPushedToItsLine = false
    }
  }
  divUnderneathTextarea.scrollTop = textarea.scrollTop
}

export default (divUnderneathTextarea, textarea, parseWholeTextInTextarea) => {
  const textareaValue = adjustTextareaValueToKeepScrollingAlignedWhenItsValueEndsWithNewline(
    textarea.value
  )
  if (parseWholeTextInTextarea) {
    const textareaValueSplittedInLines = textareaValue.split(NEW_LINE)
    const totalNumberOfLines = textareaValueSplittedInLines.length
    textarea.numberOfLinesInTextarea = totalNumberOfLines
    const parsedTextareaValue = parsedHighlights(textareaValue, [], textarea.supportedFontNames)
    textarea.mapOfCharIndexesWithProgressionOfCommandsFromScenarios = parsedTextareaValue.charIndexes
    refreshDivUnderneathTextareaWithNewHtml(divUnderneathTextarea, parsedTextareaValue.html)
    return
  }

  const textareaValueSplittedInLines = textareaValue.split(NEW_LINE).map((line, index, lines) => {
    if (lines[index + 1] !== undefined) {
      return `${line}${NEW_LINE}`
    }
    return line
  })
  const totalNumberOfLines = textareaValueSplittedInLines.length
  const numberOfLinesInTextareaAddedOrRemoved = totalNumberOfLines - textarea.numberOfLinesInTextarea
  const numberOfCharsInEachLineInTextarea = textareaValueSplittedInLines.map(line => line.length)
  const selectionStartInTextarea = textarea.selectionStart
  const linesBeforeSelectionStartIncludingTheLineWhereSelecetionStartsAt = textarea.value.substr(0, selectionStartInTextarea).split(NEW_LINE)
  const linesBeforeSelectionStart = linesBeforeSelectionStartIncludingTheLineWhereSelecetionStartsAt.slice(0, linesBeforeSelectionStartIncludingTheLineWhereSelecetionStartsAt.length - 1)
  const totalNumberOfLinesBeforeSelectionStart = linesBeforeSelectionStart.length
  const lineIndexWhereCaretIsOn = totalNumberOfLinesBeforeSelectionStart
  const currentMapOfCharIndexesWithProgressionOfCommandsFromScenarios = textarea.mapOfCharIndexesWithProgressionOfCommandsFromScenarios
  const currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios = Object.values(currentMapOfCharIndexesWithProgressionOfCommandsFromScenarios)
  let firstLineIndexToParse = lineIndexWhereCaretIsOn
  const caretOnLineAtTheStart = (linesBeforeSelectionStartIncludingTheLineWhereSelecetionStartsAt[linesBeforeSelectionStartIncludingTheLineWhereSelecetionStartsAt.length - 1] === EMPTY_STRING)
  if (
    (firstLineIndexToParse !== 0) &&
    caretOnLineAtTheStart
  ) {
    firstLineIndexToParse -= 1
  }
  const firstCharIndexInParsedLines = numberOfCharsInEachLineInTextarea.slice(0, firstLineIndexToParse).reduce((numberOfCharsInLines, numberOfCharsInCurrentLine) => numberOfCharsInLines + numberOfCharsInCurrentLine, 0) - 1
  const lastLineIndexToParse = extendedLastLineIndexToParse(lineIndexWhereCaretIsOn, numberOfCharsInEachLineInTextarea, currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios)

  const currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosBeforeFirstCharIndexInParsedLines = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios.slice(0, firstCharIndexInParsedLines + 1)
  let currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosAfterLastCharIndexInParsedLines = []
  if (textareaValueSplittedInLines[lastLineIndexToParse + 1] !== undefined) {
    const linesBelowLastLineToParse = numberOfCharsInEachLineInTextarea.slice(lastLineIndexToParse + 1)
    const numberOfCharsBetweenLastCharInLastLineToParseAndLastCharInLastLineInGeneral = linesBelowLastLineToParse.reduce((numberOfCharsInLines, numberOfCharsInCurrentLine) => numberOfCharsInLines + numberOfCharsInCurrentLine, 0)
    const charIndexFromWhichWeCanCaptureProgressionsAfterLastLineIndexToParse = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios.length - numberOfCharsBetweenLastCharInLastLineToParseAndLastCharInLastLineInGeneral
    currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosAfterLastCharIndexInParsedLines = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenarios.slice(charIndexFromWhichWeCanCaptureProgressionsAfterLastLineIndexToParse)
  }
  const linesToParse = textareaValueSplittedInLines.slice(firstLineIndexToParse, lastLineIndexToParse + 1)
  const joinedLinesToParse = linesToParse.join('')
  const progressionRightBeforeLinesToParse = (currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosBeforeFirstCharIndexInParsedLines[currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosBeforeFirstCharIndexInParsedLines.length - 1] || []).slice()
  const parsedLines = parsedHighlights(
    joinedLinesToParse,
    progressionRightBeforeLinesToParse,
    textarea.supportedFontNames
  )

  const mapOfCharIndexesWithProgressionOfCommandsFromScenariosFromParsedLines = parsedLines.charIndexes
  const mapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosFromParsedLines = Object.values(mapOfCharIndexesWithProgressionOfCommandsFromScenariosFromParsedLines)
  const updatedMapOfCharIndexesWithProgressionOfCommandsFromScenarios = {}
  let valueIndex = 0
  for (let index = 0; index < currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosBeforeFirstCharIndexInParsedLines.length; index++, valueIndex++) {
    updatedMapOfCharIndexesWithProgressionOfCommandsFromScenarios[valueIndex] = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosBeforeFirstCharIndexInParsedLines[index]
  }
  for (let index = 0; index < mapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosFromParsedLines.length; index++, valueIndex++) {
    updatedMapOfCharIndexesWithProgressionOfCommandsFromScenarios[valueIndex] = mapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosFromParsedLines[index]
  }
  for (let index = 0; index < currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosAfterLastCharIndexInParsedLines.length; index++, valueIndex++) {
    updatedMapOfCharIndexesWithProgressionOfCommandsFromScenarios[valueIndex] = currentMapValuesOfCharIndexesWithProgressionOfCommandsFromScenariosAfterLastCharIndexInParsedLines[index]
  }
  textarea.mapOfCharIndexesWithProgressionOfCommandsFromScenarios = updatedMapOfCharIndexesWithProgressionOfCommandsFromScenarios
  const parsedLinesWithHighlights = parsedLines.html

  const nodesSplittedInLinesValue = nodesSplittedInLines(divUnderneathTextarea.textContainer)
  updateHtmlHighlightsOnCertainLines(
    textarea,
    divUnderneathTextarea,
    nodesSplittedInLinesValue,
    firstLineIndexToParse,
    lastLineIndexToParse - numberOfLinesInTextareaAddedOrRemoved,
    parsedLinesWithHighlights
  )

  textarea.numberOfLinesInTextarea = totalNumberOfLines
}
