/**
 * The font used to measure caret offsets on a canvas has to be the font the
 * textarea is actually rendering with, so read all of it from computed style
 * rather than trusting a name passed in from somewhere else.
 */
export default (textarea) => {
  const textareaComputedStyle = window.getComputedStyle(textarea)
  const fontWeight = textareaComputedStyle.getPropertyValue('font-weight') || 'normal'
  const fontSize = textareaComputedStyle.getPropertyValue('font-size') || '16px'
  const fontFamily = textareaComputedStyle.getPropertyValue('font-family') || 'monospace'
  return `${fontWeight} ${fontSize} ${fontFamily}`
}
