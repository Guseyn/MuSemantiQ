```js
import msqExtensions from './showdown-extensions/msqExtensions.js'

const converter = new showdown.Converter({
  extensions: [ msqExtensions({ fontSources: 'fonts' }) ]
})

// ```msq-svg, ```msq-midi, ```msq-svg-midi and ```msq-editor fences
// become the elements, and the music in them never goes through markdown
element.innerHTML = converter.makeHtml(markdown)
```
