# Import maps and specifiers

Every internal import in the repository goes through a specifier that starts with `#`, like `#msq/drawer/generatedStyles.js`, never through a relative path. A file can then move without every import of it changing, and the same source can be resolved differently in Node, on a page and in a worker.

## 1. The specifiers

This is every specifier in use, and what it resolves to in each of the three environments:

| Specifier | Node | Page | Worker |
| --- | --- | --- | --- |
| `#msq/api.js` | `./src/api.js` | — | `/js/msq/worker/api.js` |
| `#msq/drawer/*` | `./src/drawer/*` | — | `/js/msq/worker/drawer/*` |
| `#msq/midi/*` | `./src/midi/*` | — | `/js/msq/worker/midi/*` |
| `#msq/language/*` | `./src/language/*` | `/js/msq/language/*` | `/js/msq/worker/language/*` |
| `#msq/utils.js` | — | — | `/js/msq/worker/utils.js` |
| `#msq/web-components/*` | — | `/js/msq/web-components/*` | — |
| `#tools/*` | `./tools/*` | — | — |
| `#nodes/*` | `./browser-app/nodes/*` | — | — |
| `#dev-nodes/*` | `./dev-tools/nodes/*` | — | — |
| `#docs-nodes/*` | `./docs/nodes/*` | — | — |
| `#ehtml/`, `#ehtml/main`, `#e-ui/` | — | the dev-tools and docs pages | — |

A dash means the specifier is not declared there, and nothing in that environment imports it. `#msq/utils.js`, for example, is imported only by `src/worker.js`, which never runs in Node.

1. **Node** resolves the `imports` field of `package.json`. These are standard subpath imports, and they apply to every module inside the repository, so the tests, the CLI, the tools and the three servers all use them.
2. **A page** resolves the `<script type="importmap">` in its own HTML. Every page declares only what it loads: the examples app and the landing page map just `#msq/web-components/` and `#msq/language/`, and the dev-tools and docs pages add EHTML and e-ui.
3. **The worker** resolves nothing, because it has no import map. Its tree is written with the specifiers already replaced by URLs.

## 2. The two non-standard keys

`package.json` has two fields of its own, next to `imports`:

```json
"browser.importmap": {
  "#ehtml/": "/js/ehtml/",
  "#e-ui/": "/js/e-ui/",
  "#msq/web-components/": "/js/msq/web-components/",
  "#msq/language/": "/js/msq/language/"
},
"worker.importmap": {
  "#msq": "/js/msq/worker"
}
```

Neither is read by Node or by a browser.

`worker.importmap` is read by `scripts/create-msq-worker.js`, and it is the map the worker tree is rewritten with. It is given without trailing slashes, and the script derives both forms from it, so `#msq/` becomes `/js/msq/worker/`.

`browser.importmap` is a hand-kept copy of the pages' import maps. The one thing that reads it is `updateCacheVersionsInUrls.js` in the vendored `nodes` server, which uses it to resolve specifiers when it stamps cache versions into URLs. At the moment none of the three apps calls that function, so the copy is not used, and nothing keeps it in step with the HTML. The maps that actually take effect are the ones in each HTML page.

## 3. Why the worker tree is rewritten and the language tree is not

`create-msq-worker.js` writes two trees into each app's `static/js/msq/`:

```text
js/msq/worker/     the whole of src/, specifiers rewritten
js/msq/language/   src/language, copied as it is
```

The worker tree has to be rewritten because a module worker gets no import map. The script finds every static `import … from '…'`, every side-effect `import '…'`, every `import('…')` with a string literal and every `export … from '…'`, and replaces a `#msq/…` specifier with its URL. A specifier built at run time is a plain string and is not rewritten, which is why a font config for the browser gives the music `js` tables as URLs like `/js/msq/worker/drawer/font/music-js/bravura.js`, not as `#msq/…`.

The language tree does not need any of that, because the page that loads it has an import map. Nothing in `src/language` imports outside `src/language`, so every specifier in it is a `#msq/language/…` one, and the page's map sends all of them to `/js/msq/language/`. So the page gets the parser exactly as it was written, and the worker gets its own rewritten copy, and neither has to know about the other.

## 4. Adding a new specifier

A new specifier has to be taught to every environment that will import it. You have to remember the following places:

1. **`imports` in `package.json`**, for Node. This is enough for the tests, the CLI and the tools.
2. **`worker.importmap`**, if the worker will import it and it is not under `#msq/`. Anything under `#msq/` is already covered by the one prefix.
3. **the import map of every HTML page** that will import it: `browser-app/web-app/static/html/index.html`, the pages under `dev-tools/web-app/static/html/`, and `docs/web-app/static/html/index.html` and `docs.html`.
4. **`browser.importmap`**, to keep the copy honest.
5. **the static mounts** in the app's `web-app/worker.js`, if the URL is under a folder the server does not serve yet. The examples app, for instance, only serves the folders its `src` regular expression names.

And if the new module is under `src/language`, it may only import from `src/language`, or the unrewritten language tree stops working on the page.

Read next: [Generated versus hand-written](/docs/architecture/generated-vs-hand-written)
