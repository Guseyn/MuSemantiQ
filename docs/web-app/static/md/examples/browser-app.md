# Browser app

The browser app is one page that shows the four components that draw something, each with a short piece of music, all under one font loader. It is served by a small HTTP/2 server built on `nodes`, and it is the smallest complete example of the components on a page.

## 1. Running it

From the root of the repository:

```
npm run examples:browser
```

Then open **https://127.0.0.1:8888** in Chrome, Edge, Firefox or Safari. The certificate is a self-signed development one, so the browser warns about it once.

The script does four things in this order:

1. `npm run setup:symlinks` links the fonts and the rendered sound fonts into `static/`;
2. `npm run create:msq:worker` writes the worker tree and the language tree into `static/js/msq/`;
3. `npm run web-components:update` copies the components into `static/js/msq/web-components/`;
4. `node examples/browser/web-app/main.js` starts the server.

It has to be run from the root of the repository, because the paths in `main.js` and in `env/local.json` are relative to the working directory. `ENV` chooses which file under `env/` is read, and it is `local` by default, which is the only one there.

## 2. The folder

```
examples/browser/
  nodes/              the HTTP/2 server library, vendored
  web-app/
    main.js           reads env/<ENV>.json and starts the cluster
    primary.js        the primary process; nothing to do here
    worker.js         the app: what URLs are served from where
    dev-api.js        one endpoint, POST /dev/font-glyph
    restart.js        a helper for restarting the workers one by one
    env/local.json    host, port, certificate paths
    ssl/              the development certificate and key
    static/
      html/           index.html (the page) and 404.html
      font/           links to src/drawer/font/{chord-letters,music,text}
      js/msq/         web-components/, language/, worker/
      magenta-sound-font/   links to the rendered sound fonts
      midi/           two sample .mid files
      sf/             the .sf2 soundbank sound fonts are rendered from
      css/e-ui.css    not used by the page
      images/logo.svg a link to the logo at the root of the repository
```

Not all of it is written by hand. Everything under `static/js/msq/` is generated: `web-components/` is a copy of the top-level `web-components/` folder, `language/` is a copy of `src/language/`, and `worker/` is all of `src/` with its imports rewritten to real URLs. None of it is tracked, so change the originals and run the script again (or keep `npm run watch:src` and `npm run watch:web-components` running while you work). The same goes for `magenta-sound-font/`, `images/logo.svg` and the contents of `sf/`. The font links are the exception: they are committed as links, so a fresh clone has them, and `npm run setup:symlinks` is there to repair them.

`nodes/` is committed too, but it is a copy of a sibling repository, refreshed with `npm run nodes:update` (which `examples:browser` does not run). A local change to it is lost on the next refresh. `dev-api.js` writes a traced glyph back into a music-js table, and nothing on the example page uses it.

## 3. The four examples

The page imports the custom elements polyfill first, so that Safari upgrades the components too, and then all five components. It wraps everything in one `msq-font-loader` with an inline config: **Gentium Plus** for chord letters, **Noto Serif** for text, and **Bravura** and **Leland** for music, registered as `msqFontSources`.

The first three examples play the same six notes, so you can compare what each component does with the same music:

```
a with accent
a
a with accent
a
a with accent
a
```

1. **Score**, `msq-svg`: the engraved score, with the toolbar that downloads it, opens it in a new tab and copies the source.
2. **Playback**, `msq-midi`: only the player. It is the one example without `data-font-sources`, because it needs no fonts.
3. **Score with playback**, `msq-svg-midi`: the score with the player under it, the notes highlighted as they sound.
4. **Editor**, `msq-editor`: a longer piece, the third movement of Kuhlau's Sonatina op. 88 no. 3, on four page lines with two staves, slurs, grace notes and dynamics. Switch to the source, change it, render it again, and navigate between the words and the score with ⌘ or Ctrl held.

As you may notice, the editor's music names no music font, so it is engraved in **Bravura**, the first music font in the config.

## 4. The reference for embedding

Everything the page needs is in `static/html/index.html`: an import map with two entries, one module script with the polyfill and five imports, and one loader. There is no framework, no bundler and no other script. So when you want to put the components on a page of your own, this file is the one to start from, and [Embedding in your own app](/docs/examples/embedding) walks through what to take from it.

Read next: [CLI](/docs/examples/cli)
