# Overview

The showdown extensions let you write the web components in markdown. A fenced block named after a component becomes that component, with the music inside it. Every example in these docs is written this way.

## 1. A fence named after the component

Let's start with a simple example. In markdown, you write:

````markdown
 ```msq-svg
 measure
 treble clef
 c d e f
 ```
````

And as a result you get:

```msq-svg
measure
treble clef
c d e f
```

There is one extension for every component that draws something: `msq-svg`, `msq-midi`, `msq-svg-midi` and `msq-editor`. The fence above becomes the same element you would write in HTML yourself:

```html
<template is='msq-svg' data-font-sources='msqFontSources'>
measure
treble clef
c d e f
</template>
```

It's important to mention that the music never goes through markdown. Blank lines would split it into paragraphs, and lines that start with `-`, `#` or `1.` would be eaten, so the extensions take every such fence out before showdown parses anything and put the element back after it is done. Any other fence, including one named `html` that only shows the markup, is left to showdown.

## 2. Attributes on the fence line

The words after the name of the component are its attributes: `key=value`, `key="value with spaces"`, or a bare `key` for an empty one. You don't need to write `data-`, because it's added for you:

````markdown
 ```msq-editor opens-with=text file-name="a short piece"
 measure
 treble clef
 c d e f
 ```
````

And as a result you get:

```msq-editor opens-with=text file-name="a short piece"
measure
treble clef
c d e f
```

## 3. Using them with showdown

The extensions don't import showdown. They are plain objects that showdown calls, so you can give them to whichever copy of showdown you have, for example the one EHTML carries:

```js
import * as showdown from '/js/ehtml/showdown/showdown.js'
import msqExtensions from '/js/msq/showdown-extensions/msqExtensions.js'

const converter = new showdown.Converter({
  extensions: [ msqExtensions({ fontSources: 'msqFontSources' }) ]
})
const html = converter.makeHtml(markdown)
```

`msqExtensions` gives you all four at once. If you need only some of them, you can simply import them one by one: `msqSvg.js`, `msqMidi.js`, `msqSvgMidi.js` and `msqEditor.js`, from the same folder.

The options are the default attributes of every element the extensions write, and a fence can override them. `fontSources` becomes `data-font-sources`, the reference that an `msq-font-loader` registered its fonts under. `msq-midi` needs no fonts, so it is given no `fontSources`.

## 4. The fonts come first

In the HTML that showdown returns, the music is still only `<template>` elements, and they turn into components once they are on the page. Every one of them except `msq-midi` needs its fonts to be loaded already, so the simplest way is to put the HTML inside an `msq-font-loader`, which shows its content only when the fonts are ready:

```js
const loader = document.createElement('template', { is: 'msq-font-loader' })
loader.setAttribute('data-font-sources-reference', 'msqFontSources')
loader.setAttribute('data-font-config-src', '/js/font-config.json')
loader.innerHTML = converter.makeHtml(markdown)
document.querySelector('article').appendChild(loader)
```

The page also needs the modules of the components and their import map. More about that you can read in [Web components](/docs/components/overview).

## 5. In Node.js

Since the extensions only produce HTML, they work in Node.js as well, for example to render markdown on the server and send the page with the elements already in it. `scripts/check-docs-examples.js` does exactly that: it renders every page of these docs with the same extensions, and checks that every example came through unchanged.

Read next: [With EHTML](/docs/ehtml/overview)
