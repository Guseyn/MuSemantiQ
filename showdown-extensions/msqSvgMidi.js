import msqElementExtension from './msqElementExtension.js'

/*
```msq-svg-midi blocks become <template is="msq-svg-midi">, which engraves the music and plays it, following along on the score.
fontSources is the reference a msq-font-loader registered its fonts under;
any other option is a default attribute (see msqElementExtension.js).
*/
export default function msqSvgMidi({ fontSources, ...attributes } = {}) {
  return msqElementExtension('msq-svg-midi', { fontSources, ...attributes })
}
