```js
import fs from 'node:fs'
import {
  setupFonts,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage,
  generateMidiForSinglePage
} from './src/api.js'

// JSON config
// In Node.js, it's optional and we use default one
// In browser, it's required
// More info in docs
const fontConfig = ...
const supportedFontSources = await setupFonts(fontConfig)

const { pageSchema, customStyles, midiSettings, errors } =
  generateIntermediateStructuresForSinglePage({
    pageText: 'treble clef\nc d e f g'
  })

const pageStyles = generateStylesForSinglePage({ customStyles, supportedFontSources })

fs.writeFileSync('score.svg', generateSvgForSinglePage({ pageSchema, pageStyles }))
fs.writeFileSync('score.mid', generateMidiForSinglePage({ pageSchema, midiSettings }).data)
```
