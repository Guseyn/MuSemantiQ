# Web components

<nav is="docs-contents"></nav>

> **TO WRITE**
> - what the web components are: MSQ written inside an element becomes a score, a player or an editor
> - every one is a `<template>` with an `is` attribute, and all the heavy work happens in one shared worker

## Setup and a full example

<details is="e-details">
<summary>Setup</summary>

First, download MuSemantiQ next to your project:

```sh
# download MuSemantiQ as a zip
curl -L https://github.com/Guseyn/MuSemantiQ/archive/refs/heads/main.zip -o MuSemantiQ.zip
# unpack it
unzip MuSemantiQ.zip
# name the folder MuSemantiQ
mv MuSemantiQ-main MuSemantiQ
```

Then generate the worker, which the components talk to:

```sh
# go to your project
cd your-project
# make the folder for MSQ in your static js folder
mkdir -p static/js/msq
# generate the worker: src, with every #msq/… import made relative
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
```

Copy `web-components` next to the worker. The components start it from `../../worker/worker.js`, relative to their own folder, so the two folders have to stay side by side:

```sh
# copy the components next to the worker
rsync -a --delete ../MuSemantiQ/web-components/ static/js/msq/web-components
```

Copy `language` next to them as well. The editor parses on the page itself, to colour what you type:

```sh
# copy the language, which the editor parses with on the page
rsync -a --delete ../MuSemantiQ/src/language/ static/js/msq/language
```

Copy the font files. The glyph tables are already in the worker, under `drawer/font/music-js/`:

```sh
# copy the font files; the glyph tables are already in the worker
rsync -a --delete --exclude music-js ../MuSemantiQ/src/drawer/font/ static/font
```

Finally, add an import map to your page, because the components import each other and the language through `#msq/…` specifiers:

```html
<!-- the #msq/… specifiers the components import each other through -->
<script type="importmap">
  {
    "imports": {
      "#msq/web-components/": "/js/msq/web-components/",
      "#msq/language/": "/js/msq/language/"
    }
  }
</script>
```

</details>

> **TO WRITE**
> - the full example: a page with a font loader and an editor inside it
> - the font config it points at, served as a file, `static/js/font-config.json`

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
    <!-- define the elements this page uses -->
    <script type="module">
      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-editor-template.js'
    </script>
  </head>
  <body>
    <!-- load the fonts under the name myFonts, then show what is inside -->
    <template
      is="msq-font-loader"
      data-font-sources-reference="myFonts"
      data-font-config-src="/js/font-config.json"
    >
      <!-- an editor that waits for those fonts -->
      <template is="msq-editor" data-font-sources="myFonts" data-file-name="a-short-piece">
        title is "A Short Piece"

        measure
        treble clef
        c d e f
      </template>
    </template>
  </body>
</html>
```

> **TO WRITE**
> - serving `static/` with any static server, and opening the page

```sh
# serve static/ with any static server
cd static
python3 -m http.server 8080
```

> **TO WRITE**
> - what you get

```msq-editor file-name=a-short-piece
title is "A Short Piece"

measure
treble clef
c d e f
```

## Elements

> **TO WRITE**
> - each element renders once: it sends its text to the worker and replaces itself with a `<div data-rendered-by>` that holds the result in an open shadow root
> - a mistake in the music is listed in a panel inside the element; a mistake in the setup leaves the element invisible and goes to the console

### 1. msq-font-loader

```html
<template is="msq-font-loader" data-font-sources-reference data-font-config data-font-config-src>
  …elements that need the fonts…
</template>
```

<details is="e-details">
<summary>Purpose</summary>

Loads the fonts into the worker under a name, then puts its own content on the page. It draws nothing itself; its whole job is to make the others wait.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-font-sources-reference`: the name the fonts are registered under; required, and a name can be registered only once per page.

```html
data-font-sources-reference="myFonts"
```

`data-font-config`: the font config, inline, as JSON; give this or `data-font-config-src`, not both.

