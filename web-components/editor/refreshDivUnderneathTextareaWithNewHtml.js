export default (divUnderneathTextarea, html) => {
  const oldTextContainer = divUnderneathTextarea.textContainer
  const newTextContainer = divUnderneathTextarea.textContainer.cloneNode(false)

  /*
    With the highlighting switched off the layer still has to hold the same
    characters — it sits exactly under the textarea, and the two only line up
    while they agree character for character. So the colouring is dropped by
    taking the text out of the markup rather than by writing something else.
  */
  if (divUnderneathTextarea.highlightingIsOff) {
    const withoutColours = document.createElement('template')
    withoutColours.innerHTML = html
    newTextContainer.textContent = withoutColours.content.textContent
  } else {
    newTextContainer.innerHTML = html
  }

  oldTextContainer.parentNode.replaceChild(newTextContainer, oldTextContainer)
  divUnderneathTextarea.textContainer = newTextContainer
  // The nodes of the old layer are gone, and so are the lists of which of them
  // sat on which line.
  divUnderneathTextarea.nodesSplitInLines = null
  /*
    One whole layer in place of another, which is what the typing path never
    does: the first paint of an editor, a re-render and a change of settings all
    come through here. The rendered highlights do too, and they are the only ones
    that carry the ref-ids the Cmd/Ctrl-click navigation matches against the
    score. So the rebuild is counted, and a colours job still waiting for its
    frame reads the count before it paints anything over whoever put this here.
  */
  divUnderneathTextarea.wholeLayerRebuilds = (divUnderneathTextarea.wholeLayerRebuilds || 0) + 1
}
