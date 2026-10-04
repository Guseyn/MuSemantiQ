```js
// The worker is the same API, built for the browser by `npm run create:msq:worker`
const worker = new Worker('/js/msq/worker/worker.js', { type: 'module' })

// Every request carries an id, and its answer comes back with the same id
function ask(name, payload) {
  const id = crypto.randomUUID()
  return new Promise((resolve, reject) => {
    worker.addEventListener('message', function answer(event) {
      if (event.data.id !== id) return
      worker.removeEventListener('message', answer)
      event.data.error ? reject(new Error(event.data.error)) : resolve(event.data)
    })
    worker.postMessage({ id, name, ...payload })
  })
}

// JSON config
// When using worker in browser, it's required to declare it
// More info in the docs
const fontConfig = ...
await ask('fonts.setup', { fontConfig, fontSourcesReference: 'fonts' })

const { svg, errors } = await ask('svg.generate', {
  fontSourcesReference: 'fonts',
  inputText: 'treble clef\nc d e f g'
})

const { midiDataSrc } = await ask('midi.generate', { inputText: 'treble clef\nc d e f g' })
```
