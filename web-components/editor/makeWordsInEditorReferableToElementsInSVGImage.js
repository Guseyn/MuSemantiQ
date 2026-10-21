import createdRefRectHoveringRefElement from '#msq/web-components/editor/createdRefRectHoveringRefElement.js'
import scoreSvgElement from '#msq/web-components/editor/scoreSvgElement.js'
import notifyUserToUpdateSVGImage from '#msq/web-components/editor/notifyUserToUpdateSVGImage.js'
import theCommandKeyIsHeld from '#msq/web-components/editor/theCommandKeyIsHeld.js'


export default (divUnderneathTextarea, textarea, renderPreviewTabButton) => {
  const svgPlaceholder = textarea.initialParentElement
  const refClickEventInEditor = (event) => {
    if (event.target.hasAttribute('ref-id')) {
      event.target.style.textDecoration = 'none'
      textarea.refSpanThatHovered = undefined
      const refIdValue = event.target.getAttribute('ref-id')
      const allRefElementsInSvgPlaceholder = svgPlaceholder.shadowRoot.querySelectorAll('[data-svg-container] [ref-ids]')
      const refElementsInSvgPlaceholderWithSpecifiedRefId = []
      for (let refElementIndex = 0; refElementIndex < allRefElementsInSvgPlaceholder.length; refElementIndex++) {
        const refIdsOfRefElement = allRefElementsInSvgPlaceholder[refElementIndex].getAttribute('ref-ids').split(',')
        if (refIdsOfRefElement.indexOf(refIdValue) !== -1) {
          refElementsInSvgPlaceholderWithSpecifiedRefId.push(
            allRefElementsInSvgPlaceholder[refElementIndex]
          )
        }
      }
      const firstRefElementInSvgPlaceholder = refElementsInSvgPlaceholderWithSpecifiedRefId[0]
      if (firstRefElementInSvgPlaceholder) {
        renderPreviewTabButton.click()
        const svgElement = scoreSvgElement(svgPlaceholder)
        if (!svgElement) {
          return
        }
        for (let refElementIndex = 0; refElementIndex < refElementsInSvgPlaceholderWithSpecifiedRefId.length; refElementIndex++) {
          const refElementInSVGPlaceholder = refElementsInSvgPlaceholderWithSpecifiedRefId[refElementIndex]
          const refRectHoveringRefElement = createdRefRectHoveringRefElement(refElementInSVGPlaceholder, svgElement, 'ref-rect-hover', 'ref-rect-hover-from-editor')
          svgElement.appendChild(refRectHoveringRefElement)
          // The score view opens after the tab switch settles, so scroll on the
          // next frame; 'nearest' only scrolls when the mark is out of view.
          requestAnimationFrame(() => {
            refRectHoveringRefElement.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          })
          setTimeout(() => {
            if (svgElement.contains(refRectHoveringRefElement)) {
              svgElement.removeChild(refRectHoveringRefElement)
            }
          }, 2500)
        }
      } else {
        notifyUserToUpdateSVGImage(svgPlaceholder)
        textarea.blur()
      }
    }
  }
  let eventsWereAttachedToDivUnderneathTextarea = false
  divUnderneathTextarea.addEventListener('mousemove', (event) => {
    if (theCommandKeyIsHeld(event)) {
      if (textarea.selectionStart === textarea.selectionEnd) {
        divUnderneathTextarea.style.zIndex = '2'
        if (event.target.hasAttribute('ref-id')) {
          event.target.addEventListener('click', refClickEventInEditor)
          if (textarea.refSpanThatHovered) {
            textarea.refSpanThatHovered.style.textDecoration = 'none'
            textarea.refSpanThatHovered = event.target
            textarea.refSpanThatHovered.style.textDecoration = 'underline'
          } else {
            textarea.refSpanThatHovered = event.target
            textarea.refSpanThatHovered.style.textDecoration = 'underline'
          }
          eventsWereAttachedToDivUnderneathTextarea = true
        } else {
          if (textarea.refSpanThatHovered) {
            if (eventsWereAttachedToDivUnderneathTextarea) {
              textarea.refSpanThatHovered.removeEventListener('click', refClickEventInEditor)
              eventsWereAttachedToDivUnderneathTextarea = false
            }
            textarea.refSpanThatHovered.style.textDecoration = 'none'
            textarea.refSpanThatHovered = undefined
          }
        }
      } else {
        divUnderneathTextarea.style.zIndex = '0'
        divUnderneathTextarea.removeEventListener('click', refClickEventInEditor)
        eventsWereAttachedToDivUnderneathTextarea = false
      }
    } else {
      divUnderneathTextarea.style.zIndex = '0'
      divUnderneathTextarea.removeEventListener('click', refClickEventInEditor)
      eventsWereAttachedToDivUnderneathTextarea = false
    }
  })
  window.addEventListener('keydown', (event) => {
    if (theCommandKeyIsHeld(event)) {
      if (textarea.selectionStart === textarea.selectionEnd) {
        divUnderneathTextarea.style.zIndex = '2'
      } else {
        divUnderneathTextarea.style.zIndex = '0'
        if (textarea.refSpanThatHovered) {
          if (eventsWereAttachedToDivUnderneathTextarea) {
            textarea.refSpanThatHovered.removeEventListener('click', refClickEventInEditor)
            eventsWereAttachedToDivUnderneathTextarea = false
          }
          textarea.refSpanThatHovered.style.textDecoration = 'none'
          textarea.refSpanThatHovered = undefined
        }
      }
    } else {
      divUnderneathTextarea.style.zIndex = '0'
      if (textarea.refSpanThatHovered) {
        if (eventsWereAttachedToDivUnderneathTextarea) {
          textarea.refSpanThatHovered.removeEventListener('click', refClickEventInEditor)
          eventsWereAttachedToDivUnderneathTextarea = false
        }
        textarea.refSpanThatHovered.style.textDecoration = 'none'
        textarea.refSpanThatHovered = undefined
      }
    }
  })
  window.addEventListener('keyup', () => {
    divUnderneathTextarea.style.zIndex = '0'
    if (textarea.refSpanThatHovered) {
      if (eventsWereAttachedToDivUnderneathTextarea) {
        textarea.refSpanThatHovered.removeEventListener('click', refClickEventInEditor)
        eventsWereAttachedToDivUnderneathTextarea = false
      }
      textarea.refSpanThatHovered.style.textDecoration = 'none'
      textarea.refSpanThatHovered = undefined
    }
  })
}
