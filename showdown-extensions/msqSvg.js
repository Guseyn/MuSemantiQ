import msqElementExtension from './msqElementExtension.js'

/*
```msq-svg blocks become <template is="msq-svg">, which engraves the music as an SVG score.
fontSources is the reference a msq-font-loader registered its fonts under;
any other option is a default attribute (see msqElementExtension.js).
*/
export default function msqSvg({ fontSources, ...attributes } = {}) {
  return msqElementExtension('msq-svg', { fontSources, ...attributes })
}
