/*
```mermaid fences as <docs-diagram>, which draws them (see docs-diagram.js).

The source has to reach Mermaid exactly as written, and markdown would not leave
it alone: `-->` and `[…]` are markdown too, and blank lines would split it. So
it is kept out of markdown the way the msq extensions keep the music out: the
`lang` filter, which runs before showdown parses anything, takes every such
fence out and leaves a placeholder; the `output` filter puts the element in
its place.
*/
const fence = /^(`{3,}|~{3,})[ \t]*mermaid[ \t]*\n([\s\S]*?)\n?\1[ \t]*$/gm
const placeholder = /(?:<p>)?docsdiagram(\d+)end(?:<\/p>)?/g

export default function diagramExtension() {
  // Filled by `lang` and emptied by `output`, once per makeHtml call
  let diagrams = []

  return [
    {
      type: 'lang',
      filter: (text) => {
        diagrams = []
        return text.replace(fence, (whole, ticks, source) => {
          diagrams.push(`<docs-diagram>${escapedHtml(unescapedByShowdown(source))}</docs-diagram>`)
          return `\n\ndocsdiagram${diagrams.length - 1}end\n\n`
        })
      }
    },
    {
      type: 'output',
      filter: (html) => {
        const rendered = html.replace(placeholder, (whole, index) => diagrams[Number(index)] ?? whole)
        diagrams = []
        return rendered
      }
    }
  ]
}

// Showdown escapes `¨` and `$` before any `lang` filter runs, and undoes it only for what it renders
function unescapedByShowdown(text) {
  return text.replace(/¨D/g, '$').replace(/¨T/g, '¨')
}

function escapedHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
