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

A `worker/` folder beside the folder, holding the engine — so `js/msq` is those
two halves and nothing else:

    <app>/static/js/msq/
      web-components/   ← copied from here
      worker/           ← generated from src/ by npm run create:msq:worker

Every reach into the engine is written against the module's own URL rather than
against a path the app has to provide: from a module one level in, the worker is
`../../worker/…`. That is how `utils/worker-instance.js` starts it, and how
`editor/parsedHighlights.js` and the completion lists import the parser. Nothing
here names an absolute URL, so the pair works at any mount point and neither
half has to be told where the other landed.

Within the folder, modules import each other through the `#msq/` specifier the
hosting page declares in its import map:

    "#msq/":        "/js/msq/web-components/"
    "#msq-worker/": "/js/msq/worker/"

The second is for a page that wants the engine directly — the font viewer reads
the glyph tracer out of it. A module worker gets no import map at all, which is
why `worker/` is a separate tree with its imports already rewritten to real URLs.
