import msqElementExtension from './msqElementExtension.js'

/*
```msq-midi blocks become <template is="msq-midi">, which plays the music, with no score and no fonts.
It needs no fonts, so there is no fontSources option; any other option is a
default attribute (see msqElementExtension.js).
*/
export default function msqMidi(options = {}) {
  return msqElementExtension('msq-midi', options)
}
