import createdElementWithStylesAndAttributes from '#msq/editor/createdElementWithStylesAndAttributes.js'
import insertElementBeforeSpecifiedOne from '#msq/editor/insertElementBeforeSpecifiedOne.js'

export default (divUnderneathTextarea) => {
  const createdLineNumbersColumn = createdElementWithStylesAndAttributes(
    'div',
    {
    },
    {
      'data-line-numbers': '',
      /* Decoration: the caret's line is already reported by the textarea. */
      'aria-hidden': 'true'
    }
  )
  insertElementBeforeSpecifiedOne(createdLineNumbersColumn, divUnderneathTextarea)
  return createdLineNumbersColumn
}
