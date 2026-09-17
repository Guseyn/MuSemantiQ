export default (newElement, specifiedElement) => {
  specifiedElement.parentNode.insertBefore(newElement, specifiedElement)
}
