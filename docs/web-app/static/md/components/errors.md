# Errors and troubleshooting

There are two kinds of things that can go wrong with a component, and they look completely different. A mistake in the music is shown to you inside the element. A mistake in the setup means the element never appears at all.

## 1. Mistakes in the music

The parser never stops at a mistake. It reports what it could not read, carries on, and the score and the playback are made from everything it did understand. What it could not read is listed in a panel at the bottom of the element itself:

<!-- check-docs-examples: allow-errors -->
```msq-svg
measure
treble clef
c d e f

measure
c with fancy accent
d e f
```

As you can see, the panel says how many errors there are, and then gives a row to each: its number, the line it came from, and the message. When a message does not say which line it came from, the line column shows a dash. The panel only appears when there is something to report.

Every component does this, `msq-midi` included, so you never have to open the console to find a typo. In `msq-editor`, the panel is rebuilt every time you render the score, so it follows the source as you edit it. It's very important to let a user see errors or inaccuracies visually, right where the music is. What the messages mean you can read in [Handling errors](/docs/language/handling-errors).

## 2. Mistakes in the setup

A mistake in the setup is a different matter. It stops the element before it has anything to show, so there is no panel to put the message in, and the element simply stays an invisible `<template>`. The message goes to the console instead, as an unhandled promise rejection (for example `Uncaught (in promise) Error: …`), because every component does its work asynchronously.

These are the common ones, each with what you see and what the console says:

| Mistake | What you see | What the console says |
| --- | --- | --- |
| A component that engraves is outside the `msq-font-loader`, and starts before the fonts are registered | That component is missing | `Font sources cannot be found by reference (msqFontSources)` |
| `data-font-sources` does not match the loader's `data-font-sources-reference` | The component is missing | `Font sources cannot be found by reference (…)`, with the name it asked for |
| `data-font-sources` is missing | The component is missing | `<template is="msq-svg"> must have a "data-font-sources" attribute matching a "data-font-sources-reference" declared on a msq-font-loader` |
| The loader has no `data-font-sources-reference` | Everything inside the loader is missing | `msq-font-loader must have "data-font-sources-reference" attribute, so that other msq elements can use it` |
| The loader has neither `data-font-config` nor `data-font-config-src` | Everything inside the loader is missing | `msq-font-loader must have attribute "data-font-config-src" or "data-font-config"` |
| The loader has both of them | Everything inside the loader is missing | `msq-font-loader cannot have both "data-font-config-src" and "data-font-config" attributes to avoid confusion.` |
| `data-font-config-src` answers with an error | Everything inside the loader is missing | `Font config could not be loaded: 404` (or whichever status it was) |
| `data-font-config` is not valid JSON | Everything inside the loader is missing | The `SyntaxError` of `JSON.parse` |
| A font file in the config is not found, for example because the font symlinks are missing | Everything inside the loader is missing | `Font could not be loaded`, and a failed request for the font in the network tab |
| A second loader uses a reference that is already registered | Everything inside the second loader is missing | `Font sources are already registered under reference (…)` |
| The element has no music in it | The component is missing | `No inputText provided` |
| The import map is missing, or does not name `#msq/web-components/` and `#msq/language/` | Nothing on the page renders | The browser's error that it cannot resolve the `#msq/...` specifier |
| The worker tree was never generated (`npm run create:msq:worker`) | Nothing renders, and nothing ever will | A failed request for `/js/msq/worker/worker.js`. No rejection follows, because the worker never answers |

It's important to mention the difference between the two groups of rows. A mistake on one component takes only that component away. A mistake on the loader takes away everything inside it, because the loader only puts its content on the page after the fonts are ready, and the fonts are never ready.

## 3. When nothing renders

Work through this list from the top, and stop at the first thing that is wrong:

1. **The browser.** Safari does not upgrade these elements on its own. The components load a polyfill for it themselves, from `lib/custom-elements-polyfill.js` next to them. If the page is fine in Chromium or Firefox but empty in Safari, look for a failed request for that file, and on a page that also loads EHTML, check that EHTML's copy of the polyfill is imported before the components; see [Browser support](/docs/components/browser-support).
2. **The console.** Every setup mistake says what it is there. Read the first error, not the last.
3. **The network tab.** Look for a failed request for `worker.js`, for a font file under `/font/`, or for a glyph table under `/js/msq/worker/drawer/font/music-js/`. In this repository, `npm run setup:symlinks` puts the fonts back, and `npm run create:msq:worker` rebuilds the worker tree.
4. **The import map.** It has to come before the module scripts that import the components.
5. **The reference.** Every `data-font-sources` must match a `data-font-sources-reference` exactly.
6. **The placement.** A component that engraves must either be inside the loader, or be inserted after the loader has finished (see [msq-font-loader](/docs/components/msq-font-loader)).
7. **The music.** An element with nothing in it is not rendered. If the element renders but the score is not what you wrote, read the errors panel under it.

Read next: [Browser support](/docs/components/browser-support)
