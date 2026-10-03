import msqSvg from './msqSvg.js'
import msqMidi from './msqMidi.js'
import msqSvgMidi from './msqSvgMidi.js'
import msqEditor from './msqEditor.js'

/*
All four at once, for a page that shows every kind of example:

  new showdown.Converter({ extensions: [ msqExtensions({ fontSources: 'msqFontSources' }) ] })

msq-midi takes no fonts, so fontSources is given only to the others.
*/
export default function msqExtensions({ fontSources, ...attributes } = {}) {
  return [
    ...msqSvg({ fontSources, ...attributes }),
    ...msqMidi(attributes),
    ...msqSvgMidi({ fontSources, ...attributes }),
    ...msqEditor({ fontSources, ...attributes })
  ]
}