```html
data-font-config='{ "chord-letters": {…}, "text": {…}, "music": {…} }'
```

`data-font-config-src`: a URL the font config is fetched from, which must answer successfully with JSON.

```html
data-font-config-src="/js/font-config.json"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- its own content, as a copy, once every font has loaded; until then nothing inside it starts, because the content of a `<template>` is inert.

</details>

### 2. msq-svg

```html
<template is="msq-svg" data-font-sources data-file-name>
  …MSQ…
</template>
```

<details is="e-details">
<summary>Purpose</summary>

Engraves the music as an SVG score, and nothing else. It is the cheapest of the components that engrave, since it loads no player and no sound font.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-font-sources`: the name a `msq-font-loader` registered its fonts under; required.

```html
data-font-sources="myFonts"
```

`data-file-name`: the name of the downloaded file, without the extension; a random id by default.

```html
data-file-name="a-short-piece"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- the score.
- a toolbar, on hover or focus: download the SVG, open it in a new tab, copy the MSQ.
- an errors panel under the score, only when the parser had something to report.

</details>

### 3. msq-midi

```html
<template is="msq-midi" data-sound-font data-file-name>
  …MSQ…
</template>
```

<details is="e-details">
<summary>Purpose</summary>

Turns the music into a MIDI file and gives you a player for it. It draws no score, so it is the one component that needs no fonts and no loader.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-sound-font`: the URL of a Magenta-format sound font; empty means Magenta's own, from `storage.googleapis.com`.

```html
data-sound-font="/magenta-sound-font/FluidR3_GM"
```

`data-file-name`: the name of the downloaded MIDI file, without the extension; a random id by default.

```html
data-file-name="a-short-tune"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- a player: play and stop, the elapsed and the total time, and a seek bar; only one player on a page plays at a time.
- two buttons beside it: download the MIDI file, copy the MSQ.
- an errors panel, only when the parser had something to report.

</details>

### 4. msq-svg-midi

```html
<template is="msq-svg-midi" data-font-sources data-highlight-color data-sound-font data-file-name>
  …MSQ…
</template>
```

<details is="e-details">
<summary>Purpose</summary>

The score with a player under it, each note highlighted while it sounds. Click a note in the score and the player jumps to it.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-font-sources`: the name a `msq-font-loader` registered its fonts under; required.

```html
data-font-sources="myFonts"
```

`data-highlight-color`: the colour of a note while it sounds; **#C40233** by default.

```html
data-highlight-color="#1f7a8c"
```

`data-sound-font`: the URL of a Magenta-format sound font, as in `msq-midi`.

```html
data-sound-font="/magenta-sound-font/FluidR3_GM"
```

`data-file-name`: the name of both downloaded files, without the extension; a random id by default.

```html
data-file-name="two-staves"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- the score, with the same toolbar as `msq-svg`.
- the player, with the same buttons as `msq-midi`.
- an errors panel, only when the parser had something to report.

</details>

### 5. msq-editor

```html
<template
  is="msq-editor"
  data-font-sources
  data-opens-with
  data-file-name
  data-highlight-color
  data-sound-font
  data-editor-height
  data-editor-font-family
  data-editor-font-size
  data-editor-font-src
  data-navigation-highlight-color
>
  …MSQ…
