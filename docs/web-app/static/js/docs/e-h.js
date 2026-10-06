/*
The share link in front of every heading below a page's title, which
e-heading-extension.js writes into the markup. A click copies the address of
the heading, so a section, or an entry of a reference, can be sent to someone
as it is, and puts that address in the bar too, without scrolling.

The links come and go with every page the markdown renders, so this listens
once, for the whole document, as copy-code.js does for code blocks.

The check mark is Google's Material Symbols check (Apache License 2.0).
*/
import { shareIcon } from '#docs/e-heading-extension.js'

const checkIcon = '<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z"/></svg>'

// How long the check mark stays after a copy, in milliseconds
const COPIED_FOR = 1500

document.addEventListener('click', async (event) => {
  const link = event.target.closest('[is="e-h"] > a[data-share]')
  if (!link) {
    return
  }
  event.preventDefault()
  const id = link.parentElement.id
  // replaceState, not location.hash: the page should not jump, and no hashchange should fire
  window.history.replaceState(null, '', `#${id}`)
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`)
  } catch {
    // No clipboard (an insecure origin, a denied permission): the address bar has it now
    return
  }
  link.innerHTML = checkIcon
  link.setAttribute('data-copied', 'true')
  setTimeout(() => {
    link.innerHTML = shareIcon
    link.removeAttribute('data-copied')
  }, COPIED_FOR)
})
