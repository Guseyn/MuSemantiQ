import createdElementWithStylesAndAttributes from '#msq/web-components/editor/createdElementWithStylesAndAttributes.js'
import insertElementBeforeSpecifiedOne from '#msq/web-components/editor/insertElementBeforeSpecifiedOne.js'

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
