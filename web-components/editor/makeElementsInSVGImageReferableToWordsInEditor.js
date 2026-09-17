import createdRefRectHoveringRefElement from '#msq/editor/createdRefRectHoveringRefElement.js'
import scoreSvgElement from '#msq/editor/scoreSvgElement.js'
import notifyUserToUpdateSVGImage from '#msq/editor/notifyUserToUpdateSVGImage.js'
const isMacOS = navigator.platform.indexOf('Mac') !== -1

export default (divUnderneathTextarea, textarea, lineNumbersColumn, editTabButton) => {
  const svgPlaceholder = textarea.initialParentElement
  let weAlreadyMadeSVGElementsReferableByCreatingRefRectsHoveringThem = false
  const processNodeWithItsChildNodes = (node) => {
    if (!node.observed) {
      node.observed = true
      const svgElement = scoreSvgElement(svgPlaceholder)
      if ((typeof node.hasAttribute === 'function') && node.hasAttribute('ref-ids')) {
        let refRectHoveringRefElement
        const refRectHoveringRefElementClickEvent = () => {
          editTabButton.click()
          divUnderneathTextarea.style.zIndex = '+2'
          const refIdValues = node.getAttribute('ref-ids').split(',')
          let firstRefIdValue
          let firstSpanWithRefIdInEditor
          for (let refIdIndex = 0; refIdIndex < refIdValues.length; refIdIndex++) {
            firstRefIdValue = refIdValues[refIdIndex]
            firstSpanWithRefIdInEditor = divUnderneathTextarea.querySelector(`[ref-id="${firstRefIdValue}"]`)
            if (firstSpanWithRefIdInEditor) {
              break
            }
          }
          if (firstSpanWithRefIdInEditor) {
            // firstSpanWithRefIdInEditor.scrollIntoView({ block: 'center', inline: 'center' })
            textarea.scrollTop = divUnderneathTextarea.scrollTop
            textarea.scrollLeft = divUnderneathTextarea.scrollLeft
            lineNumbersColumn.scrollTop = divUnderneathTextarea.scrollTop
            lineNumbersColumn.scrollLeft = divUnderneathTextarea.scrollLeft
            for (let refIdIndex = 0; refIdIndex < refIdValues.length; refIdIndex++) {
              const spansWithRefIdInEditor = divUnderneathTextarea.querySelectorAll(`[ref-id="${refIdValues[refIdIndex]}"]`)
              for (let spanIndex = 0; spanIndex < spansWithRefIdInEditor.length; spanIndex++) {
                const spanWithRefIdInEditor = spansWithRefIdInEditor[spanIndex]
                refRectHoveringRefElement.classList.remove('ref-rect-hover-no-animated')
                refRectHoveringRefElement.classList.add('ref-rect-hover-not-visible')
                if (spanWithRefIdInEditor.classList.contains('ref-span-background')) {
                  spanWithRefIdInEditor.classList.remove('ref-span-background')
                  void spanWithRefIdInEditor.offsetWidth // invoking reflow
                  spanWithRefIdInEditor.classList.add('ref-span-background')
                } else {
                  spanWithRefIdInEditor.classList.add('ref-span-background')
                }
                setTimeout(() => {
                  spanWithRefIdInEditor.classList.remove('ref-span-background')
                }, 2800)
              }
            }
          } else {
            notifyUserToUpdateSVGImage(svgPlaceholder)
          }
          svgElement.removeChild(refRectHoveringRefElement)
          refRectHoveringRefElement = undefined
          weAlreadyMadeSVGElementsReferableByCreatingRefRectsHoveringThem = false
        }
        const makeSVGElementsReferableByCreatingRefRectsHoveringThem = (event) => {
          if ((isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey)) {
            if (!svgElement) {
              return
            }
            if (!weAlreadyMadeSVGElementsReferableByCreatingRefRectsHoveringThem) {
              const refIdValues = node.getAttribute('ref-ids').split(',')
              let firstRefIdValue
              let firstSpanWithRefIdInEditor
              for (let refIdIndex = 0; refIdIndex < refIdValues.length; refIdIndex++) {
                firstRefIdValue = refIdValues[refIdIndex]
                firstSpanWithRefIdInEditor = divUnderneathTextarea.querySelector(`[ref-id="${firstRefIdValue}"]`)
                if (firstSpanWithRefIdInEditor) {
                  break
                }
              }
              if (firstSpanWithRefIdInEditor) {
                weAlreadyMadeSVGElementsReferableByCreatingRefRectsHoveringThem = true
                refRectHoveringRefElement = createdRefRectHoveringRefElement(node, svgElement, 'ref-rect-hover-no-animated')
                svgElement.appendChild(refRectHoveringRefElement)
                refRectHoveringRefElement.addEventListener('click', refRectHoveringRefElementClickEvent)
                textarea.blur()
                const removeRefRectHoveringElement = () => {
                  if (refRectHoveringRefElement) {
                    refRectHoveringRefElement.removeEventListener('click', refRectHoveringRefElementClickEvent)
                    svgElement.removeChild(refRectHoveringRefElement)
                    refRectHoveringRefElement = undefined
                    weAlreadyMadeSVGElementsReferableByCreatingRefRectsHoveringThem = false
                    window.removeEventListener('keyup', removeRefRectHoveringElement)
                  }
                }
                refRectHoveringRefElement.addEventListener('mouseleave', removeRefRectHoveringElement)
                window.addEventListener('keyup', removeRefRectHoveringElement)
                event.stopPropagation()
              }
            }
          }
        }
        node.addEventListener('mouseover', makeSVGElementsReferableByCreatingRefRectsHoveringThem)
        node.addEventListener('mousemove', makeSVGElementsReferableByCreatingRefRectsHoveringThem)
      }
      const childNodes = node.childNodes
      for (let childNoteIndex = 0; childNoteIndex < childNodes.length; childNoteIndex++) {
        processNodeWithItsChildNodes(childNodes[childNoteIndex])
      }
    }
  }
  const observer = new MutationObserver(
    (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i]
            if (node.tagName === 'svg') {
              processNodeWithItsChildNodes(node)
            }
          }
        }
      }
    }
  )
  // Scoped to the score container: the toolbar's icons are <svg> too, and the
  // errors panel and player come and go in the shadow root.
  observer.observe(
    svgPlaceholder.shadowRoot.querySelector('[data-svg-container]'),
    { childList: true, subtree: true }
  )

  // On first render the score is mounted before the editor is initialised, so
  // the observer never sees it. Pick up whatever is already there.
  const alreadyRenderedSvg = scoreSvgElement(svgPlaceholder)
  if (alreadyRenderedSvg) {
    processNodeWithItsChildNodes(alreadyRenderedSvg)
  }
  window.addEventListener('keydown', (event) => {
    if ((isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey)) {
      // Both of these live inside our shadow root, so neither document nor the
      // host's (empty) light DOM can reach them.
      const refRectHoveringRefElementCreatedByClickingOnWordInEditor =
        svgPlaceholder.shadowRoot.querySelector('#ref-rect-hover-from-editor')
      if (refRectHoveringRefElementCreatedByClickingOnWordInEditor) {
        const svgElement = scoreSvgElement(svgPlaceholder)
        if (svgElement) {
          svgElement.removeChild(refRectHoveringRefElementCreatedByClickingOnWordInEditor)
        }
      }
    }
  })
}
