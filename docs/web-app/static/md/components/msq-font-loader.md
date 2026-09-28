# msq-font-loader

`msq-font-loader` loads the fonts into the worker and gives them a name that the other components refer to. It draws nothing itself.

Nothing can engrave until it has succeeded: `msq-svg`, `msq-svg-midi` and `msq-editor` all ask the worker for fonts by that name, and the worker has nothing to give them until the loader has finished. `msq-midi` is the only component that does not care, because playback never needs a font.

## 1. A simple loader

Let's start with a simple example. The loader wraps the components that need its fonts:

```html
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
  <template is='msq-svg' data-font-sources='msqFontSources'>
    measure
    treble clef
    c d e f
  </template>
</template>
```

As you can see, the inner component names the fonts it wants with `data-font-sources`, and the value is the same as the loader's `data-font-sources-reference`. What the config itself holds is explained in [Fonts and font config](/docs/components/fonts-and-config).

## 2. The attributes

| Attribute | Required | What it does |
| --- | --- | --- |
| `data-font-sources-reference` | yes | The name the fonts are registered under |
| `data-font-config` | one of the two | The font config, as JSON, inline |
| `data-font-config-src` | one of the two | A URL the font config is fetched from |

You have to give exactly one of `data-font-config` and `data-font-config-src`. Neither is an error, and both is an error too, to avoid confusion about which one is used. With `data-font-config-src`, the response must be successful and must be JSON:

```html
<template
  is='msq-font-loader'
  data-font-sources-reference='msqFontSources'
  data-font-config-src='/js/font-config.json'
>
  <template is='msq-svg' data-font-sources='msqFontSources'>
    measure
    treble clef
    c d e f
  </template>
</template>
```

## 3. It waits, then unwraps

The loader does its work in this order:

1. it reads the config, inline or by fetching it;
2. it sends the config to the worker, which loads every font in it;
3. it replaces itself with its own content.

The last step is what makes the order safe. Anything inside a `<template>` is inert: the components in there are not connected to the page, so they do not start and do not ask the worker for anything. They only become real elements when the loader puts them on the page, and by then the fonts are ready.

It's important to mention that what lands on the page is a **copy** of the loader's content, not the content itself. If you built the loader in script and kept a reference to a node you put inside it, that reference points at a node that never reaches the document:

```js
const loader = document.createElement('template', { is: 'msq-font-loader' })
const marker = document.createElement('div')
loader.content.appendChild(marker)
// Later: `marker` is still in the loader's content, not on the page.
// The node on the page is a copy of it.
```

## 4. The reference is only a name

The reference is a plain string key in the worker. Once the fonts are registered under it, any component inserted into the page later can use it, wherever it is placed, inside the loader or not. The loader is only needed to make sure the first ones do not start too early.

So on a page that inserts content after the fact (a router, a dialog, a list that loads more), the pattern is: render one loader once, put a marker in it, and wait for the marker to appear. The marker is found by attribute, because of the copy described above:

```js
const host = document.querySelector('[data-fonts]')
const loader = document.createElement('template', { is: 'msq-font-loader' })
loader.setAttribute('data-font-sources-reference', 'msqFontSources')
loader.setAttribute('data-font-config', JSON.stringify(config))

const marker = document.createElement('div')
marker.setAttribute('data-fonts-ready', '')
loader.content.appendChild(marker)
host.replaceChildren(loader)

await new Promise((resolve) => {
  new MutationObserver((records, observer) => {
    if (host.querySelector('[data-fonts-ready]')) {
      observer.disconnect()
      resolve()
    }
  }).observe(host, { childList: true, subtree: true })
})

// From here on, any msq element anywhere on the page can use 'msqFontSources'.
```

This is exactly what this documentation does: the loader is rendered once, in a hidden `<div>`, and every example on every page finds the fonts by name. The loader has no event and no promise of its own, so observing the marker is the only way to know it has finished.

**Important note:** a reference can be registered only once. A second loader with the same `data-font-sources-reference` fails, and its content never appears. If you need different fonts on the same page, give the second loader a different reference.

Read next: [msq-svg](/docs/components/msq-svg)
