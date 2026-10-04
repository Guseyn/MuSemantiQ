/*
Every markdown table as e-ui's <table is="e-table">, so the tables in the docs
look like the tables in the dev tools, and no page has to write one as HTML to
get that.

Showdown writes a table as a bare <table>, so the attribute is added to its
output. It sits in a <div data-table>, which docs.css lets scroll sideways:
a table with a long row would otherwise widen the whole page on a phone.

e-table is styling only; there is no element to define, so the attribute is
all it takes.
*/
export default function eTableExtension() {
  return [
    {
      type: 'output',
      filter: (html) => html
        .replace(/<table>/g, '<div data-table><table is="e-table">')
        .replace(/<\/table>/g, '</table></div>')
    }
  ]
}
