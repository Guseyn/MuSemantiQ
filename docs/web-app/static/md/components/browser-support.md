# Browser support

The components are customized built-in elements: each of them is a `<template>` element extended with `customElements.define(name, Class, { extends: 'template' })` and used as `<template is="msq-svg">`. That is part of the Custom Elements standard, but WebKit has never implemented it, so in Safari the components need a polyfill. The polyfill ships with them, and they load it themselves.

## 1. Chromium and Firefox

Chromium-based browsers (Chrome, Edge and the others) and Firefox implement customized built-in elements natively. Besides that, the components rely on three things that these browsers have had for a long time:

1. import maps, for the `#msq/...` specifiers;
2. module workers, for the engine (`new Worker(url, { type: 'module' })`);
3. shadow DOM, for the rendered element.

## 2. Safari and other WebKit browsers

On its own, Safari, like every browser on iOS that is built on WebKit, leaves `<template is="msq-svg">` a plain `<template>`. It is never upgraded, so it never renders, and since a `<template>` shows nothing, the page simply has a gap where the music should be.

That is what the polyfill for customized built-in elements is for. It is written by Andrea Giammarchi (WebReflection), and a copy of it lives in `web-components/lib/custom-elements-polyfill.js`, so `npm run web-components:update` copies it into every app together with the components. It works by patching `customElements.define`, so to have any effect it has to run **before** any component defines itself.

You don't need to import it yourself, because the components do that. Every component imports `msq-template.js`, the element they are all built on, before it calls `customElements.define`, and the first thing `msq-template.js` imports is `utils/polyfillCustomizedBuiltIns.js`, which loads the polyfill. So all a page needs is the components:

```html
<script type="module">
  import '#msq/web-components/msq-font-loader-template.js'
  import '#msq/web-components/msq-svg-template.js'
</script>
```

It's important to mention that the polyfill is loaded with a check in front of it. The polyfill has no guard against running twice, and in WebKit a second run would wrap `customElements.define` once more over the first. So `polyfillCustomizedBuiltIns.js` looks at `customElements.define` first, and only imports the polyfill while it is still the browser's native function. After the polyfill has run, it is not native any more, so nothing runs a second time. In Chromium and Firefox `define` stays native, and the polyfill sees that the browser already supports customized built-in elements and does nothing.

## 3. Pages that also load EHTML

EHTML carries the very same polyfill, at `third-party/custom-elements-polyfill.js`, and its `main.js` imports it without any check. On a page that loads EHTML the order matters: if the components came first, their copy would run, and then `main.js` would run EHTML's copy over it. So such a page imports EHTML's copy first, by the same URL that `main.js` imports it from:

```html
<script type="module">
  import '#ehtml/third-party/custom-elements-polyfill.js'

  import '#msq/web-components/msq-font-loader-template.js'
  import '#msq/web-components/msq-svg-template.js'

  import '#ehtml/main'
</script>
```

The components then find a `define` that is no longer native and skip their copy, and a module is evaluated once per URL, so when `main.js` imports it later, nothing runs again. Importing `#ehtml/main` alone is not enough, because by the time it runs, the components above it and the e-ui elements (some of which are customized built-ins as well) are already defined.

This documentation and the dev tools do it this way. The browser example and the landing page do not load EHTML, so they simply import the components.

## 4. What is tested

Plainly: nothing here runs in a browser automatically. The test suites (visual, audio and serializer) run in Node and compare what the engine produces with committed files, so the SVG and the MIDI that the components show are tested, byte for byte. The components themselves are not. What they get is the use of the example app, the dev tools and this documentation, in Chromium and Firefox, and a check of all three in WebKit through Playwright, the engine Safari is built on. Safari itself, on a Mac or an iPhone, has not been tried at the moment, so if you need it, try it first.

Read next: [Showdown extensions](/docs/showdown/overview)
