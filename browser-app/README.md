# MuSemantiQ in the browser

A small web app demonstrating the MuSemantiQ web components: music written as
text, engraved as SVG and played back as MIDI, entirely in the browser.

```
npm run browser-app:setup   # once, and after changing src/ or web-components/
npm run browser-app
```

Then open **https://127.0.0.1:8888** in Chrome, Edge, Firefox or Safari.

> **Safari needs a polyfill, and the components bring it.** They are
> *customized built-in elements* (`<template is="msq-svg">`), which WebKit has
> never implemented, so `msq-template.js`, which every component imports before
> it defines itself, first loads `lib/custom-elements-polyfill.js`. The page does
> not import it. That has been checked with Playwright's WebKit, not yet in
> Safari itself on a Mac or an iPhone.

> The certificate is self-signed, so the browser will warn once. And there is a
> pause of about five seconds before the server announces itself — that is a
> fixed delay in the cluster helper, not a hang.

## Folder structure

```
browser-app/
├── nodes/          vendored HTTP/2 server library (see below)
└── web-app/
    ├── main.js         reads env/<ENV>.json, starts the cluster
    ├── primary.js      primary-process hook (nothing to do)
    ├── worker.js       builds the app and serves it
    ├── restart.js      zero-downtime restart helper
    ├── env/local.json  host, port, certificate paths
    ├── ssl/            committed development certificate
    └── static/         everything served to the browser
        ├── html/       index.html — the demo page, and 404.html
        ├── css/        e-ui.css (unused by this example)
        ├── font/       three symlinks into src/drawer/font/
        ├── midi/       a couple of sample .mid files
        └── js/msq/     the browser build of MuSemantiQ (generated, not tracked)
            ├── web-components/   copied from web-components/
            ├── language/         src/language, for the editor on the page
            └── worker/           all of src/, imports rewritten to real URLs
```

Inside `static/js/msq/web-components/` (a copy of the top-level
`web-components/`, so edit it there):

| Path | What it is |
| --- | --- |
| `msq-*-template.js` | The five components, plus their shared base class |
| `css/` | Stylesheets as JS strings, injected into each shadow root |
| `editor/` | The editor's DOM work: highlighting, line numbers, autocomplete, caret and scroll syncing, score ↔ source navigation |
| `icons/` | Inline SVG icons for the toolbars |
| `utils/` | Worker plumbing, clipboard, downloads, error formatting, and loading the Safari polyfill |
| `lib/` | Vendored third-party code: the MIDI player, Tone.js writers, Magenta audio, and the custom elements polyfill for Safari |

## Running it

`npm run browser-app:setup` prepares the app, in three steps:

1. `setup:symlinks` — recreates the three font symlinks under `static/font/`
2. `msq:apps:update` — regenerates `static/js/msq/worker/` and
   `static/js/msq/language/` from `src/`
3. `web-components:update` — copies `web-components/` to
   `static/js/msq/web-components/`

`npm run browser-app` only starts `web-app/main.js`. Run the setup again after
changing `src/` or `web-components/`, or keep `watch:src` and
`watch:web-components` running.

Run it from the repository root; the paths in `main.js` and `env/local.json` are
relative to the working directory. `ENV` chooses which file under `web-app/env/`
is read and defaults to `local`, which is the only one present.

