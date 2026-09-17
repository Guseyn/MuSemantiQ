import createdDivUnderneathTextarea from '#msq/editor/createdDivUnderneathTextarea.js'
import createdLineNumbersColumn from '#msq/editor/createdLineNumbersColumn.js'
import createdAutocompleteListView from '#msq/editor/createdAutocompleteListView.js'

import synchronizeScrollOfDivUnderneathTextareaAndLineNumbersColumnByScrollChangeOfTextarea from '#msq/editor/synchronizeScrollOfDivUnderneathTextareaAndLineNumbersColumnByScrollChangeOfTextarea.js'
import scrollToStartOfLineInTextareaWhenEnterIsPressed from '#msq/editor/scrollToStartOfLineInTextareaWhenEnterIsPressed.js'
import scrollToBottomOfTextareaWhenEnterIsPressedAtTheBottomOfTextarea from '#msq/editor/scrollToBottomOfTextareaWhenEnterIsPressedAtTheBottomOfTextarea.js'
import makeScrollToFollowCaretInTextareaIfItIsDisappearedFromView from '#msq/editor/makeScrollToFollowCaretInTextareaIfItIsDisappearedFromView.js'
import detectingThatWeAreTypingInTextarea from '#msq/editor/detectingThatWeAreTypingInTextarea.js'
import makeDivUnderneathTextareaChangeItsTextValueWhenValueOfTextareaChanges from '#msq/editor/makeDivUnderneathTextareaChangeItsTextValueWhenValueOfTextareaChanges.js'
import makeFontVisibleInTextareaWhenItsValueIsEmptySoThatWeCanSeePlaceholderInItInAllBrowsers from '#msq/editor/makeFontVisibleInTextareaWhenItsValueIsEmptySoThatWeCanSeePlaceholderInItInAllBrowsers.js'
import highlightTextareaValueInDivUnderneathItWithoutRefIds from '#msq/editor/highlightTextareaValueInDivUnderneathItWithoutRefIds.js'
import fillLineNumbersColumnWhenTextareaChangesItsInput from '#msq/editor/fillLineNumbersColumnWhenTextareaChangesItsInput.js'
import fillLineNumbersColumn from '#msq/editor/fillLineNumbersColumn.js'
import highlightLineNumberWhenCaretIsOnIt from '#msq/editor/highlightLineNumberWhenCaretIsOnIt.js'
import showAutocompleteListViewOnTypingIfNeeded from '#msq/editor/showAutocompleteListViewOnTypingIfNeeded.js'
import makeWordsInEditorReferableToElementsInSVGImage from '#msq/editor/makeWordsInEditorReferableToElementsInSVGImage.js'
import makeElementsInSVGImageReferableToWordsInEditor from '#msq/editor/makeElementsInSVGImageReferableToWordsInEditor.js'
import adjustUnitexareaForUserScreen from '#msq/editor/adjustUnitexareaForUserScreen.js'

/**
 * Builds the text view inside an already-existing shadow root.
 *
 * Everything the modules need is hung off the textarea rather than kept on
 * `window` the way the original did, so two editors on the same page no longer
 * clobber each other's parse state.
 *
 * @param {Element} shadowHost      the element whose shadowRoot holds both views
 * @param {Element} container       div[data-text-container]
 * @param {string}  inputText       initial MSQ source
 * @param {Object}  supportedFontNames  from msq/utils/fontNames.js; without it the
 *                                      parser cannot highlight `music font is …`
 * @param {Element} previewButton   switches to the svg+midi view
 * @param {Element} readButton      switches to the text view
 */
export default function initializeEditor({
  shadowHost,
  container,
  inputText,
  supportedFontNames,
  previewButton,
  readButton
}) {
  const textarea = document.createElement('textarea')
  textarea.value = inputText
  textarea.setAttribute('data-msq-input', '')
  textarea.setAttribute('wrap', 'off')
  textarea.setAttribute('autocomplete', 'off')
  textarea.setAttribute('spellcheck', 'false')
  textarea.setAttribute('placeholder', 'Type here...')
  // The highlight layer underneath is aria-hidden, so this is the only
  // accessible name the text view has.
  textarea.setAttribute('aria-label', 'MuSemantiQ source')

  // The modules reach the rendered SVG through `initialParentElement.shadowRoot`.
  textarea.initialParentElement = shadowHost
  textarea.supportedFontNames = supportedFontNames

  container.appendChild(textarea)

  const divUnderneathTextarea = createdDivUnderneathTextarea(textarea)
  const lineNumbersColumn = createdLineNumbersColumn(divUnderneathTextarea)
  const autocompleteListView = createdAutocompleteListView(textarea)

  synchronizeScrollOfDivUnderneathTextareaAndLineNumbersColumnByScrollChangeOfTextarea(
    divUnderneathTextarea, lineNumbersColumn, textarea
  )
  scrollToStartOfLineInTextareaWhenEnterIsPressed(textarea)
  scrollToBottomOfTextareaWhenEnterIsPressedAtTheBottomOfTextarea(textarea)
  makeScrollToFollowCaretInTextareaIfItIsDisappearedFromView(textarea)
  detectingThatWeAreTypingInTextarea(textarea)
  makeDivUnderneathTextareaChangeItsTextValueWhenValueOfTextareaChanges(divUnderneathTextarea, textarea)
  makeFontVisibleInTextareaWhenItsValueIsEmptySoThatWeCanSeePlaceholderInItInAllBrowsers(textarea)
  highlightTextareaValueInDivUnderneathItWithoutRefIds(divUnderneathTextarea, textarea, true)
  fillLineNumbersColumnWhenTextareaChangesItsInput(lineNumbersColumn, textarea, divUnderneathTextarea)
  fillLineNumbersColumn(lineNumbersColumn, textarea, divUnderneathTextarea)
  highlightLineNumberWhenCaretIsOnIt(shadowHost.shadowRoot, textarea, lineNumbersColumn)
  showAutocompleteListViewOnTypingIfNeeded(autocompleteListView, textarea, divUnderneathTextarea)
  makeWordsInEditorReferableToElementsInSVGImage(divUnderneathTextarea, textarea, previewButton)
  makeElementsInSVGImageReferableToWordsInEditor(divUnderneathTextarea, textarea, lineNumbersColumn, readButton)

  const onResize = () => {
    adjustUnitexareaForUserScreen(textarea, divUnderneathTextarea, lineNumbersColumn)
  }
  window.addEventListener('resize', onResize)

  return {
    textarea,
    divUnderneathTextarea,
    lineNumbersColumn,
    autocompleteListView,
    adjustForScreen: onResize
  }
}
