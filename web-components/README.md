# web-components

The `<template is="msq-*">` elements, and everything only they need: the editor,
the styles, the icons, the small utilities and the vendored player libraries.

They are written once here and **copied** into every app that shows a score:

    web-components/  ──►  browser-app/web-app/static/js/msq/web-components/
                     ──►  dev-tools/web-app/static/js/msq/web-components/
                     ──►  docs/web-app/static/js/msq/web-components/

by `npm run web-components:update`, which `npm run browser-app`,
`npm run dev-tools` and `npm run docs` all run before starting.
`npm run watch:web-components` keeps the copies in step while you work. The copies are generated, so they are
not tracked — this folder is the only place to edit them.

## What they expect where they land

Two folders beside this one, so `js/msq` is those three and nothing else:

    <app>/static/js/msq/
      web-components/   ← copied from here
      language/         ← src/language, by npm run create:msq:worker
      worker/           ← all of src/, by the same script

`worker/` is what the worker runs and nothing on the page imports out of it. It
is started by URL rather than by specifier — `utils/worker-instance.js` resolves
`../../worker/worker.js` against its own module URL, so the pair works at any
mount point and neither half has to be told where the other landed. Everything
else the page wants from the engine it asks the worker for by message: an
engraved page, a MIDI file, a traced glyph.

`language/` is the one exception, and it is a deliberate one. The editor colours
what is typed by parsing it — on the main thread, between a keystroke and the
next paint — so the parser cannot live behind a message queue that is also
carrying engraving work. `editor/parsedHighlights.js` and the completion lists
import it directly, from `#msq/language/api.js`, which is the parsing half of
`src/api.js` with none of the drawer, fonts or MIDI attached.

Modules here import each other, and the language, through the specifiers the
hosting page declares in its import map:

    "#msq/web-components/": "/js/msq/web-components/"
    "#msq/language/":       "/js/msq/language/"

Nothing in `src/language` imports outside itself, so its copy is served exactly
as authored and those `#msq/language/…` specifiers are resolved by that same
map. A module worker gets no import map at all, which is why `worker/` is a
separate tree with its imports already rewritten to real URLs.

## Safari

Every element here is a customized built-in — `<template is="msq-*">` — and
WebKit has never implemented those. `lib/custom-elements-polyfill.js` is
Andrea Giammarchi's polyfill (ISC), a verbatim copy of the one EHTML carries,
so it travels with the components into every app. It patches
`customElements.define`, so it only helps if it runs before any component
defines itself. That is why the components load it themselves: `msq-template.js`
first imports `utils/polyfillCustomizedBuiltIns.js`, and every element imports
`msq-template.js` before it calls `customElements.define`. A page only imports
the components:

    import '#msq/web-components/msq-font-loader-template.js'
    import '#msq/web-components/msq-svg-template.js'

The polyfill has no guard against running twice, and in WebKit a second run
wraps `customElements.define` again over the first. So
`polyfillCustomizedBuiltIns.js` imports it only while `define` is still native
code; once any copy has run, it is not. In Chromium and Firefox `define` stays
native, and the polyfill finds nothing to do there.

A page that also loads EHTML still imports EHTML's copy first, by the URL
EHTML's own `main.js` uses — `#ehtml/third-party/custom-elements-polyfill.js`.
`main.js` imports it with no check, so if the components' copy ran first,
EHTML's would run over it. Imported first, it runs once: the components see a
define that is no longer native and skip theirs, and the module cache stops
`main.js` from running it again. It also has to be in place before the e-ui
customized built-ins (`e-dialog`, …) define themselves, which happens before
`#ehtml/main` is imported.
