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
}
