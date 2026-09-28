# What MuSemantiQ is

<!-- check-docs-examples: preview -->

MuSemantiQ is a semantic music engine. You write music as words, in a text language called **MSQ**, and MuSemantiQ engraves it as sheet music and plays it back.

Let's start with the smallest piece of MSQ there is:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
c d e f
</template>
</div>

These four letters are already a whole page: one measure, one stave, four quarter notes from middle C upwards. You describe what the music is — a measure, a clef, a chord with an accent, a slur from the first unit to the fourth — and the engine works out where everything goes on the page and how it sounds.

## 1. What it is not

It is not a score editor where you drag notes with a mouse. There are no panels and no palettes: the text is the score, and the drawing always follows the text.

It is also not a model that guesses. The parser reads the text by fixed rules, the same text always gives the same page, byte for byte, and whatever it cannot read it reports as an error on its line instead of making something up. It's very important to let a user see errors or inaccuracies, so the engine never throws them away and never fixes them silently.

## 2. What comes out

From one piece of MSQ you can get:

| Output | What it is |
| --- | --- |
| **SVG** | the engraved score |
| **MIDI** | the performance, one continuous file for the whole document |
| **Page schema** | the parsed page as JSON: measures, staves, voices and units, everything the drawer and the MIDI engine read |
| **MusicXML** | through the MusicXML tools in `tools/musicxml`, which convert a page both ways |

There is one more output that you mostly see rather than ask for: the highlighted source. Every word of the text is linked to the elements it drew and to the moment it sounds, so in the editor you can Cmd-click (Ctrl-click on other systems) a note in the score to find the word that wrote it, and the other way round.

## 3. Who it is for

It is for musicians who would rather type than click, and for developers who want sheet music inside their own pages and programs without a desktop application in between. There are three ways in:

1. **The web components.** `<template is="msq-svg">`, `msq-midi`, `msq-svg-midi` and `msq-editor` turn MSQ written inside a page into a score, a player or an editor. The examples on this site are exactly that. More about them you can read in [Web components](/docs/components/overview).
2. **The API.** `src/api.js` is plain JavaScript modules that run in Node and in a browser worker: set up the fonts, parse a page, then generate SVG or MIDI from it. See [Low-level API](/docs/api/overview).
3. **The CLI.** `npm run examples:cli` turns a file, or a folder of files, into SVG and MIDI from the command line. See [CLI](/docs/examples/cli).

It runs on Node 22 or newer and in modern browsers, with no build step and no runtime npm dependencies.

Read next: [Install and run](/docs/getting-started/install-and-run)
