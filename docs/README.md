# docs

The landing page and the documentation site. A third app beside
`examples/browser` and `dev-tools`, on the same stack: the vendored `nodes`
server, EHTML and e-ui on the page, native import maps, no bundler.

    npm run docs        →  https://127.0.0.1:8890

`/` is the landing page. `/docs/<section>/<page>` is the documentation: one
shell, and a markdown file fetched into it per page.

## Layout

    web-app/
      worker.js            routes; every /docs/... URL serves the one shell
      static/
        html/index.html    the landing page
        html/docs.html     the documentation shell
        js/sitemap.js      the documentation, as data
        js/docs.js         the router, the sidebar, the fonts
        js/app.js          holds the sidebar open; classic, and first
        md/                every page, one .md file
    concepts.js            scenario name -> the page that introduces it

Everything else under `web-app/static` is vendored or generated and is not
tracked — `npm run docs` rebuilds all of it before starting.

## The landing page

`static/html/index.html`, twelve full-viewport screens that snap one at a time.
It carries its own `landing.css` and does not load e-ui: e-ui is a design system
for tools, and this is not a tool.

Its two pieces of artwork are engraved by the engine rather than drawn:

    npm run docs:art

writes `static/images/phrase.svg` (the phrase on the opening and closing
screens) and `static/images/note.svg` (the quaver in the section rail) from a
few words of MSQ in `scripts/generate-landing-art.js`. Both are committed, so
the page does not wait for the engine to start before it can draw its own
header; rerun it after changing that source or the music fonts.

The phrase is inlined rather than given to an `<img>` because the animation
works on the parts the engine named — `stavePiece`, each `singleUnit`,
`beamLines` — and an image has no parts.

## Writing a page

`static/js/sitemap.js` is the only place a page is declared. Add it there and
create `static/md/<section>/<page>.md`; the sidebar and the router both follow.

**Order is meaning.** The language section is in the order the language is
learnt rather than the order of the reference material it came from, because
every example is gradual: no page uses a concept an earlier page has not
introduced. Moving a page re-checks every example under it.

## Examples

Write the music as a `<template is="msq-svg">`, and **wrap it in a `<div>`**:

    <div>
    <template is="msq-svg" data-font-sources="msqFontSources">
    measure
    treble clef
    c d e f
    </template>
    </div>

The wrapper is load-bearing, and what it prevents is silent. `<template>` is
not one of showdown's block tags, so without the `<div>` the markdown pass gets
into the music: a blank line splits it into paragraphs, `<br>` lands between
every line, and a line starting `-` or `#` becomes a list or a heading. The
score still draws — it is just not the score that was written. `div` **is** a
block tag, and showdown re-emits a matched block byte for byte.

So: the `<div>` at column 0, on its own line, above and below. Nothing in its
attributes may contain the word `markdown`, which makes showdown re-parse the
contents of the element it is on.

## The check

    npm run docs:check

Runs as part of `npm run docs`, and holds every example to four things:

1. it is wrapped, at column 0;
2. **it survives the markdown pass** — each page is rendered with the very
   converter the browser will use and the music compared with what was written;
3. it parses, with no errors;
4. it is gradual — the parser reports which of its 578 named constructs the
   example used, `concepts.js` says which page introduces each, and the sitemap
   order says which of those count as already introduced.

It also names any construct no page introduces, which is how a new language
feature says the documentation has not caught up with it.

The one page that must show input that does not parse marks itself:

    <!-- check-docs-examples: allow-errors -->

## Still to write

The prose. Every page is headings and a `> **TO WRITE**` note saying what
belongs there; the examples are real. The notes render as callouts, so the gaps
are visible while reading rather than only while grepping:

    grep -rc "TO WRITE" docs/web-app/static/md/
