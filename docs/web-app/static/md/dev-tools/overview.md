# Overview

<nav is="docs-contents"></nav>

The dev tools are a small web app for working on MuSemantiQ itself: its fonts, its sound fonts and its tests.

## How to Run Them

Run these from the root of the repository. The first time, set the tools up:

```bash
npm run dev-tools:setup
```

- It downloads [nodes](https://github.com/Guseyn/nodes.js), [EHTML](https://github.com/Guseyn/EHTML) and [e-ui](https://github.com/Guseyn/e-ui) from GitHub as zip files, and puts them inside `dev-tools/`. Before downloading, it shows what it's going to download and asks if it's okay. Answer **y** to continue.
- Then it copies `src`, `web-components` and the fonts into the app.
- Run it again after you change `src/` or `web-components/`. Or keep `npm run watch:src` running.

Then start the server:

```bash
npm run dev-tools
```

- The server starts after about five seconds.
- Open https://127.0.0.1:8889. The certificate is only for local development, so the browser warns you once.

If you can't answer the question, for example on CI, you can download the libraries without it:

```bash
npm run dev-tools:download -- --yes
```

![Dev tools](/images/dev-tools/overview.png)

## The Tools

- [Font viewer](/docs/dev-tools/font-viewer): trace a glyph out of a music font, see it in real music, and write it back into the music-js font.
- [Font generator](/docs/dev-tools/font-generator): turn a SMuFL `.otf` into a music-js font.
- [Magenta soundfont generator](/docs/dev-tools/soundfont-generator): render an `.sf2` soundbank into the samples the MIDI player plays.
- [Test viewer](/docs/dev-tools/test-viewer): compare what the last test run produced with the committed baselines, and adopt the new ones.

## Good to Know

- The tools read and write files in your working tree, so every change they make shows up in `git status`.
- They have no login, and some of them write files or start long processes. Run them only on your own machine. The server listens only on **127.0.0.1**.

Read next: [Font viewer](/docs/dev-tools/font-viewer)
