# Generated versus hand-written

Since there is [no build](/docs/architecture/no-build), a lot of what the apps serve is a copy of something else in the repository. This page says which directories are the source, which are generated from it, and which are brought in from elsewhere, because editing the wrong one is the easiest mistake to make here.

## 1. Generated

These are written by a command, and every app's npm script runs that command before starting. `<app>` is each of `examples/browser`, `dev-tools` and `docs`:

| Directory | Written by | From |
| --- | --- | --- |
| `<app>/web-app/static/js/msq/worker/` | `npm run create:msq:worker` | all of `src/`, specifiers rewritten |
| `<app>/web-app/static/js/msq/language/` | `npm run create:msq:worker` | `src/language/`, as it is |
| `<app>/web-app/static/js/msq/web-components/` | `npm run web-components:update` | `web-components/` |
| `<app>/web-app/static/font/` | `npm run setup:symlinks` | links to `src/drawer/font/` |
| `<app>/web-app/static/images/logo.svg` | `npm run setup:symlinks` | a link to `logo.svg` |
| `<app>/web-app/static/magenta-sound-font/` | `npm run setup:symlinks` | links to `src/midi/magenta-sound-font/` |

A few generated files are committed on purpose, because they are slow or inconvenient to regenerate:

1. `src/drawer/font/music-js/bravura.js` and `leland.js`, written by `tools/smufl/generate-smufl-js-font.js` and then tuned by hand in the font viewer. After the first generation they are source.
2. `docs/web-app/static/images/phrase.svg` and `note.svg`, written by `npm run docs:art`, so the landing page does not wait for the engine to draw its own header.
3. every `actual/` directory under `test/`, which every test run rewrites, is tracked next to its `expected/`.

And some are too large to commit at all: the Magenta sound banks and the sample sets rendered from them, under `src/midi/sound-banks/` and `src/midi/magenta-sound-font/`, of which only the `.gitinfo` notes are tracked.

## 2. Vendored

These are copies of code that lives somewhere else. Some come from my own sibling repositories, with a script each:

| Directory | Script | From |
| --- | --- | --- |
| `examples/browser/nodes/` | `npm run nodes:update` | `../nodes.js/nodes/` |
| `dev-tools/nodes/`, `docs/nodes/` | `npm run dev-tools:nodes:update`, `npm run docs:nodes:update` | `../nodes.js/nodes/` |
| `dev-tools/web-app/static/js/ehtml/`, `docs/web-app/static/js/ehtml/` | `npm run dev-tools:ehtml:update`, `npm run docs:ehtml:update` | `../EHTML/src/` |
| `dev-tools/web-app/static/js/e-ui/`, `docs/web-app/static/js/e-ui/`, and `static/css/e-ui.css` in both | `npm run dev-tools:eui:update`, `npm run docs:eui:update` | `../e-ui/static/` |

The others are third-party libraries, copied in by hand once and committed: opentype.js and svgpath in `src/drawer/lib/`, @tonejs/midi and midi-file in `src/midi/lib/`, a JSON schema validator in `src/language/lib/`, and the player libraries in `web-components/lib/`. More about both kinds in [Vendoring](/docs/architecture/vendoring).

## 3. The source

Everything else is written by hand, and it is the only place to make a change:

1. `src/`, the engine: the language, the drawer and the MIDI engine, plus `api.js` and `worker.js`;
2. `web-components/`, the `msq-*` elements and the editor;
3. `tools/`, `scripts/` and `examples/cli/`;
4. each app's `web-app/`, apart from the generated and vendored folders above: its pages, scripts, styles, API and config;
5. `test/`, the `.txt` inputs and the `expected/` artifacts under each suite;
6. `docs/web-app/static/md/` and `docs/web-app/static/js/sitemap.js`, the documentation itself.

## 4. The hazard

It's important to mention that an edit to a generated or vendored copy **works**. The browser loads the copy, so a fix made in `dev-tools/web-app/static/js/msq/worker/` shows up on the next reload, and everything looks right.

Until the next rebuild. `create-msq-worker.js` deletes each output directory before writing it, `copy-web-components.js` deletes whatever is not in `web-components/`, and the vendoring scripts run `rsync --delete`. And since every app's npm script runs them before starting, the next `npm run dev-tools` quietly replaces your fix with the old code. Nothing warns you, because nothing knows the copy was changed.

So you have to remember the rule: edit `src/` and `web-components/`, keep `npm run watch:src` and `npm run watch:web-components` running while you work, and fix a vendored library upstream, in its own repository, then vendor it again.

## 5. How .gitignore encodes this

`.gitignore` is where this split is written down. Each app's generated and vendored folders are listed, with a comment saying which command rebuilds each one:

```text
# Everything under dev-tools/ that a command rebuilds. `npm run dev-tools` runs
# all of them before starting the server, so a clone needs none of it tracked:
#
#   nodes/            npm run dev-tools:nodes:update   (from ../nodes.js)
#   js/ehtml/         npm run dev-tools:ehtml:update   (from ../EHTML)
#   js/e-ui/, e-ui.css  npm run dev-tools:eui:update   (from ../e-ui)
#   js/msq/           npm run web-components:update + create:msq:worker
#   font/             npm run setup:symlinks
#   images/logo.svg   npm run setup:symlinks
#
# Only the app itself — its pages, its api and its config — is tracked.
dev-tools/nodes/
dev-tools/web-app/static/js/ehtml/
dev-tools/web-app/static/js/e-ui/
dev-tools/web-app/static/js/msq/
dev-tools/web-app/static/css/e-ui.css
dev-tools/web-app/static/font/
dev-tools/web-app/static/magenta-sound-font/
dev-tools/web-app/static/images/logo.svg
```

`docs/` has the same block. The examples app is the exception: only its `static/js/msq/`, its logo link and its sound fonts are ignored, while its `nodes/`, its `static/css/e-ui.css` and its font links are committed. So the examples app starts from a clone with nothing but `npm run examples:browser`, which does not vendor anything, and it needs no sibling repositories at all.

So if a directory is in `.gitignore`, it is generated or vendored, and you should not edit it. If it is tracked, it is either the source or a vendored copy that is committed on purpose.

Read next: [Repository layout](/docs/architecture/repository-layout)
