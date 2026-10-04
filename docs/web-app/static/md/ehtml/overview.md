# Overview

[EHTML](https://github.com/Guseyn/EHTML) is my library of HTML elements for fetching, templating and actions, and it has `e-markdown`, an element that fetches a markdown file and renders it with showdown. Together with the [showdown extensions](/docs/showdown/overview), a markdown file with music in it becomes a page with scores, and nothing has to be built. These docs are made exactly this way.

## 1. The import map

The page needs one import map for both libraries, because both import their own modules through specifiers:

```html
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
```

## 2. The imports, in order

Then you import everything in one module script. The order is important here:

```html
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
```

You have to remember the following rules:

1. **The polyfill goes first.** Safari does not support customized built-in elements, and the polyfill has to run before anything defines one. EHTML imports it as well, but only when `main.js` runs, which is after the components are defined.
2. **The extensions are a global.** `e-markdown` takes its extensions through `data-internal-state`, which is an expression, and an expression sees only globals.
3. **`#ehtml/main` goes last.** It activates the page, so everything the page uses has to be defined and assigned by then.

## 3. e-markdown inside the font loader

Now let's put `e-markdown` inside an `msq-font-loader`:

```html
<template
  is="msq-font-loader"
  data-font-sources-reference="msqFontSources"
  data-font-config-src="/js/font-config.json"
>
  <e-markdown
    data-src="/md/page.md"
    data-internal-state="${{ extensions: [ msqExtensions({ fontSources: 'msqFontSources' }) ] }}"
  ></e-markdown>
</template>
```

The loader shows its content only when the fonts are ready, so the markdown, and every score in it, waits for them without any code of yours. Then every fence named after a component in `/md/page.md` becomes that component:

````markdown
 ```msq-svg-midi
 measure
 treble clef
 c d e f
 ```
````

And as a result you get:

```msq-svg-midi
measure
treble clef
c d e f
```

The font config is the same one every page with the components needs. More about it you can read in [Fonts and font config](/docs/components/fonts-and-config).

**Side note:** EHTML also carries a showdown extension for highlighting code, `#ehtml/showdown/extensions/highlight.js`. You can pass it to `e-markdown` in the same list, next to `msqExtensions`, which is what these docs do.

Read next: [Browser app](/docs/examples/browser-app)
