# Overview

In the browser, the engine runs in a module worker. `src/worker.js` wraps the [low-level API](/docs/api/overview) in a small message protocol. The web components talk to it, and so can your own code: you just need to post the messages below.

## 1. Why a worker at all

Engraving is real work. Parsing a page, laying it out and writing the SVG takes long enough to notice, and the fonts it needs are megabytes of parsed OpenType data. On the main thread that would freeze the page every time a score is drawn: typing in the editor would stutter, and a page with many examples would not scroll until all of them were done.

In a worker it costs the page nothing. The components send the text, carry on, and replace themselves with the score when it arrives. The fonts are loaded and parsed once, inside the worker, and stay there.

## 2. The protocol

Every message is an object with a `name`, an `id`, and the fields that handler needs. There are six handlers:

| Name | Takes | Replies with |
| --- | --- | --- |
| `fonts.setup` | `fontConfig`, `fontSourcesReference` | `status: 'ok'` |
| `glyph.trace` | `fontSourcesReference`, `musicFontName`, `characters`, `musicFontSourceSize`, `intervalBetweenStaveLines` | `points`, `missingCharacters` |
| `svg.generate` | `fontSourcesReference`, `inputText` | `svg`, `svgDataSrc`, `errors` |
| `midi.generate` | `inputText` | `midiDataSrc`, `errors` |
| `svg.midi.generate` | `fontSourcesReference`, `inputText` | `svg`, `svgDataSrc`, `midiDataSrc`, `timeStampsMappedWithRefsOn`, `refsOnMappedWithTimeStamps`, `customStyles`, `errors` |
| `svg.midi.text.generate` | `fontSourcesReference`, `inputText` | the same, plus `highlightsHtmlBuffer` |

1. `fonts.setup` calls `setupFonts(fontConfig)` and keeps the result. `msq-font-loader` sends it.
2. `glyph.trace` traces characters out of a loaded music font, for the font viewer in the dev tools. Characters the font does not have come back in `missingCharacters`, with no points.
3. `svg.generate` parses and engraves one page. `msq-svg` sends it.
4. `midi.generate` parses and performs one page. It is the only one that needs no fonts, so it takes no reference. `msq-midi` sends it.
5. `svg.midi.generate` does both, and adds the maps between ref ids and time stamps. `msq-svg-midi` sends it.
6. `svg.midi.text.generate` does both as well and also returns the highlighted source with ref ids. `msq-editor` sends it when the preview is drawn.

The SVG comes back twice: as markup in `svg`, and as a `data:image/svg+xml;base64,…` URL in `svgDataSrc`. The MIDI comes back only as a base64 data URL, `midiDataSrc`, which a player can take as its source.

Every successful reply has `status: 'ok'` and the `id` it answers. A failure is `{ id, error }`, with a message such as `No inputText provided` or `Font sources cannot be found by reference (…)`. A message with a name the worker does not know throws inside the worker, and nobody gets a reply.

## 3. One worker for the whole page

There is one worker per page, not one per component. `web-components/utils/worker-instance.js` creates it when the module is first imported:

```js
const worker = new Worker(
  new URL('../../worker/worker.js', import.meta.url),
  { type: 'module' }
)

export default worker
```

A module is evaluated once, so every component that imports this gets the same worker. The URL is resolved against the module's own URL, which is what lets the components and the worker tree move together to any mount point.

Since every component posts to the same worker and listens to the same `message` event, replies have to be matched to senders. Each component gets an id from `crypto.randomUUID()` when it is created, sends it with every request, and ignores any reply that carries a different one. This is `requestFromWorker` in `web-components/msq-template.js`:

```js
requestFromWorker({ name, ...payload }) {
  return new Promise((resolve, reject) => {
    const messageHandler = (event) => {
      if (event.data.id !== this.id) {
        return
      }
      worker.removeEventListener('message', messageHandler)
      if (event.data.status === 'ok') {
        resolve(event.data)
        return
      }
      reject(new Error(event.data.error || `worker failed to handle "${name}"`))
    }
    worker.addEventListener('message', messageHandler)
    worker.postMessage({ id: this.id, name, ...payload })
  })
}
```

As you can see, failures are matched on the id too, so an error for one component never reaches another.

## 4. Fonts, by reference

The loaded fonts live in one object inside the worker, keyed by a reference string:

```js
self['__UNILANG_FONT_SOURCES_STORAGE__'] = {}
```

The reference is the `data-font-sources-reference` of an `msq-font-loader`, and every component that engraves names it in `data-font-sources`. That is what `data-font-sources="msqFontSources"` means on every example in these docs. A page can have several loaders with different fonts under different references, and each component picks one.

A reference can be registered only once: a second `fonts.setup` with the same reference replies with `Font sources are already registered under reference (…)`. And nothing is ever removed, so the fonts live as long as the worker, which is as long as the page.

## 5. Why the worker tree is generated

The worker cannot run `src/` as it is. `src/` imports everything through `#msq/…` specifiers, and in the browser those are resolved by an import map. **A module worker gets no import map**: the page's map does not apply inside it, and a worker cannot declare one of its own.

So `scripts/create-msq-worker.js` writes a copy of the whole of `src/` into the folder you give it, with every `#msq/…` specifier rewritten to a relative path:

```sh
node ../MuSemantiQ/scripts/create-msq-worker.js -o static/js/msq/worker
```

The copy has the same layout as `src/`, so a module's path to another module is the same in both, and the folder works wherever you serve it from. That copy is what you start with `new Worker('/js/msq/worker/worker.js', { type: 'module' })`, and what `worker-instance.js` starts for the components. The whole setup is described in [Full setup](/docs/getting-started/full-setup).

Read next: [Web components](/docs/components/overview)
