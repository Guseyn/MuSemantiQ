/*
What the shell's templates read. docs.html renders the sidebar and the page
with EHTML, and its ${...} expressions see globals, so the sitemap and the page
the URL names are put there. This has to run before '#ehtml/main' activates the
body, which is why docs.html imports it right before.

There is no router: every link is a page load, and every /docs/... URL is this
same shell (see docs/web-app/worker.js).
*/

import { sitemap, pageByPath } from '#docs/sitemap.js'

const currentPage = pageByPath(window.location.pathname)

window.sitemap = sitemap
// null when the URL names no page; the shell says so instead of the page
window.currentPage = currentPage

if (currentPage) {
  document.title = `${currentPage.title} — MuSemantiQ docs`
  /*
  /docs on its own is the first page of the sitemap. It is given a real URL so
  that reloading, or sharing what is on screen, names the page being read.
  */
  if (window.location.pathname !== currentPage.url) {
    window.history.replaceState({}, '', currentPage.url + window.location.search + window.location.hash)
  }
} else {
  document.title = 'No such page — MuSemantiQ docs'
}
