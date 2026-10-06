/*
Every <pre> offers to copy itself. The "copy" link is the block's own ::before
(see docs.css and landing.css), so neither the markdown nor the page has to
add anything to a code block for it to have one.

A pseudo-element cannot have a listener, but a click on it is a click on its
<pre>. So this listens once, for the whole document, and asks whether the
click landed inside the ::before's box. That box is absolutely positioned
against the <pre>'s padding box, at the top and right it is given, so it can
be worked out from its computed style; the stylesheets give it
box-sizing: border-box, so its computed width and height are the whole of it.

The copying is the textarea trick: the text goes into a textarea nobody sees,
which is selected and copied with execCommand. It works on plain http, where
navigator.clipboard is not available, and on every browser the page supports.
*/

const COPIED_FOR = 1500

function clickIsOnTheLink(pre, event) {
  const link = window.getComputedStyle(pre, '::before')
  if (link.content === 'none' || link.display === 'none') {
    return false
  }
  const box = pre.getBoundingClientRect()
  const style = window.getComputedStyle(pre)
  const right = box.right - parseFloat(style.borderRightWidth) - parseFloat(link.right)
  const left = right - parseFloat(link.width)
  const top = box.top + parseFloat(style.borderTopWidth) + parseFloat(link.top)
  const bottom = top + parseFloat(link.height)
  return event.clientX >= left && event.clientX <= right &&
    event.clientY >= top && event.clientY <= bottom
}

function copyText(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } finally {
    textarea.remove()
  }
  return copied
}

document.addEventListener('click', (event) => {
  const pre = event.target.closest && event.target.closest('pre')
  if (!pre || event.target !== pre || !clickIsOnTheLink(pre, event)) {
    return
  }
  if (!copyText(pre.textContent)) {
    return
  }
  // The stylesheets turn "copy" into "copied" for a moment.
  pre.setAttribute('data-copied', 'true')
  clearTimeout(pre.copiedTimer)
  pre.copiedTimer = setTimeout(() => pre.removeAttribute('data-copied'), COPIED_FOR)
})
