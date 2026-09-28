# Embedding in your own app

The components need no build step and no framework, so putting them into your own app is a matter of serving a few folders and writing a few lines of HTML. This page is about what those are.

## 1. The minimum a page needs

A host page needs three things, in this order:

1. **the import map**, with the two entries the components import through;
2. **the imports**: first the custom elements polyfill, so that Safari upgrades the components too (see [Browser support](/docs/components/browser-support)), then the components you use;
3. **a font loader**, with the components that engrave inside it.

That's all. Everything else (the worker, the player, the parser for the editor) is loaded by the components themselves.

## 2. Serving the three trees

The components expect to find three folders next to each other under `/js/msq/`:

```
<your static folder>/js/msq/
  web-components/   the components
  language/         the parser, for the editor on the page
  worker/           the whole engine, for the worker
```

You have to remember the following rules:

1. `worker/` must be served at exactly `/js/msq/worker/`. A module worker gets no import map, so `npm run create:msq:worker` rewrites every import in it to a real URL, and that URL comes from `worker.importmap` in `package.json`: `/js/msq/worker`. To serve it anywhere else, change that value and generate the tree again.
2. `web-components/` and `worker/` must be siblings, because the components start the worker from `../../worker/worker.js`, relative to their own files.
3. `language/` can be anywhere, as long as the import map points `#msq/language/` at it.
4. The `.js` files must be served with a JavaScript content type, because the browser refuses to run a module or a module worker otherwise.

The scripts of this repository write these trees only into its own three apps. The simplest way to get them for yours is to run `npm run create:msq:worker` and `npm run web-components:update`, and copy `examples/browser/web-app/static/js/msq/` into your static folder as `js/msq/`. Or take them from the sources: `web-components/` and `language/` are copied as they are, from `web-components/` and `src/language/`, and only `worker/` has to be generated. Copy them again whenever you update MuSemantiQ.

You also need the fonts. The font files are in `src/drawer/font/chord-letters`, `src/drawer/font/music` and `src/drawer/font/text`; serve them wherever you like, and write those URLs into your font config. The glyph tables for the music fonts are already inside the worker tree, at `/js/msq/worker/drawer/font/music-js/`. More about the config you can read in [Fonts and font config](/docs/components/fonts-and-config).

## 3. A copy-paste starting point

Let's put all of it together. This page assumes the three trees under `/js/msq/`, and the font files under `/font/`, exactly as the example app serves them:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My score</title>
    <script type="importmap">
      {
        "imports": {
          "#msq/web-components/": "/js/msq/web-components/",
          "#msq/language/": "/js/msq/language/"
        }
      }
    </script>
    <script type="module">
      import '#msq/web-components/lib/custom-elements-polyfill.js'

      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-svg-template.js'
      import '#msq/web-components/msq-svg-midi-template.js'
    </script>
  </head>
  <body>
    <template
      is='msq-font-loader'
      data-font-sources-reference='msqFontSources'
      data-font-config='{
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
      }'
    >
      <template is='msq-svg-midi' data-font-sources='msqFontSources'>
        measure
        treble clef
        c d e f
      </template>
    </template>
  </body>
</html>
```

Everything you put inside the loader appears when the fonts are ready: scores, players, and any HTML of your own around them.

## 4. Inside a framework that owns the DOM

A framework that renders the page from its own state (React, Vue, Svelte and the others) expects the nodes it created to stay where it put them. A component does not: it removes its `<template>` and puts a `<div>` in its place. So don't let the framework render the `<template>` itself. Instead:

1. Let the framework render an **empty container** and never render any children into it.
2. **Register the fonts once**, for the whole life of the page, with the marker pattern from [msq-font-loader](/docs/components/msq-font-loader), and wait for it before showing any music.
3. **Create the component from script**, give it the music with `innerState`, and put it into the container:

```js
function showMusic(container, music) {
  const template = document.createElement('template', { is: 'msq-svg-midi' })
  template.setAttribute('data-font-sources', 'msqFontSources')
  template.innerState = music
  container.replaceChildren(template)
}
```

4. When the music changes, call it again. A component renders once, so a fresh one is the only way to show new music, and `replaceChildren` takes the old one away.

This is exactly what the dev tools do every time they show new music.

Read next: [Overview](/docs/dev-tools/overview)
