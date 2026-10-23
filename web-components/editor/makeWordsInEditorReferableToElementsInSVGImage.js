import createdRefRectHoveringRefElement from '#msq/web-components/editor/createdRefRectHoveringRefElement.js'
import scoreSvgElement from '#msq/web-components/editor/scoreSvgElement.js'
import notifyUserToUpdateSVGImage from '#msq/web-components/editor/notifyUserToUpdateSVGImage.js'
import showHintMessage from '#msq/web-components/editor/showHintMessage.js'
import theCommandKeyIsHeld from '#msq/web-components/editor/theCommandKeyIsHeld.js'


const showHintMessageThatThePreviewIsOutOfDate = (textarea) => {
  showHintMessage(
    textarea.initialParentElement,
    'You have to re-render the preview to match the changes in the text to be able to navigate.'
  )
}

export default (divUnderneathTextarea, textarea, renderPreviewTabButton) => {
  const svgPlaceholder = textarea.initialParentElement
  const refClickEventInEditor = (event) => {
    // The score refers only to the words it was last rendered from: navigating
    // from words changed since then would point at the wrong place or nothing.
    if (!textarea.isRenderedWithLatestInputText) {
      showHintMessageThatThePreviewIsOutOfDate(textarea)
      return
    }
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
  // A word the current render does not cover has no ref-id, so the per-span
  // listener above never reaches it. A Cmd/Ctrl-click on it still wants to
  // navigate, so it is answered the same way as a stale word that kept its
  // ref-id: say the preview has to be re-rendered first.
  divUnderneathTextarea.addEventListener('click', (event) => {
    if (!theCommandKeyIsHeld(event) || event.target.tagName.toLowerCase() !== 'span') {
      return
    }
    if (!textarea.isRenderedWithLatestInputText && !event.target.hasAttribute('ref-id')) {
      showHintMessageThatThePreviewIsOutOfDate(textarea)
    }
  })
}
