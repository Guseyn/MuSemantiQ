/*
<nav is="docs-contents"></nav>

A page's contents, written in its markdown where the list should appear, and
filled in from the page's own headings, so the list cannot drift from them.
Every h2 is an entry and every h3 an entry under the h2 before it.

e-markdown sets its innerHTML in one go, so by the time this connects every
heading is already beside it. It then moves its children out of itself, which
disconnects this and connects it again, so the list is built from scratch on
every connect rather than added to.

Showdown gives every heading an id (github flavour makes them the slug of the
text); one written as raw HTML without an id gets one here, so it can be linked.
*/
class DocsContents extends HTMLElement {
  connectedCallback() {
    const headings = this.parentElement.querySelectorAll('h2, h3')
    const list = document.createElement('ol')
    let lastSubList = null
    for (const heading of headings) {
      if (!heading.id) {
        heading.id = heading.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-')
      }
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = `#${heading.id}`
      link.textContent = heading.textContent
      item.appendChild(link)
      if (heading.tagName === 'H3' && lastSubList !== null) {
        lastSubList.appendChild(item)
        continue
      }
      list.appendChild(item)
      if (heading.tagName === 'H2') {
        lastSubList = document.createElement('ol')
        item.appendChild(lastSubList)
      }
    }
    // A sub-list nobody filled is left out, so it adds no empty space.
    list.querySelectorAll('ol:empty').forEach((empty) => empty.remove())
    this.setAttribute('aria-label', 'Contents')
    this.replaceChildren(list)
    this.hidden = headings.length === 0
  }
}

customElements.define('docs-contents', DocsContents, { extends: 'nav' })
