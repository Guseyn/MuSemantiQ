# No build

MuSemantiQ has no build step. There is no bundler and no transpiler, and `package.json` has no dependencies and exactly one dev dependency, **c8**, which measures test coverage. The code you read in `src/` is the code Node runs and the code the browser runs.

## 1. Why

I don't want anything between the code I write and the code that runs. With no build, a stack trace points at the line I wrote, a change is visible on the next reload, and there is no configuration of a tool to keep working across its own major versions. The platform already has everything this needs: ES modules in Node and in every browser, subpath imports, import maps and module workers.

And there is nothing to install. A fresh clone runs the tests with `npm run test:all` and nothing else, because the third-party code the engine needs is [vendored](/docs/architecture/vendoring) into the repository.

## 2. What replaces a build

Three scripts do the part of a build that the browser really needs, which is putting files where an app can serve them:

| Script | Command | What it does |
| --- | --- | --- |
| `scripts/create-msq-worker.js` | `npm run create:msq:worker` | writes `src/` into each app's `static/js/msq/worker/` with the specifiers rewritten, and `src/language` into `static/js/msq/language/` as it is |
| `scripts/copy-web-components.js` | `npm run web-components:update` | copies `web-components/` into each app's `static/js/msq/web-components/`, and deletes anything there that is no longer in the source |
| `scripts/setup-symlinks.js` | `npm run setup:symlinks` | links each app's `static/font/` to `src/drawer/font/`, its `images/logo.svg` to the logo, and every rendered sound bank into `static/magenta-sound-font/` |

None of them transforms code, except for the one rewrite of import specifiers. They copy and they link. `npm run browser-app`, `npm run dev-tools` and `npm run docs` run all three before starting the server, and `setup:symlinks` also runs on `npm install`.

While working, two watchers keep the copies current: `npm run watch:src` reruns `create-msq-worker.js` when a `.js` file under `src/` changes, and `npm run watch:web-components` does the same for the components.

## 3. Specifiers in Node and in the browser

Internal imports never use relative paths. They use specifiers like `#msq/drawer/generatedStyles.js`, and each environment resolves them its own way:

1. **Node** reads the `imports` field of `package.json`, which maps `#msq/drawer/*` to `./src/drawer/*` and so on. These are standard subpath imports.
2. **The page** reads a `<script type="importmap">` in its HTML, which maps `#msq/web-components/` and `#msq/language/` to URLs under `/js/msq/`.
3. **The worker** has no import map at all, so its copy of `src/` has the specifiers already rewritten to URLs.

The details are in [Import maps and specifiers](/docs/architecture/import-maps).

## 4. The honest cost

No build is not free, and it's important to say what it costs:

1. **Generated trees.** Every app has `static/js/msq/` with two or three generated copies inside. They are not tracked, so a fresh clone has to run the scripts before an app can start, which is why every app's npm script runs them first.
2. **A copy step.** An edit to `src/` or `web-components/` is not live in an app until the copy is refreshed. If you forget the watcher, the browser runs yesterday's code without any warning.
3. **More than one place for a specifier.** A specifier is declared in `package.json` for Node and in the import map of every HTML page for the browser, and the worker's specifiers come from yet another field, `worker.importmap`. Nothing checks that they agree. A specifier that works in the tests can still fail in the browser, and the other way round.

I find this a good trade: these are a few scripts I can read in a few minutes, rather than a toolchain I have to trust.

Read next: [Import maps and specifiers](/docs/architecture/import-maps)
