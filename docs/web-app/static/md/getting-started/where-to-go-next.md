# Where to go next

From here there are three routes, depending on what you came for. You can take them in any order, but the first one is the one the other two keep coming back to.

## 1. Learn the language

If you want to write music, read [MSQ language](/docs/language/first-notes) from its first page. It goes from single notes to full scores in the order the language is learnt, and every example on a page uses only what that page or an earlier one has introduced, so it reads best straight through.

## 2. Embed the components

If you want scores in your own pages, start with [Web components](/docs/components/overview). A `<template is="msq-svg">` with MSQ inside it becomes a score, `msq-midi` becomes a player, `msq-svg-midi` becomes both, and `msq-editor` becomes an editor. [Embedding in your own app](/docs/examples/embedding) walks through what a page needs to host them.

## 3. Call the API

If you want to engrave or perform from your own code, read [Low-level API](/docs/api/overview). It is the pipeline itself: `setupFonts`, then the parsing, the styles, and the SVG and MIDI for one page or many, in Node or in a worker.

## 4. Worked examples

There are a few places with complete, working examples:

- `browser-app` is a page with every component on it. Run it with `npm run browser-app`, and read about it in [Browser app](/docs/examples/browser-app).
- `cli-app` is the command line, described in [CLI](/docs/examples/cli).
- [Recipes](/docs/recipes/svg-in-node) are short, complete answers to specific tasks, like engraving to SVG in Node or embedding a playable score.
- The test corpora in `test/visual-tests` and `test/audio-tests` hold almost two hundred MSQ files each, together with the SVG and MIDI they must produce. The [test viewer](/docs/dev-tools/test-viewer) in the dev tools shows them side by side.

## 5. Questions and issues

If something does not work, or you have a question or a suggestion, open an issue on [GitHub](https://github.com/Guseyn/MuSemantiQ/issues). Issues, suggestions and discussions are welcome.

**Important note:** pull requests are not accepted. The [license](/docs/reference/license) says so, and it allows forks and your own modifications instead.

Before asking, it's worth checking [FAQ and limitations](/docs/reference/faq), because the things MuSemantiQ does not do at the moment are listed there.

Read next: [Your first notes](/docs/language/first-notes)
