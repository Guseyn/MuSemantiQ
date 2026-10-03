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
        js/docs.js         the sitemap and the current page, for the templates
        js/app.js          holds the sidebar open; classic, and first
        js/landing/        the landing page's elements: landing-screen, -rail,
                           -phrase, -carousel, -flow, -scroll-hint
        md/landing/        the landing page's code samples
        md/                every page, one .md file
    concepts.js            scenario name -> the page that introduces it

Everything else under `web-app/static` is vendored or generated and is not
tracked — `npm run docs` rebuilds all of it before starting.

## The landing page

`static/html/index.html`, twelve full-viewport screens that snap one at a time.
It carries its own `landing.css` and does not load e-ui: e-ui is a design system
for tools, and this is not a tool. Its movement is a handful of customized
built-in elements in `static/js/landing/` (`<section is="landing-screen">`,
`<nav is="landing-rail">`, …), which keep the `data-*` hooks the stylesheet
uses and talk to each other through `landing:screen-*` events.

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

Write the music as a fenced block named after the element, here an editor that
opens on its text:

    ```msq-editor opens-with=text
    measure
    treble clef
    c d e f
    ```

The reader sees what is written first, and the score is one click away, on
**Render the score**. The components section is the exception: each of its
pages shows the element it is about.

The extensions in `showdown-extensions/` (linked into `static/js/` by
`npm run setup:symlinks`, and given to the shell's `e-markdown`) turn the fence
into `<template is="msq-editor" data-font-sources="msqFontSources"
data-opens-with="text">`. Words after the element's name are its attributes,
without `data-`: `file-name=a-short-piece`, `editor-height=320px`. The fonts are
the docs' default, so they are not written. `msq-svg`, `msq-midi` and
`msq-svg-midi` are written the same way.

The music in a fence never goes through markdown: the extensions take it out
before showdown parses anything and put the element back after. That matters,
and what it prevents is silent: markdown would split the music at blank lines,
put `<br>` between lines, and turn a line starting `-` or `#` into a list or a
heading. The score would still draw, just not the score that was written.

A `<template>` wrapped in a `<div>` at column 0 also survives, and the check
still accepts it, but a fence is how examples are written here.

## The check

    npm run docs:check

Runs as part of `npm run docs`, and holds every example to four things:

1. it is fenced, or else wrapped in a `<div>` at column 0;
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

A page that shows what is coming, before the pages that introduce it, marks
itself too, and is then exempt from the fourth rule only — its examples are
still held to the first three:

    <!-- check-docs-examples: preview -->

`what-it-is` and `your-first-page` in getting-started are the two that do.

## Still to write

The prose. Every page is headings and a `> **TO WRITE**` note saying what
belongs there; the examples are real. The notes render as callouts, so the gaps
are visible while reading rather than only while grepping:

    grep -rc "TO WRITE" docs/web-app/static/md/
