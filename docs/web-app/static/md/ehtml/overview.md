# With EHTML

<nav is="docs-contents"></nav>

> **TO WRITE**
> - what [EHTML](https://github.com/Guseyn/EHTML) is, and `e-markdown`: an element that fetches a markdown file and renders it with showdown
> - together with the [showdown extensions](/docs/showdown/overview), a markdown file with music in it becomes a page with scores, and nothing is built; these docs are made this way

## Setup and a full example

<details is="e-details">
<summary>Setup</summary>

First, download MuSemantiQ and EHTML next to your project. EHTML carries showdown as an ES module, so you don't need to download it separately:

```sh
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
unzip MuSemantiQ.zip
mv MuSemantiQ-main MuSemantiQ
curl -L https://github.com/Guseyn/EHTML/archive/refs/heads/master.zip -o EHTML.zip
unzip EHTML.zip
mv EHTML-master EHTML
```

Then set up the web components and the extensions: the worker, the components, the language, the fonts and `showdown-extensions`:

```sh
cd your-project
mkdir -p static/js/msq
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
rsync -a --delete ../MuSemantiQ/web-components/ static/js/msq/web-components
rsync -a --delete ../MuSemantiQ/src/language/ static/js/msq/language
rsync -a --delete --exclude music-js ../MuSemantiQ/src/drawer/font/ static/font
rsync -a --delete ../MuSemantiQ/showdown-extensions/ static/js/msq/showdown-extensions
```

Copy EHTML into your static `js` folder. It already carries showdown, in `static/js/ehtml/showdown/`:

```sh
rsync -a --delete ../EHTML/src/ static/js/ehtml
```

Finally, create the font config, `static/js/font-config.json`, the same one the web components use:

```json
{
  "chord-letters": {
    "gentium plus": "/font/chord-letters/GentiumPlus-Regular.ttf"
  },
  "text": {
    "noto-serif": {
      "regular": "/font/text/NotoSerif-Regular.ttf",
      "bold": "/font/text/NotoSerif-Bold.ttf"
    }
  },
  "music": {
    "bravura": {
      "font": "/font/music/Bravura.otf",
      "js": "/js/msq/worker/drawer/font/music-js/bravura.js"
    }
  }
}
```

</details>

> **TO WRITE**
> - the full example: a page with one import map for both libraries, the imports in their order, and `e-markdown` inside a font loader

```html
<!-- static/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>A Short Piece</title>
    <script type="importmap">
      {
        "imports": {
          "#ehtml/": "/js/ehtml/",
          "#ehtml/main": "/js/ehtml/main.js",
          "#msq/web-components/": "/js/msq/web-components/",
          "#msq/language/": "/js/msq/language/"
        }
      }
    </script>
    <script type="module">
      import '#ehtml/third-party/custom-elements-polyfill.js'

      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-svg-template.js'
      import '#msq/web-components/msq-midi-template.js'
      import '#msq/web-components/msq-svg-midi-template.js'
      import '#msq/web-components/msq-editor-template.js'

      import msqExtensions from '/js/msq/showdown-extensions/msqExtensions.js'
      window.msqExtensions = msqExtensions

      import '#ehtml/main'
    </script>
  </head>
  <body>
    <template
      is="msq-font-loader"
      data-font-sources-reference="myFonts"
      data-font-config-src="/js/font-config.json"
    >
      <e-markdown
        data-src="/md/page.md"
        data-internal-state="${{ extensions: [ msqExtensions({ fontSources: 'myFonts' }) ] }}"
      ></e-markdown>
    </template>
  </body>
</html>
```

> **TO WRITE**
> - the markdown it fetches, `static/md/page.md`

````markdown
 # A Short Piece

 Here it is:

 ```msq-svg-midi file-name=a-short-piece
 measure
 treble clef
 c d e f
 ```
````

> **TO WRITE**
> - serving `static/` with any static server, and opening the page

```sh
cd static
python3 -m http.server 8080
```

> **TO WRITE**
> - what you get

```msq-svg-midi file-name=a-short-piece
measure
treble clef
c d e f
```

## Elements and imports

> **TO WRITE**
> - EHTML activates the page once `#ehtml/main` runs, and anything inserted later, such as the content of the font loader, is activated as it lands

<h3 is="e-h" id="1-emarkdown">1. e-markdown</h3>

```html
<e-markdown data-src data-internal-state data-actions-on-progress-start data-actions-on-progress-end></e-markdown>
```

<details is="e-details">
<summary>Purpose</summary>

Fetches a markdown file, renders it with showdown and the extensions you give it, and replaces itself with the result. Inside a `msq-font-loader`, it does not even start until the fonts are ready.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-src`: the URL of the markdown file; required, and it can be an expression.

```html
data-src="/md/page.md"
```

`data-internal-state`: an expression whose `extensions` are given to showdown; an expression sees only globals, which is why `msqExtensions` is assigned to `window`.

```html
data-internal-state="${{ extensions: [ msqExtensions({ fontSources: 'myFonts' }) ] }}"
```

`data-actions-on-progress-start`, `data-actions-on-progress-end`: code to run before the file is fetched and after it is rendered.

```html
data-actions-on-progress-end="document.title = document.querySelector('h1').textContent"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- the HTML of the markdown, in its place, with every fence named after a component turned into that component.
- a jump to the heading named in the URL's `#hash`, if there is one, once it is rendered.

</details>

<h3 is="e-h" id="2-the-imports">2. The imports</h3>

```html
<script type="module">
  import '#ehtml/third-party/custom-elements-polyfill.js'
  import '#msq/web-components/msq-font-loader-template.js'
  import '#msq/web-components/msq-svg-midi-template.js'
  import msqExtensions from '/js/msq/showdown-extensions/msqExtensions.js'
  window.msqExtensions = msqExtensions
  import '#ehtml/main'
</script>
```

<details is="e-details">
<summary>Purpose</summary>

Everything the page uses, in the one order that works. Get it wrong and Safari shows you a polite, empty page.

</details>

<details is="e-details">
<summary>Parts</summary>

`custom-elements-polyfill.js`: first, because Safari does not support customized built-in elements, and the polyfill has to run before anything defines one; it is EHTML's copy, so the components and `main.js` find it already loaded and skip theirs.

```js
import '#ehtml/third-party/custom-elements-polyfill.js'
```

`msq-*-template.js`: the components the markdown uses; a component that is not imported stays an invisible `<template>`.

```js
import '#msq/web-components/msq-svg-midi-template.js'
```

`window.msqExtensions`: the extensions, as a global, for `data-internal-state`.

```js
window.msqExtensions = msqExtensions
```

`#ehtml/main`: last, because it activates the page, so everything the page uses has to be defined and assigned by then.

```js
import '#ehtml/main'
```

</details>

<details is="e-details">
<summary>Result</summary>

- a page where every `e-markdown` renders, and every score in it waits for its fonts without any code of yours.

</details>

<h3 is="e-h" id="3-showdownhighlight">3. showdownHighlight</h3>

```js
import showdownHighlight from '#ehtml/showdown/extensions/highlight.js'
window.showdownHighlight = showdownHighlight
```

<details is="e-details">
<summary>Purpose</summary>

Highlights the code blocks of the markdown. It ships with EHTML and goes into the same list as `msqExtensions`, which is what these docs do.

</details>

<details is="e-details">
<summary>Arguments</summary>

`auto_detection`: whether to guess the language of a fence that names none; turn it off if your unnamed fences are MSQ, which it would guess wrong.

```html
data-internal-state="${{ extensions: [ msqExtensions({ fontSources: 'myFonts' }), showdownHighlight({ auto_detection: false }) ] }}"
```

</details>

<details is="e-details">
<summary>Returns</summary>

A showdown extension:

- every fence that names a language, such as `js` or `html`, comes out highlighted; the `msq-*` fences are left to `msqExtensions`.

</details>

Read next: [Browser app](/docs/examples/browser-app)
