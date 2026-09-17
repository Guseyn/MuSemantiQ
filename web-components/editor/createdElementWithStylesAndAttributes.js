export default (tagName, styles, attributes) => {
  const element = document.createElement(tagName)
  if (styles) {
    for (const [ styleKey, styleValue ] of Object.entries(styles)) {
      element.style[styleKey] = styleValue
    }
  }
  if (attributes) {
    for (const [ attributeKey, attributeValue ] of Object.entries(attributes)) {
      element.setAttribute(attributeKey, attributeValue)
    }
  }
  return element
}
