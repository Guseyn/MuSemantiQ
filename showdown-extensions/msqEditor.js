import msqElementExtension from './msqElementExtension.js'

/*
```msq-editor blocks become <template is="msq-editor">, which an editor with the score beside it.
fontSources is the reference a msq-font-loader registered its fonts under;
any other option is a default attribute (see msqElementExtension.js).
*/
export default function msqEditor({ fontSources, ...attributes } = {}) {
  return msqElementExtension('msq-editor', { fontSources, ...attributes })
}