The server is HTTP/2 and therefore TLS-only — there is no plain-HTTP mode. It
forks one worker per CPU. The certificate and key in `web-app/ssl/` are
committed development files made with [mkcert](https://github.com/FiloSottile/mkcert);
they are trusted only on the machine that created them, so expect the warning,
or replace them with your own:

```
mkcert localhost 127.0.0.1 ::1
```

### The three scripts

| Script | What it does | When you need it |
| --- | --- | --- |
| `npm run setup:symlinks` | Points `static/font/{chord-letters,music,text}` at `src/drawer/font/*` | Runs on `npm install`. Run it by hand if the fonts 404 — for example after unpacking a zip, which does not preserve symlinks |
| `npm run msq:apps:update` | Deletes `static/js/msq/worker/` and rebuilds it from `src/`, rewriting `#msq/...` imports to real URLs | After any change under `src/`. Part of `browser-app` already |
| `npm run watch:src` | The same, then rebuilds on every change under `src/` | In a second terminal while working on `src/`, so the browser only needs a reload |
| `npm run web-components:update` | Copies `web-components/` to `static/js/msq/web-components/` | After any change under `web-components/`. Part of `browser-app` already; `npm run watch:web-components` keeps it in step |

## What `nodes` is

`browser-app/nodes/` is a vendored copy of
[Guseyn/nodes.js](https://github.com/Guseyn/nodes.js), a procedural web
framework. It is not an npm dependency: it is reached through the `#nodes/*`
subpath import declared in the root `package.json`, and refreshed with
`npm run nodes:update`, which mirrors a sibling checkout. That sync deletes
whatever it does not recognise, so **local edits under `nodes/` will be lost**.

The example uses five of its functions:

- **`cluster(primary, worker)(options)`** — forks a worker per CPU, restarts
  any that die, writes `primary.pid`, and handles graceful shutdown.
- **`app({ indexFile, static })`** — collects the server's configuration.
- **`src(pattern, options)`** — one static-file rule: which URLs it answers,
  which folder it serves, gzip, caching, CORS, and the fallback file.
- **`server(app)()`** — creates the HTTP/2 server and starts listening.
- **`endpoint(...)`** — declares an API route. **This example declares none**;
  it only serves files.

Gzip, CORS, byte ranges and conditional requests all live in
`nodes/streamFile.js`. HTTP/1.1 clients are supported by shimming their
requests into an HTTP/2-shaped stream.

## Generated versus hand-written

**`static/js/msq/worker/`** and **`static/js/msq/language/`** are generated, both
by `copy-msq-into-apps.js`, which deletes each wholesale and rebuilds it.

`worker/` is every `.js` file in `src/` with the import specifiers rewritten to
real URLs — import maps do not apply inside module workers, which is why this
code generation exists. `language/` is `src/language` copied as it stands, for
the page rather than the worker: the editor parses on the main thread to colour
what is typed, and nothing in `src/language` imports outside itself, so its
`#msq/language/…` specifiers resolve through the page's own import map and need
no rewriting.

**`static/js/msq/web-components/`** is a copy of the top-level `web-components/`
folder, made by `npm run web-components:update`.

**None of `static/js/msq/` is committed.** Each of its three folders has one
source, so the whole folder is gitignored, and an edit made there is silently
reverted by the next build. Change `src/` or `web-components/` and run the
scripts again.

The font symlinks are committed as symlinks, so a normal clone gets them; the
`setup:symlinks` script exists to repair them.

## The components

Every component is a `<template is="...">` whose **text content is the
MuSemantiQ source**. On upgrade it replaces itself with a `<div>` holding an
open shadow root, so page CSS cannot reach inside except through the custom
properties defined in `css/tokens.js` (`--surface-bg`, `--border-radius`,
`--editor-height`, and so on) set on the host element.

Give the page an import map with the components and the language (the editor
parses on the page), and import what you use:

```html
<script type="importmap">
  {
    "imports": {
      "#msq/web-components/": "/js/msq/web-components/",
      "#msq/language/": "/js/msq/language/"
    }
  }
</script>
<script type="module">
  import '#msq/web-components/msq-font-loader-template.js'
  import '#msq/web-components/msq-svg-template.js'
</script>
```

There is no polyfill to import for Safari: the components load it themselves,
before any of them is defined (see `web-components/README.md`).

### `msq-font-loader`

Loads the fonts once and publishes them under a name the others refer to. It
renders nothing — its children take its place once the fonts are ready, which is
also what keeps them from rendering too early. Everything that engraves must be
**inside** it.

```html
<template
  is="msq-font-loader"
  data-font-sources-reference="msqFontSources"
  data-font-config='{
    "music": { "bravura": { "font": "/font/music/Bravura.otf",
                            "js": "/js/msq/worker/drawer/font/music-js/bravura.js" } },
    "text":  { "noto-serif": { "regular": "/font/text/NotoSerif-Regular.ttf",
                               "bold":    "/font/text/NotoSerif-Bold.ttf" } },
    "chord-letters": { "gentium plus": "/font/chord-letters/GentiumPlus-Regular.ttf" }
  }'
>
  <!-- score, player and editor components go here -->
</template>
```

`data-font-config` holds the configuration inline; `data-font-config-src` fetches
it from a URL instead. Give one or the other, not both. One loader per page.

### `msq-svg` — an engraved score

```html
<template is="msq-svg" data-font-sources="msqFontSources">
  measure
  stave
  a with accent
  a
</template>
```

Hover it for buttons to download the SVG, open it in a tab, or copy the source.
Also takes `data-file-name` for the download name.

### `msq-midi` — playback only

```html
<template is="msq-midi">
  measure
  stave
  a with accent
  a
</template>
```

The only component needing no fonts, so it takes no `data-font-sources`.
`data-sound-font` points at an alternative sound font.

### `msq-svg-midi` — a score you can hear

```html
<template is="msq-svg-midi" data-font-sources="msqFontSources" data-highlight-color="#C40233">
  measure
  stave
  a with accent
  a
</template>
```

The score with a player beneath it; notes light up as they sound.

### `msq-editor` — the editable surface

```html
<template
  is="msq-editor"
  data-font-sources="msqFontSources"
  data-editor-height="420px"
>
  music font is leland
  measure
  stave
  a with accent
  a
</template>
```

Switch between the score and the source with the toolbar, edit with syntax
highlighting and completion, then re-render. Hold Cmd or Ctrl to jump between a
word in the source and the mark it drew. Beyond the common attributes it takes
`data-opens-with` (`"score"`, the default, or `"text"` to open on the source,
fitted to the height of the text, without taking the focus),
`data-editor-height`, `data-editor-font-family` (must be monospace, or the
highlight layer stops lining up), `data-editor-font-size`,
`data-editor-font-src`, and `data-navigation-highlight-color`.

## Errors

### Mistakes in the music are shown in the element

The parser is fault tolerant: it reports what it could not read and carries on,
so the score and the playback are still produced from everything it did
understand. Whatever it could not read appears in a panel at the bottom of the
element itself — a count, then a row per problem with the line it came from:

```
┌─────────────────────────────────────────────┐
│  (the score, engraved from what parsed)     │
├─────────────────────────────────────────────┤
│  2 errors                                   │
│  #   Line   Message                         │
│  1   14     command 'with chord with # key' │
│             is not recognizable or applica… │
│  2   21     unit after command 'tie' is not │
│             found                           │
└─────────────────────────────────────────────┘
```

Every component does this, so nobody has to open the console to find a typo. In
`msq-editor` the panel is rebuilt on each re-render, so it tracks the source as
it is edited, and the element also reports an outright failure to render there
rather than losing it.

The panel is a `div[data-errors]` inside the shadow root, and the surface sets
`data-has-errors` while it is present, which is what squares off the bottom
corners above it.

### A component that never appears

Setup mistakes are a different matter: they stop the element from starting at
all, so there is no panel to put them in and nothing on the page.
**Check the browser console**, where it shows up as an unhandled rejection. The
usual causes:

- a component that engraves placed **outside** the `msq-font-loader`
- `data-font-sources` not matching the loader's `data-font-sources-reference`
- missing font symlinks, so the font requests 404 — run `npm run setup:symlinks`
- Safari, with `lib/custom-elements-polyfill.js` missing from the components'
  copy, so they cannot load it — run `npm run web-components:update`

## Also worth knowing

The import map in `index.html` is hand-written, and the `browser.importmap` field
in `package.json` holds its entries too, along with the other apps' `#ehtml/`
and `#e-ui/` — kept in step by hand, and read by
`nodes/updateCacheVersionsInUrls.js` to resolve specifiers when it stamps cache
versions. `worker.importmap` is used only at build time, by
`copy-msq-into-apps.js`. If you add a folder under `static/js/`, update the import
map in `index.html`, the `browser.importmap` field, and the URL pattern in
`web-app/worker.js`.

`static/css/e-ui.css` is left over and referenced by nothing.
