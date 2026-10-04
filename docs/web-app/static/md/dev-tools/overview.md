# Overview

The dev tools are a small web app for working on MuSemantiQ itself: its fonts, its sound fonts, its MusicXML converters and its tests. They are for me and for anyone who changes the engine, not for someone who only writes music with it.

## 1. Starting them

All you need is to run:

```bash
npm run dev-tools
```

It does five things in order:

1. `dev-tools:vendor` copies **nodes**, **EHTML** and **e-ui** in from their sibling checkouts (see [Full setup](/docs/getting-started/full-setup)), and fails if they are not there
2. `setup:symlinks` links the fonts and the rendered sound fonts into `dev-tools/web-app/static/`
3. `msq:apps:update` writes the worker copy of `src/` into `static/js/msq/worker/`
4. `web-components:update` copies `web-components/` into `static/js/msq/web-components/`
5. `node dev-tools/web-app/main.js` starts the server

Then open **https://127.0.0.1:8889**. The port and the host come from `dev-tools/web-app/env/local.json`, and the certificate is the same development certificate the browser example uses, so the browser warns once.

**Side note:** the server runs a single worker process, because these are tools for one person at a keyboard. That worker waits about five seconds before it loads its routes, which is a fixed delay in the nodes cluster helper, not a hang.

## 2. They write to your working tree

That is the whole point of them. Every page reads files from the repository and most of them write files back: a glyph into `src/drawer/font/music-js/<font>.js`, a new music font into `src/drawer/font/music/`, a baseline into `test/**/expected/`, a sound bank into `src/midi/sound-banks/`. Nothing is kept in a database or in the browser. What you see is the state of the working tree a moment ago, and what you change is a change you will see in `git status`.

It's important to mention that the library itself can do none of this. The endpoints that write live in `dev-tools/web-app/api/`, not in `src/`, so nothing MuSemantiQ ships is able to rewrite a font or a test baseline.

## 3. The five tools

| Tool | Page | What it is for |
| --- | --- | --- |
| [Font viewer](/docs/dev-tools/font-viewer) | `/html/font-viewer.html` | Trace a glyph out of a music font, see it engraved where it is used, and write it back into the music-js font |
| [Font generator](/docs/dev-tools/font-generator) | `/html/font-generator.html` | Turn a SMuFL `.otf` into a music-js font the drawer can use |
| [Magenta soundfont generator](/docs/dev-tools/soundfont-generator) | `/html/magenta-sound-font-generator.html` | Render an `.sf2` soundbank into the sample set the player loads |
| [MusicXML tool](/docs/dev-tools/musicxml-tool) | `/html/music-xml.html` | Convert a score in either direction and engrave the result |
| [Test viewer](/docs/dev-tools/test-viewer) | `/html/test-viewer.html` | Compare what the last test run produced against the committed baselines, and adopt the new ones |

The first page, **https://127.0.0.1:8889**, links to all five.

## 4. Keep them local

The dev tools are a local tool. Don't expose them on a network.

They have no accounts and no authentication, and several endpoints write files or start processes: `/dev/font/generate` runs the font generator, `/dev/magenta/generate` starts a render that runs for hours, `/dev/tests/delete` removes a test and all of its artifacts. The server listens on **127.0.0.1**, so nothing outside your machine can reach it, and that is the only protection it has.

Inside that, I have been careful about paths. nodes resolves static files with a plain `path.join` and no traversal check, so every mount that reaches outside `static/` (`/tests/`, `/tools/`, `/glyph-examples/`) goes through a mapper that uses `resolveInside` from `dev-tools/web-app/api/shared.js`, and every endpoint that takes a file name refuses one that climbs out of its folder. That keeps a mistake from writing somewhere it should not. It does not make the tools safe to put on the internet.

Read next: [Font viewer](/docs/dev-tools/font-viewer)
