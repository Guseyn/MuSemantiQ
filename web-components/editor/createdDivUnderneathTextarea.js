import createdElementWithStylesAndAttributes from '#msq/editor/createdElementWithStylesAndAttributes.js'
import insertElementBeforeSpecifiedOne from '#msq/editor/insertElementBeforeSpecifiedOne.js'

export default (textarea) => {
  const createdDiv = createdElementWithStylesAndAttributes(
    'div',
    {
    },
    {
      'data-highlights': '',
      'data-no-ehtml': 'true',
      /* A coloured copy of the textarea's own value, purely to look at. */
      'aria-hidden': 'true'
    }
  )
  const textContainer = createdElementWithStylesAndAttributes(
    'div',
    {
    },
    {
      'data-highlights-text': '',
      'data-no-ehtml': 'true'
    }
  )
  createdDiv.appendChild(textContainer)
  createdDiv.textContainer = textContainer
  insertElementBeforeSpecifiedOne(createdDiv, textarea)
  return createdDiv
}
