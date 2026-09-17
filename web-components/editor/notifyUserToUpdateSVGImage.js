import showHintMessage from '#msq/editor/showHintMessage.js'

export default (svgPlaceholder) => {
  showHintMessage(
    svgPlaceholder,
    'No references were found — re-render the preview first.'
  )
}
