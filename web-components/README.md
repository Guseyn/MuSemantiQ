# web-components

The `<template is="msq-*">` elements, and everything only they need: the editor,
the styles, the icons, the small utilities and the vendored player libraries.

They are written once here and **copied** into every app that shows a score:

    web-components/  ──►  examples/browser/web-app/static/js/msq/web-components/
                     ──►  dev-tools/web-app/static/js/msq/web-components/

by `npm run web-components:update`, which `npm run examples:browser` and
`npm run dev-tools` both run before starting. `npm run watch:web-components`
keeps both copies in step while you work. The copies are generated, so they are
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
