# Showdown extensions

<nav is="docs-contents"></nav>

> **TO WRITE**
> - what the extensions do: a fenced block named after a component becomes that component, with the music inside it
> - the music never goes through markdown, so blank lines and lines starting with `-` or `#` reach the component as written
> - they do not import showdown, so they work with whichever copy you have, in the browser and in Node.js

## Setup and a full example

<e-tabs data-apply-hash-navigation>

<e-tab data-title="Node.js">

<details is="e-details">
<summary>Setup</summary>

First, download MuSemantiQ and EHTML next to your project. EHTML carries showdown as an ES module, so you don't need to download it separately:

```sh
# download MuSemantiQ as a zip
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
# unpack it
unzip MuSemantiQ.zip
# name the folder MuSemantiQ
mv MuSemantiQ-main MuSemantiQ
# download EHTML as a zip
curl -L https://github.com/Guseyn/EHTML/archive/refs/heads/master.zip -o EHTML.zip
# unpack it
unzip EHTML.zip
# name the folder EHTML
mv EHTML-master EHTML
```

Then copy the extensions and showdown into your project:

```sh
# go to your project
cd your-project
# make the folder for MSQ
mkdir msq
# copy the showdown extensions
rsync -a --delete ../MuSemantiQ/showdown-extensions/ msq/showdown-extensions
# copy showdown out of EHTML
rsync -a --delete ../EHTML/src/showdown/ showdown
```

Finally, mark the package as a module in your `package.json`, because the extensions are ES modules:

```json
{
  "type": "module"
}
```

</details>

> **TO WRITE**
> - the full example: a script that turns a markdown file into HTML, with the components already in it, for example to send the page from your server

```js
// render.js
import fs from 'fs'
// showdown, copied out of EHTML
import * as showdown from './showdown/showdown.js'
// the four msq extensions
import msqExtensions from './msq/showdown-extensions/msqExtensions.js'

// a converter that turns msq fences into elements, with the fonts named myFonts
const converter = new showdown.Converter({
  extensions: [ msqExtensions({ fontSources: 'myFonts' }) ]
})

// read the markdown
const markdown = fs.readFileSync('page.md', 'utf-8')
// convert it
const html = converter.makeHtml(markdown)

// write the HTML, and print it
fs.writeFileSync('page.html', html)
console.log(html)
```

> **TO WRITE**
> - the markdown it reads, `page.md`

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
> - running it

```sh
# run the script from the root of your project
node render.js
```

> **TO WRITE**
> - what you get: the fence is now the element, and the page that serves it needs the [web components](/docs/components/overview) and a font loader with the same reference

```html
<h1 id="ashortpiece">A Short Piece</h1>
<p>Here it is:</p>
<template is="msq-svg-midi" data-font-sources="myFonts" data-file-name="a-short-piece">
measure
treble clef
c d e f
</template>
```

</e-tab>

<e-tab data-title="Browser">

<details is="e-details">
<summary>Setup</summary>

First, download MuSemantiQ and EHTML next to your project. EHTML carries showdown as an ES module, so you don't need to download it separately:

```sh
# download MuSemantiQ as a zip
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
# unpack it
unzip MuSemantiQ.zip
# name the folder MuSemantiQ
mv MuSemantiQ-main MuSemantiQ
# download EHTML as a zip
curl -L https://github.com/Guseyn/EHTML/archive/refs/heads/master.zip -o EHTML.zip
# unpack it
unzip EHTML.zip
# name the folder EHTML
mv EHTML-master EHTML
```

Then set up the web components: the worker, the components, the language and the fonts. More about each step you can read in [Web components](/docs/components/overview):

```sh
# go to your project
cd your-project
# make the folder for MSQ in your static js folder
mkdir -p static/js/msq
# generate the worker: src, with every #msq/… import made relative
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
# copy the components next to the worker
rsync -a --delete ../MuSemantiQ/web-components/ static/js/msq/web-components
# copy the language, which the editor parses with on the page
rsync -a --delete ../MuSemantiQ/src/language/ static/js/msq/language
# copy the font files; the glyph tables are already in the worker
rsync -a --delete --exclude music-js ../MuSemantiQ/src/drawer/font/ static/font
```

Copy the extensions next to them, and showdown:

```sh
# copy the showdown extensions next to the components
rsync -a --delete ../MuSemantiQ/showdown-extensions/ static/js/msq/showdown-extensions
# copy showdown out of EHTML
rsync -a --delete ../EHTML/src/showdown/ static/js/showdown
```

Finally, create the font config, `static/js/font-config.json`. It's the same one the web components use:

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
> - the full example: a page that fetches a markdown file, converts it, and puts the result inside a font loader, so every score waits for its fonts

