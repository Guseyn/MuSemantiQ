export default (refElementInSVGPlaceholder, svgElement, className, id) => {
  const refElementLeft = refElementInSVGPlaceholder.getAttribute('data-left') * 1
  const refElementRight = refElementInSVGPlaceholder.getAttribute('data-right') * 1
  const refElementTop = refElementInSVGPlaceholder.getAttribute('data-top') * 1
  const refElementBottom = refElementInSVGPlaceholder.getAttribute('data-bottom') * 1
  const refRectHoveringRefElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  const refRectHoveringRefElementWidth = refElementRight - refElementLeft
  const refRectHoveringRefElementHeight = refElementBottom - refElementTop
  const pageElement = svgElement.querySelector('[data-name="page"]')
  const intervalBetweenStaveLines = pageElement.getAttribute('data-interval-between-stave-lines')
  const refRectPadding = 1 * intervalBetweenStaveLines
  const refRectStrokeWidth = 0.08 * intervalBetweenStaveLines
  const refRectStrokeColor = pageElement.getAttribute('data-font-color')
  refRectHoveringRefElement.setAttribute('class', className)
  if (id) {
    refRectHoveringRefElement.setAttribute('id', id)
  }
  refRectHoveringRefElement.setAttribute('width', refRectHoveringRefElementWidth + 2 * refRectPadding)
  refRectHoveringRefElement.setAttribute('height', refRectHoveringRefElementHeight + 2 * refRectPadding)
  refRectHoveringRefElement.setAttribute('transform', `translate(${refElementLeft - refRectPadding}, ${refElementTop - refRectPadding})`)
  // fill comes from --navigation-highlight-color in css/editor.js
  refRectHoveringRefElement.setAttribute('stroke', refRectStrokeColor)
  refRectHoveringRefElement.setAttribute('stroke-width', refRectStrokeWidth)
  refRectHoveringRefElement.setAttribute('stroke-linejoin', 'round')
  refRectHoveringRefElement.setAttribute('stroke-linecap', 'round')
  return refRectHoveringRefElement
}
