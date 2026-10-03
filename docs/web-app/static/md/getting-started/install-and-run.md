# Install and run

MuSemantiQ is used from a clone of its repository. There is nothing to build: the source you clone is the source that runs.

## 1. Prerequisites

All you need is **Node 22** or newer. `package.json` asks for it in `engines`, and the CLI checks the version itself and refuses to start on anything older.

There are no runtime npm dependencies. The third-party code the engine needs (opentype.js, svgpath, @tonejs/midi, midi-file) is vendored into the repository, and the only thing `npm install` downloads is **c8**, which is used for test coverage.

**Important note:** `npm run dev-tools` and `npm run docs` need three more things: my libraries **nodes**, **EHTML** and **e-ui**, cloned beside each other. Those two scripts copy them in with `rsync` from `../../my-projects/nodes.js`, `../../my-projects/EHTML` and `../../my-projects/e-ui`, relative to the repository, and they fail if the folders are not there. So in practice the repository and the three libraries have to sit side by side in a folder called `my-projects`. The browser example and the CLI do not need them, because the example app's copy of nodes is committed.

## 2. Clone and install

```bash
git clone https://github.com/Guseyn/MuSemantiQ.git
cd MuSemantiQ
npm install
```

`npm install` runs a `postinstall` script, `scripts/setup-symlinks.js`. It does not download anything. It links the files every browser app shares into each app's `static/` folder, so they live in one place:

- the logo, `logo.svg`, as `static/images/logo.svg`
- the three font families, `src/drawer/font/music`, `text` and `chord-letters`, as `static/font/...`
- every rendered sound font in `src/midi/magenta-sound-font`, as `static/magenta-sound-font/...`, removing links to sets that are gone

You can run it again at any time with `npm run setup:symlinks`, and every app start below does that for you.

## 3. Run it

There are three commands to start with.

The browser example, a page with every web component on it:

```bash
npm run browser-app
```

It runs `setup:symlinks` to link the shared files, `create:msq:worker` to generate the worker copy of `src/` into the app, and `web-components:update` to copy the web components in, and then it starts the server at **https://127.0.0.1:8888**.

The command line:

```bash
npm run cli-app
```

With no flags it asks you a few questions: what to generate, where the input is, which fonts, and where to write the output. To skip the questions, pass flags after `--`, which tells npm the flags are for the script and not for npm itself:

```bash
npm run cli-app -- --input score.txt --out build --svg --midi
```

Running `node cli-app/msq.js` directly works too, and needs no `--`. All the options are described in [CLI](/docs/examples/cli).

The dev tools, which are the test viewer, the font viewer and font generator, the MusicXML tool and the sound font generator:

```bash
npm run dev-tools
```

It vendors nodes, EHTML and e-ui first (see the note above), then does the same three steps as the browser example, and starts at **https://127.0.0.1:8889**. This documentation runs the same way, with `npm run docs`, at **https://127.0.0.1:8890**, with one more step before its server starts: `npm run docs:check`, which parses every example in these pages and stops if one of them has errors or uses something a later page introduces.

## 4. The certificate

The browser apps are served over **HTTP/2**, and browsers only speak HTTP/2 over TLS, so they are **https** even on your own machine. The certificate they use is committed in `browser-app/web-app/ssl/`. It is a local development certificate made with **mkcert**, and it is signed by a certificate authority that exists only on my machine, so your browser does not trust it.

The first time you open one of the apps, the browser says the connection is not private (Chrome) or warns of a potential security risk (Firefox). That is expected. Open the advanced details and choose to proceed to **127.0.0.1**. The server only listens on **127.0.0.1**, so nothing outside your machine can reach it.

If you would rather not see the warning, you can make a certificate of your own with mkcert and point `key` and `cert` in the app's `web-app/env/local.json` at it.

## 5. Which browser

The web components are **customized built-in elements**: each one is a `<template>` that becomes the component through its `is` attribute. Chromium-based browsers and Firefox support that natively. Safari and every other WebKit browser do not, so the components load a polyfill for them themselves, before any of them is defined. You don't import anything for it, and the browser example, the dev tools and this documentation all render in WebKit as well.

**Side note:** they have been checked in WebKit through Playwright, but not yet in Safari itself on a Mac or an iPhone. More about that you can read in [Browser support](/docs/components/browser-support).

Read next: [Your first page](/docs/getting-started/your-first-page)
