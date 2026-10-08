# Browser App

<nav is="docs-contents"></nav>

The browser app is one page with all the web components on it: a score, a player, a score with a player, and an editor. It runs on [nodes](https://github.com/Guseyn/nodes.js).

## Setup

Run it from the root of the repository, once, and again after you change `src/` or `web-components/`:

```sh
# copy the engine, the components and the fonts into the app
npm run browser-app:setup
```

It does three things:

- links the fonts into `static/font/`
- copies `src/` into `static/js/msq/worker/` and `src/language/` into `static/js/msq/language/`
- copies `web-components/` into `static/js/msq/web-components/`

If you change `src/` or `web-components/` a lot, you can run `npm run watch:src` and `npm run watch:web-components`.

## Running

```sh
# start the server
npm run browser-app
```

Then open https://127.0.0.1:8888.

- The certificate is a self-signed development one, so the browser warns about it once.
- It must be run from the root of the repository, because the paths in `main.js` and `env/local.json` are relative to it.

## Structure

```
browser-app/
  nodes/                  the server library, a copy of nodes
  web-app/
    main.js               reads env/local.json and starts the server
    primary.js            the primary process, empty
    worker.js             which URLs are served from which folders
    restart.js            restarts the workers one by one
    env/local.json        host, port and certificate paths
    ssl/                  the development certificate and key
    static/
      html/index.html     the page
      css/app.css         the styles of the page
      font/               links to the fonts in src/drawer/font/
      js/msq/             worker/, language/ and web-components/, made by the setup
      magenta-sound-font/ links to the sound fonts
      midi/               two sample MIDI files
```

- Everything in `static/js/msq/` is made by `npm run browser-app:setup`, and it's not tracked by git. If you want to modify something in the code, change `src/` and `web-components/` instead and when run `npm run browser-app:setup` again or use file watchers (`npm run watch:src` and `npm run watch:web-components`).
- `nodes/` is in git, but it's a copy of [nodes](https://github.com/Guseyn/nodes.js), refreshed with `npm run nodes:update`. Don't change it here.

Read next: [CLI](/docs/examples/cli)
