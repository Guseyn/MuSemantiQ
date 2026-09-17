export default (divUnderneathTextarea, html) => {
  const oldTextContainer = divUnderneathTextarea.textContainer
  const newTextContainer = divUnderneathTextarea.textContainer.cloneNode(false)
  newTextContainer.innerHTML = html
  oldTextContainer.parentNode.replaceChild(newTextContainer, oldTextContainer)
  divUnderneathTextarea.textContainer = newTextContainer
}
