/*
  Where a line really is, measured rather than multiplied.

  The computed line-height is not always the pitch the lines are laid out at.
  WebKit, which is what the desktop app runs in, sets lines at a whole number of
  pixels: a line-height of 1.4em at 13px reads back as 18.2px but is drawn at 18.
  Multiplied by the line number that error grows down the text, so far enough
  down a caret put from it lands beside the line it belongs to.

  So the lines up to the one asked for are laid out in a hidden block with the
  same font and line-height, and its height says where the line ends. The block
  is kept on the textarea and reused, so asking again is cheap.
*/
export default (textarea, lineNumber) => {
  let probe = textarea.lineOffsetProbe
  if (!probe) {
    probe = document.createElement('div')
    probe.setAttribute('aria-hidden', 'true')
    Object.assign(probe.style, {
      position: 'fixed',
      top: '0',
      left: '-10000px',
      visibility: 'hidden',
      pointerEvents: 'none',
      whiteSpace: 'pre',
      margin: '0',
      padding: '0',
      border: 'none'
    })
    textarea.getRootNode().appendChild(probe)
    textarea.lineOffsetProbe = probe
  }
  // Longhands rather than `font`: WebKit can read the shorthand back empty.
  const textareaComputedStyle = window.getComputedStyle(textarea)
  for (const property of [ 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight' ]) {
    probe.style[property] = textareaComputedStyle[property]
  }
  probe.textContent = 'x\n'.repeat(lineNumber) + 'x'
  const bottom = probe.getBoundingClientRect().height
  return { top: bottom * lineNumber / (lineNumber + 1), bottom }
}