</template>
```

<details is="e-details">
<summary>Purpose</summary>

The score, the player and the source you can edit and render again, in one element. It is the only one that parses on the page itself, to colour what you type between a keystroke and the next paint.

</details>

<details is="e-details">
<summary>Attributes</summary>

`data-font-sources`: the name a `msq-font-loader` registered its fonts under; required.

```html
data-font-sources="myFonts"
```

`data-opens-with`: which view shows first, **score** or **text**; **score** by default.

```html
data-opens-with="text"
```

`data-file-name`: the name of the downloaded SVG and MIDI files, without the extension; a random id by default.

```html
data-file-name="editor-example"
```

`data-highlight-color`: the colour of a note while it sounds; **#C40233** by default.

```html
data-highlight-color="#1f7a8c"
```

`data-sound-font`: the URL of a Magenta-format sound font, as in `msq-midi`.

```html
data-sound-font="/magenta-sound-font/FluidR3_GM"
```

`data-editor-height`: the height the source view falls back to; **270px** by default, and an editor that opens on the text fits its text instead.

```html
data-editor-height="320px"
```

`data-editor-font-family`: the font of the source, which must be monospace, or the colours drift away from the letters.

```html
data-editor-font-family="'JetBrains Mono', monospace"
```

`data-editor-font-size`: the size of that font; **1em** by default.

```html
data-editor-font-size="0.9em"
```

`data-editor-font-src`: the URL of a font file for the first family in `data-editor-font-family`.

```html
data-editor-font-src="/font/JetBrainsMono-Regular.ttf"
```

`data-navigation-highlight-color`: the colour of the box that links a word in the source to what it drew; **#f5cd79** by default.

```html
data-navigation-highlight-color="#f5cd79"
```

</details>

<details is="e-details">
<summary>Renders</summary>

- the score, the player and the errors panel, as in `msq-svg-midi`.
- the source view, with line numbers, colours and suggestions as you type.
- a toolbar: download the SVG, edit or render, copy the MSQ, and the settings of this one element.
- the links between the two views: hold **⌘** or **Ctrl** and click a word to see what it drew, or click a glyph to see the words that drew it.

</details>

### 6. innerState

```js
template.innerState = 'measure\ntreble clef\nc d e f'
```

<details is="e-details">
<summary>Purpose</summary>

Gives an element its music from script instead of as its content, so nothing in the music is parsed as HTML on the way. Set it before the element is inserted, since an element renders once, when it is connected.

</details>

<details is="e-details">
<summary>Value</summary>

`innerState`: the MSQ text; it is read before the text content.

```js
const template = document.createElement('template', { is: 'msq-svg' })
template.setAttribute('data-font-sources', 'myFonts')
template.innerState = 'measure\ntreble clef\nc d e f'
container.replaceChildren(template)
```

</details>

<details is="e-details">
<summary>Result</summary>

- the same element as if the music had been written inside it; to show different music, build a fresh one.

</details>

### 7. Custom properties

```css
div[data-rendered-by='template[is="msq-editor"]'] {
  --surface-bg: #fbfaf7;
  --border-radius: 0.5em;
}
```

<details is="e-details">
<summary>Purpose</summary>

Styles a rendered element from your own CSS. The element lives in a shadow root, so your page's styles cannot leak in, and custom properties are the one door left open.

</details>

<details is="e-details">
<summary>Properties</summary>

`--border-color`, `--border-radius`, `--surface-bg`: the border, the corners and the background of the element; **#c0c0c0**, **1em** and **#fff** by default.

```css
--border-color: #c0c0c0; --border-radius: 1em; --surface-bg: #fff;
```

`--font-color`, `--muted-font-color`: the text of the settings and the errors panel, and the quieter text such as line numbers; **#121212** and **#4c5866** by default.

```css
--font-color: #121212; --muted-font-color: #4c5866;
```

`--error-color`, `--error-bg`: the heading and the background of the errors panel; **#c40233** and **#fdf3f5** by default.

```css
--error-color: #c40233; --error-bg: #fdf3f5;
```

`--editor-font-family`, `--editor-font-size`, `--editor-line-height`, `--editor-font-color`, `--editor-height`: the source view of `msq-editor`; an attribute that sets the same thing wins over your CSS.

```css
--editor-font-size: 1em; --editor-line-height: 1.4em; --editor-font-color: #1f2d3a; --editor-height: 270px;
```

`--navigation-highlight-color`: the box that links a word to what it drew; **#f5cd79** by default.

```css
--navigation-highlight-color: #f5cd79;
```

</details>

<details is="e-details">
<summary>Result</summary>

- the rendered element in your colours; the score itself is coloured from the music, with the [colour styles](/docs/language/colours).

</details>

Read next: [Showdown extensions](/docs/showdown/overview)
