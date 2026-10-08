# Where to go next

MuSemantiQ can be used in several ways, and all of them are always available: you can pick one, or combine them. How to set up each of them is described in [Full setup](/docs/getting-started/full-setup).

## 1. Learn the language

If you want to write music, read [MSQ language](/docs/language/first-notes) from its first page. It goes from single notes to full scores in the order the language is learnt, and every example on a page uses only what that page or an earlier one has introduced, so it reads best straight through.

## 2. Use the low-level API

If you want to engrave or perform from your own code in Node.js, read [Low-Level API](/docs/api/overview). It is the pipeline itself: `setupFonts`, then the parsing, the styles, and the SVG and MIDI for one page or many.

## 3. Use the worker in the browser

If you want the same API in the browser without blocking your page, read [Worker](/docs/worker/overview). It is the engine in a module worker, and you talk to it with messages.

## 4. Use the native web components

If you want scores in your own pages, read [Web Components](/docs/components/overview). A `<template is="msq-svg">` with MSQ inside it becomes a score, `msq-midi` becomes a player, `msq-svg-midi` becomes both, and `msq-editor` becomes an editor.

## 5. Use the showdown extensions in markdown

If you write markdown, read [Showdown Extensions](/docs/showdown/overview). A fenced block named after a component becomes that component, so you can put music into markdown the same way you put code.

## 6. Use it in combination with EHTML

If you want pages made of markdown files with no build at all, read [With EHTML](/docs/ehtml/overview). Its `e-markdown` element fetches a markdown file and renders it with the showdown extensions, which is how these docs are made.

## 7. Worked examples

There are a few places with complete, working examples:

- `browser-app` is a page with every component on it. Run it with `npm run browser-app`, and read about it in [Browser app](/docs/examples/browser-app).
- `cli-app` is the command line, described in [CLI](/docs/examples/cli).
- [Recipes](/docs/recipes/svg-in-node) are short, complete answers to specific tasks, like engraving to SVG in Node or embedding a playable score.
- The test corpora in `test/visual-tests` and `test/audio-tests` hold almost two hundred MSQ files each, together with the SVG and MIDI they must produce. The [test viewer](/docs/dev-tools/test-viewer) in the dev tools shows them side by side.

## 8. Questions and issues

If something does not work, or you have a question or a suggestion, open an issue on [GitHub](https://github.com/Guseyn/MuSemantiQ/issues). Issues, suggestions and discussions are welcome.

**Important note:** pull requests are not accepted. The [license](/docs/reference/license) says so, and it allows forks and your own modifications instead.

Before asking, it's worth checking [FAQ and limitations](/docs/reference/faq), because the things MuSemantiQ does not do at the moment are listed there.

Read next: [Your first notes](/docs/language/first-notes)
