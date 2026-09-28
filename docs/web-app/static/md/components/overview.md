# Overview

The web components are how MuSemantiQ gets onto a page. You write the music as text inside an element, and the element turns it into a score, a player, or an editor.

There are five of them:

| Component | What it draws | What it needs | What it costs |
| --- | --- | --- | --- |
| `msq-font-loader` | Nothing. It registers fonts, then puts its own content on the page | A font config | Fetches every font in the config, once |
| `msq-svg` | An engraved score with a small toolbar | Fonts | One parse and one engraving |
| `msq-midi` | A MIDI player | No fonts | One parse and one MIDI file, plus the sound font samples |
| `msq-svg-midi` | The score with a player under it, notes highlighting as they sound | Fonts | A parse, an engraving and a MIDI file, plus the samples |
| `msq-editor` | The score, the player and the source you can edit | Fonts | All of the above, and the parser on the page itself for highlighting |

All the heavy work (parsing, engraving, MIDI) happens in one shared web worker, so the page itself stays responsive. The editor is the one exception: it parses what you type on the main thread to colour it, because that has to happen between a keystroke and the next paint. More about that you can read in [The worker](/docs/architecture/the-worker).

## 1. The music is the text content

Every component is a customized built-in `<template>` element: a `<template>` with an `is` attribute. Its text content is the music:

```html
<template is='msq-svg' data-font-sources='msqFontSources'>
  measure
  treble clef
  c d e f
</template>
```

And as a result you get:

<div>
<template is="msq-svg" data-font-sources="msqFontSources">
measure
treble clef
c d e f
</template>
</div>

A `<template>` is a good home for the music, because the browser never renders its content and never runs anything in it. It's important to mention that every line of the text is trimmed before it is parsed, so you can indent the music together with your HTML.

## 2. Each component replaces itself

When a component is upgraded, it sends its text to the worker, builds a `<div>` with an open shadow root out of the answer, and replaces itself with that `<div>`. The `<template>` is gone from the page after that. The `<div>` carries a `data-rendered-by` attribute naming what drew it, for example `data-rendered-by='template[is="msq-svg"]'`, so you can still find it:

```js
const score = document.querySelector('div[data-rendered-by=\'template[is="msq-svg"]\']')
const svg = score.shadowRoot.querySelector('svg')
```

Because everything is inside a shadow root, the styles of your page cannot leak into the score. The only way in is through CSS custom properties set on that `<div>` (see [msq-editor](/docs/components/msq-editor) for the full list).

## 3. The imports and an import map

A page needs the modules of the components it uses, and an import map, because the components import each other through `#msq/...` specifiers rather than relative paths:

```html
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
</script>
```

The first entry is the components themselves. The second one is the language, which only the editor loads on the page, but it is resolved through the same map, so it has to be there. The worker is not in the map at all: a module worker gets no import map, so the components start it by URL, from `../../worker/worker.js` relative to their own folder. You just need to import the modules of the components you use, and every one of them brings along what it needs.

The first import is not a component. It is the polyfill that lets Safari upgrade them, and it has to come before them. More about that you can read in [Browser support](/docs/components/browser-support).

## 4. A component renders once

A component renders exactly once, when it is connected to the page. You cannot give it new music afterwards and ask it to draw again, mostly because there is nothing left to ask: it has already replaced itself with its result. So changing the music means building a fresh element and putting it where the old one was:

```js
const template = document.createElement('template', { is: 'msq-svg' })
template.setAttribute('data-font-sources', 'msqFontSources')
template.innerState = 'measure\ntreble clef\nc d e f'
container.replaceChildren(template)
```

`innerState` is how you give an element its music from script instead of as content. It is read before the text content, so it has to be set before the element is inserted. This is exactly what the dev tools and this documentation do every time they show new music.

Read next: [msq-font-loader](/docs/components/msq-font-loader)
