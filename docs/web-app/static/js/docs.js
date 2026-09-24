/*
The documentation shell: a sidebar built from the sitemap, and a router that
swaps the page under it.

Three things here are forced by the parts this is built on, and each is noted
where it happens:

  - the fonts are registered once, for the life of the page, and every example
    inserted afterwards finds them by name;
  - e-markdown and the msq elements are one-shot — each replaces itself with
    what it rendered — so navigating builds new ones rather than reusing any;
  - EHTML has no router, so this is one.
*/

import { sitemap, allPages, pageByPath } from '/js/sitemap.js'

const FONT_SOURCES = 'msqFontSources'
const FONT_CONFIG = '/js/font-config.json'

const content = () => document.querySelector('[data-content]')

// ── Fonts ────────────────────────────────────────────────────────────────

let fontsAreReady = null

/*
Registering the same reference twice is an error the worker raises, and because
the component renders asynchronously it would surface as an unhandled rejection
rather than anything a reader could act on. So this runs once and every caller
awaits the same promise.

Readiness has to be observed rather than awaited: msq-font-loader exposes no
event and no promise, and it replaces itself with a *copy* of its content — so
a node handed to it is not the node that lands in the document. A marker found
by attribute is what the dev tools do, and it is the only thing that works.
*/
function readyTheFonts() {
  if (fontsAreReady) {
    return fontsAreReady
  }
  fontsAreReady = (async () => {
    const response = await fetch(FONT_CONFIG)
    if (!response.ok) {
      throw new Error(`the font config could not be loaded (${response.status})`)
    }
    const config = await response.json()

    const host = document.querySelector('[data-fonts]')
    const loader = document.createElement('template', { is: 'msq-font-loader' })
    loader.setAttribute('data-font-sources-reference', FONT_SOURCES)
    loader.setAttribute('data-font-config', JSON.stringify(config))

    const marker = document.createElement('div')
    marker.setAttribute('data-fonts-ready', '')
    loader.content.appendChild(marker)
    host.replaceChildren(loader)

    await new Promise((resolve) => {
      if (host.querySelector('[data-fonts-ready]')) {
        resolve()
        return
      }
      new MutationObserver((records, observer) => {
        if (host.querySelector('[data-fonts-ready]')) {
          observer.disconnect()
          resolve()
        }
      }).observe(host, { childList: true, subtree: true })
    })
  })()
  return fontsAreReady
}

// ── The sidebar ──────────────────────────────────────────────────────────

function buildSidebar() {
  const nav = document.querySelector('e-sidebar nav')
  const fragment = document.createDocumentFragment()

  for (const section of sitemap) {
    const heading = document.createElement('span')
    heading.setAttribute('data-section', '')
    heading.textContent = section.title
    fragment.appendChild(heading)

    for (const page of section.pages) {
      if (page.group) {
        const group = document.createElement('span')
        group.setAttribute('data-group', '')
        group.textContent = page.group
        fragment.appendChild(group)
      }
      const link = document.createElement('a')
      link.href = `/docs/${section.slug}/${page.slug}`
      link.setAttribute('data-page', `${section.slug}/${page.slug}`)
      const label = document.createElement('span')
      label.textContent = page.title
      link.appendChild(label)
      fragment.appendChild(link)
    }
  }

  nav.replaceChildren(fragment)
}

function markCurrent(page) {
  for (const link of document.querySelectorAll('e-sidebar nav a')) {
    if (link.getAttribute('data-page') === page.ref) {
      link.setAttribute('data-selected', 'true')
    } else {
      link.removeAttribute('data-selected')
    }
  }
}

// ── Rendering a page ─────────────────────────────────────────────────────

function showMessage(heading, detail) {
  const box = document.createElement('div')
  const title = document.createElement('h1')
  title.textContent = heading
  const says = document.createElement('p')
  says.textContent = detail
  box.append(title, says)
  content().replaceChildren(box)
}

let renderToken = 0

async function render(page) {
  const token = ++renderToken

  document.title = `${page.title} — MuSemantiQ docs`
  markCurrent(page)
  content().replaceChildren()

  /*
  e-markdown reports nothing when a request fails — its ajax layer has no error
  path, so a 404 body would be rendered as if it were the page. Fetching here
  instead means a missing page says so.
  */
  let markdown
  try {
    const response = await fetch(page.md)
    if (!response.ok) {
      throw new Error(String(response.status))
    }
    markdown = await response.text()
  } catch (error) {
    if (token !== renderToken) {
      return
    }
    showMessage('This page has not been written yet', `${page.md} could not be loaded.`)
    return
  }

  try {
    await readyTheFonts()
  } catch (error) {
    if (token !== renderToken) {
      return
    }
    showMessage('The music fonts could not be loaded', error.message)
    return
  }

  // A newer navigation started while this one was waiting.
  if (token !== renderToken) {
    return
  }

  /*
  A fresh element every time. e-markdown unwraps itself into what it rendered,
  and an msq element replaces itself with its score and refuses to render twice,
  so there is never anything here worth keeping.
  */
  const markdownElement = document.createElement('e-markdown')
  markdownElement.internalState = { markdown }
  content().replaceChildren(markdownElement)
}

// ── Routing ──────────────────────────────────────────────────────────────

function go(pathname, { push }) {
  const page = pageByPath(pathname)
  if (!page) {
    showMessage('No such page', `Nothing in the documentation answers to ${pathname}.`)
    return
  }
  if (push && pathname !== window.location.pathname) {
    window.history.pushState({}, '', page.url)
  }
  render(page)
}

function isInternal(link) {
  return link &&
    link.origin === window.location.origin &&
    link.pathname.startsWith('/docs') &&
    !link.hasAttribute('download') &&
    link.getAttribute('target') !== '_blank'
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  const link = event.target.closest && event.target.closest('a[href]')
  if (!isInternal(link)) {
    return
  }
  event.preventDefault()
  go(link.pathname, { push: true })
  if (link.hash) {
    const target = document.getElementById(link.hash.slice(1))
    if (target) {
      target.scrollIntoView()
    }
  }
})

window.addEventListener('popstate', () => {
  go(window.location.pathname, { push: false })
})

buildSidebar()

/*
/docs on its own is the first page of the sitemap. It is given a real URL so
that reloading, or sharing what is on screen, names the page being read.
*/
const landed = pageByPath(window.location.pathname)
if (landed && window.location.pathname !== landed.url) {
  window.history.replaceState({}, '', landed.url)
}
go(window.location.pathname, { push: false })

export { allPages }