```html
<!-- static/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>A Short Piece</title>
    <!-- the #msq/… specifiers the components import each other through -->
    <script type="importmap">
      {
        "imports": {
          "#msq/web-components/": "/js/msq/web-components/",
          "#msq/language/": "/js/msq/language/"
        }
      }
    </script>
  </head>
  <body>
    <!-- where the page goes -->
    <article></article>

    <script type="module">
      // the elements the markdown uses
      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-svg-midi-template.js'

      // showdown and the msq extensions
      import * as showdown from '/js/showdown/showdown.js'
      import msqExtensions from '/js/msq/showdown-extensions/msqExtensions.js'

      // a converter that turns msq fences into elements, with the fonts named myFonts
      const converter = new showdown.Converter({
        extensions: [ msqExtensions({ fontSources: 'myFonts' }) ]
      })

      // fetch the markdown
      const markdown = await (await fetch('/md/page.md')).text()

      // a font loader, so every score waits for the fonts
      const loader = document.createElement('template', { is: 'msq-font-loader' })
      loader.setAttribute('data-font-sources-reference', 'myFonts')
      loader.setAttribute('data-font-config-src', '/js/font-config.json')
      // the converted markdown goes inside it
      loader.innerHTML = converter.makeHtml(markdown)
      // put it on the page
      document.querySelector('article').appendChild(loader)
    </script>
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
# serve static/ on port 8080; npx fetches http-server the first time
npx http-server static -p 8080
```

> **TO WRITE**
> - what you get

```msq-svg-midi file-name=a-short-piece
measure
treble clef
c d e f
```

</e-tab>

</e-tabs>

## Extensions

> **TO WRITE**
> - every extension is a function that takes the default attributes and returns what showdown expects in `extensions`

### 1. msqExtensions

```js
import msqExtensions from './msq/showdown-extensions/msqExtensions.js'

msqExtensions({ fontSources, ...attributes })
```

<details is="e-details">
<summary>Purpose</summary>

All four extensions at once: `msq-svg`, `msq-midi`, `msq-svg-midi` and `msq-editor` fences all become their elements. Most pages want this one and nothing else.

</details>

<details is="e-details">
<summary>Arguments</summary>

`fontSources`: the name a `msq-font-loader` registered its fonts under, written as `data-font-sources` on every element except `msq-midi`, which does not need fonts.

```js
{ fontSources: 'myFonts' }
```

`...attributes`: any other default attribute of every element, named without `data-` and in camel case if you like.

```js
{ fontSources: 'myFonts', soundFont: '/magenta-sound-font/FluidR3_GM' }
```

</details>

<details is="e-details">
<summary>Returns</summary>

An array of showdown extensions:

- two per element: a `lang` one that takes the fences out before showdown parses anything, and an `output` one that puts the elements back after.

</details>

### 2. msqSvg, msqMidi, msqSvgMidi, msqEditor

```js
import msqSvg from './msq/showdown-extensions/msqSvg.js'
import msqMidi from './msq/showdown-extensions/msqMidi.js'
import msqSvgMidi from './msq/showdown-extensions/msqSvgMidi.js'
import msqEditor from './msq/showdown-extensions/msqEditor.js'

msqSvg({ fontSources, ...attributes })
msqMidi({ ...attributes })
msqSvgMidi({ fontSources, ...attributes })
msqEditor({ fontSources, ...attributes })
```

<details is="e-details">
<summary>Purpose</summary>

One element each, for a page that should turn only some fences into components and leave the rest alone.

</details>

<details is="e-details">
<summary>Arguments</summary>

`fontSources`: the name a `msq-font-loader` registered its fonts under; `msqMidi` has none.

```js
{ fontSources: 'myFonts' }
```

`...attributes`: any other default attribute of that element.

```js
{ fontSources: 'myFonts', opensWith: 'text' }
```

</details>

<details is="e-details">
<summary>Returns</summary>

An array of showdown extensions:

- the same `lang` and `output` pair as above, for that element only; a `msq-svg` fence is never mistaken for `msq-svg-midi`.

</details>

### 3. The fence

````markdown
 ```msq-editor opens-with=text file-name="a short piece" data-editor-height=320px
 measure
 treble clef
 c d e f
 ```
````

<details is="e-details">
<summary>Purpose</summary>

How a component is written in markdown: the name of the element after the backticks, its attributes after the name, the music inside.

</details>

<details is="e-details">
<summary>Parts</summary>

`msq-editor`: the element; `msq-svg`, `msq-midi`, `msq-svg-midi` or `msq-editor`, and any other name is left to showdown as a plain code block.

```text
msq-svg | msq-midi | msq-svg-midi | msq-editor
```

`opens-with=text`: an attribute, `key=value`, `key="value with spaces"` or a bare `key`, with `data-` added unless it is already there.

```text
opens-with=text  →  data-opens-with="text"
```

The music: exactly what is between the fences, escaped for HTML and nothing else.

```text
measure
treble clef
c d e f
```

</details>

<details is="e-details">
<summary>Becomes</summary>

- one `<template is="…">` with the defaults of the extension, overridden by the attributes of the fence, and the music as its content.

</details>

Read next: [With EHTML](/docs/ehtml/overview)
