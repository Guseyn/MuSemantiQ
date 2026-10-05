/*
e-ui's tabs and e-details in markdown, with markdown inside them.

Showdown knows none of <e-tabs>, <e-tab> or <details> as a block tag, so each
of those lines comes out wrapped in a paragraph: <p><e-tab data-title="…"></p>.
That is worse than untidy. When the browser meets a block element, or the </p>,
inside such a paragraph, it closes the paragraph and everything opened in it, so
the tab would end where it began and its content would land outside it.

So a page writes each of those tags on a line of its own, between blank lines,
and the markdown between them is parsed as any other:

  <e-tabs>

  <e-tab data-title="Node.js">

  <details is="e-details">
  <summary>Setup</summary>

  …markdown…

  </details>

  </e-tab>

  </e-tabs>

and this takes the paragraphs back off, leaving the tags as written. A
paragraph is unwrapped only when it holds nothing but those tags, a summary
and line breaks, so prose that merely mentions one in backticks is left alone.

e-ui pads the body of a details only when it is a <div>, so the body is wrapped
in one here: it opens after the summary and closes before </details>. Writing
that <div> in the markdown instead would not do: a <div> is a block tag, so
showdown would keep its content as raw HTML, and with markdown="1" it parses
the content in a nested pass that runs the msq extensions again and loses the
examples the outer pass had taken out.
*/
const structuralTag = '<\\/?(?:e-tabs|e-tab|details)\\b[^>]*>|<summary>[^<]*<\\/summary>|<br \\/>'
const paragraphOfStructuralTags = new RegExp(`<p>((?:\\s*(?:${structuralTag}))+)\\s*<\\/p>`, 'g')

export default function eBlocksExtension() {
  return [
    {
      type: 'output',
      filter: (html) => html.replace(
        paragraphOfStructuralTags,
        (whole, tags) => tags
          .replace(/<br \/>/g, '')
          .replace(/<\/summary>/g, '</summary><div>')
          .replace(/<\/details>/g, '</div></details>')
          .trim()
      )
    }
  ]
}
