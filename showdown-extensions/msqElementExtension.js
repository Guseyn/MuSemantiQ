/*
A showdown extension that turns a fenced block named after a msq element into
that element:

  ```msq-editor opens-with=text file-name="a short piece"
  chord
  c e g
  ```

becomes

  <template is="msq-editor" data-font-sources="…" data-opens-with="text" data-file-name="a short piece">
  chord
  c e g
  </template>

Words after the element's name are its attributes: `key=value`, `key="value
with spaces"`, or a bare `key` for an empty one. `data-` is added unless it is
already there. The options given when the extension is made (fontSources, and
any other attributes) are the defaults, which the fence can override.

The music has to reach the element exactly as written, and markdown would not
leave it alone: blank lines split it into paragraphs, and lines starting `-`,
`#` or `1.` are eaten. So it never goes through markdown at all. The `lang`
filter, which runs before showdown parses anything, takes every such fence out
and leaves a placeholder; the `output` filter, which runs after, puts the
element in the placeholder's place. Anything else fenced, including a fence
that only shows msq markup (```html), is left to showdown.

These extensions do not import showdown: they are plain objects showdown
calls, so a page or a Node script can pass them to whichever copy it has.
*/

export default function msqElementExtension(elementName, defaultAttributes = {}) {
  const marker = `${elementName.replace(/[^a-z]/g, '')}example`
  const placeholder = new RegExp(`(?:<p>)?${marker}(\\d+)end(?:</p>)?`, 'g')
  // The element's own name and nothing longer: msq-svg must not take msq-svg-midi fences
  const fence = new RegExp(
    `^(\`{3,}|~{3,})[ \\t]*${elementName}(?=[ \\t]|$)([^\\n]*)\\n([\\s\\S]*?)\\n?\\1[ \\t]*$`,
    'gm'
  )

  // Filled by `lang` and emptied by `output`, once per makeHtml call
  let elements = []

  return [
    {
      type: 'lang',
      filter: (text) => {
        elements = []
        return text.replace(fence, (whole, ticks, info, music) => {
          const attributes = { ...defaultAttributes, ...attributesIn(info) }
          elements.push(elementHtml(elementName, attributes, unescapedByShowdown(music)))
          return `\n\n${marker}${elements.length - 1}end\n\n`
        })
      }
    },
    {
      type: 'output',
      filter: (text) => {
        const rendered = text.replace(placeholder, (whole, index) => elements[Number(index)] ?? whole)
        elements = []
        return rendered
      }
    }
  ]
}

/*
Before any `lang` filter runs, showdown escapes `¨` as `¨T` and `$` as `¨D`,
and it only undoes that for the text it renders itself. The music is kept out
of that text, so it is undone here.
*/
function unescapedByShowdown(text) {
  return text.replace(/¨D/g, '$').replace(/¨T/g, '¨')
}

function attributesIn(info) {
  const attributes = {}
  const word = /([A-Za-z][\w-]*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
  let match
  while ((match = word.exec(unescapedByShowdown(info))) !== null) {
    attributes[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attributes
}

function elementHtml(elementName, attributes, music) {
  const attributesHtml = Object.entries(attributes)
    .filter(([ , value ]) => value !== undefined && value !== null)
    .map(([ name, value ]) => {
      const attributeName = name.startsWith('data-') ? name : `data-${kebabCase(name)}`
      return ` ${attributeName}="${escapedHtml(String(value))}"`
    })
    .join('')
  // Inside a <template> the text is parsed as HTML, so `<` and `&` in the music are escaped
  return `<template is="${elementName}"${attributesHtml}>\n${escapedHtml(music)}\n</template>`
}

// fontSources → font-sources, so options can be written the way JavaScript names things
function kebabCase(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function escapedHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
