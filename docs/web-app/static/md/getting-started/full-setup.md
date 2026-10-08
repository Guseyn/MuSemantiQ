# Full setup

<nav is="docs-contents"></nav>

## Folder Structure

```txt
├── browser-app
├── cli-app
├── coverage
├── dev-tools
├── docs
├── primary.pid
├── scripts
├── showdown-extensions
├── src
├── test
├── tools
└── web-components
```

The `src` folder contains everything that MSQ needs to function: the SVG drawer, the language parser and the MIDI generator. It also has `api.js` for synchronous usage, and `worker.js` if you don't want to block your main thread (used only in the browser).

We don't need NPM, and we don't need build scripts or pipelines. Everything is based on good old copy-paste. Depending on the environment, you just need to copy folders into the correct locations in your program, and you can start using MSQ as it is. That's the power of a dynamic language such as JavaScript.

As a first step, just download the project to your local system, next to your own project:

```sh
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
unzip MuSemantiQ.zip
mv MuSemantiQ-main MuSemantiQ
```

And then, depending on how you decide to work with this toolkit, follow the steps described below.

## Natively in Node.js

1. Copy `src` from `MuSemantiQ` as the `msq` folder in your project:
```sh
cd your-project
mkdir msq
rsync -a --delete ../MuSemantiQ/src/ msq/
```

2. Add the imports to your `package.json`, and mark the package as a module:
```json
"type": "module",
"imports": {
  "#msq/drawer/*": "./msq/drawer/*",
  "#msq/language/*": "./msq/language/*",
  "#msq/midi/*": "./msq/midi/*",
  "#msq/api.js": "./msq/api.js"
}
```
This allows the imports to resolve properly in your project.

**Important note:** `setupFonts()` without a config looks for the fonts in `./src/drawer/font/`, which exists only in `MuSemantiQ` itself. In your project, pass it a font config with the paths in `./msq/drawer/font/` (see [setupFonts](/docs/api/overview#1-setupfonts)).

3. Follow [Low-Level API](/docs/api/overview).

## In browser, without Worker

**Important note:** this is not the recommended way. Everything runs on the main thread, so the page freezes while the fonts load and while a score is engraved. Use it only when a worker is not an option.

1. Copy `src` from `MuSemantiQ` into your static `js` folder:
```sh
cd your-project
mkdir -p static/js/msq
rsync -a --delete ../MuSemantiQ/src/ static/js/msq/src
```

2. Add an import map to your page, before any module script:
```html
<script type="importmap">
  {
    "imports": {
      "#msq/": "/js/msq/src/"
    }
  }
</script>
```
This is what lets the `#msq/…` imports inside `src` resolve in the browser. The fonts are in the copy too, under `/js/msq/src/drawer/font/`.

3. Follow [Low-Level API](/docs/api/overview#browser), the **Browser** tab.

## In browser via Worker

1. Create the `msq` folder in your static `js` folder:
```sh
cd your-project
mkdir -p static/js/msq
```

2. Run the script:
```sh
# you're in the root folder of your-project
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
```
It copies the whole `src` from the `MuSemantiQ` folder and adjusts all the imports, so that you can use the worker:

```js
const worker = new Worker('/js/msq/worker/worker.js', { type: 'module' })
```

3. Follow [Worker API](/docs/worker/overview).

## Web Components

In order to use the native web components, we still need to set up our worker:

1. Create the `msq` folder in your static `js` folder:
```sh
cd your-project
mkdir -p static/js/msq
```

2. Run the script:
```sh
# you're in the root folder of your-project
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
```

3. Copy `web-components` along with your worker:
```sh
# you're in the root folder of your-project
rsync -a --delete ../MuSemantiQ/web-components/ static/js/msq/web-components
```

4. Copy `language` along with your worker:
```sh
# you're in the root folder of your-project
rsync -a --delete ../MuSemantiQ/src/language/ static/js/msq/language
```

5. Follow [Web components' API](/docs/components/overview).

## Showdown

1. Follow steps 1-4 from the previous section, **Web Components**.
2. Copy `showdown-extensions` along with your worker:
```sh
# you're in the root folder of your-project
rsync -a --delete ../MuSemantiQ/showdown-extensions/ static/js/msq/showdown-extensions
```
3. Follow [Showdown extensions' API](/docs/showdown/overview).

## With EHTML (e-markdown)

1. Follow steps 1-2 from the previous section, **Showdown**.
2. Download EHTML next to `MuSemantiQ`:
```sh
curl -L https://github.com/Guseyn/EHTML/archive/refs/heads/master.zip -o EHTML.zip
unzip EHTML.zip
mv EHTML-master EHTML
```
3. Copy EHTML's `src` into your static `js` folder:
```sh
# you're in the root folder of your-project
rsync -a --delete ../EHTML/src/ static/js/ehtml
```
EHTML already carries showdown, in `static/js/ehtml/showdown/`, so you don't need to download it separately.

4. Follow [With EHTML](/docs/ehtml/overview).

Read next: [Where to go next](/docs/getting-started/where-to-go-next)
