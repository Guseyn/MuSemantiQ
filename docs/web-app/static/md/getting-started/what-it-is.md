# What MuSemantiQ is

<span is="e-primary">M</span>u<span is="e-primary">S</span>emanti<span is="e-primary">Q</span> (<span is="e-primary">M</span>usic <span is="e-primary">S</span>emantic <span is="e-primary">Q</span>uery) is a semantic music engine and powerful toolkit that translates words to music. You write music as words, in a text language called **MSQ**, and MuSemantiQ engraves it as sheet music and plays it back.

Below, you can see very basic example:

```msq-editor opens-with=text
treble clef
c d e f g
```

## 1. What it is not

- It is not a score editor where you drag notes with a mouse. There are no panels and no palettes: the text is the score, and the drawing always follows the text.

- It is also not some LLM that guesses. The parser reads the text by fixed rules, the same text always gives the same page, byte for byte, and whatever it cannot read it reports as an error on its line instead of making something up. It's very important to let a user see errors or inaccuracies, so the engine never throws them away and never fixes them silently.

## 2. What comes out

From one piece of MSQ you can get:

| Output | What it is |
| --- | --- |
| **SVG** | the engraved score |
| **MIDI** | the performance, one continuous file for the whole document |
| **Page schema** | the parsed page as JSON: measures, staves, voices and units, everything the drawer and the MIDI engine read |
| **HTML highlights** | for adnvanced usage, if you want to build an editor for MSQ. It supports command highlighting in the text.<br> It also can include links to the elements in **SVG**, so in the editor you can `Cmd-click` (`Ctrl-click` on other systems) a note in the score to find the word that wrote it, and the other way round |
| **MusicXML** (beta) | through the MusicXML tools in `tools/musicxml`, which convert a page both ways |

## 3. Who it is for

- Musicians who want easy access to their sheet music on any device
- Composers who would rather write in a state of flow than get lost among the hundreds of elements in conventional notation software
- Publishers and authors who want the flexibility to create books for both print and the web
- Programmers in the music domain who want to build programs and tools on top of MSQ

## 4. What does it provide

1. **The API.** `src/api.js` is plain JavaScript modules that run in Node and in a browser worker: set up the fonts, parse a page, then generate SVG or MIDI from it. See [Low-level API](/docs/api/overview).
1. **The CLI.** `npm run cli-app` turns a file, or a folder of files, into SVG and MIDI from the command line. See [CLI](/docs/examples/cli).
1. **The web components.** `<template is="msq-svg">`, `<template is="msq-midi>`, `<template is="msq-svg-midi"` and `<template is="msq-editor>` turn MSQ written inside a page into a score, a player or an editor. The examples on this site are exactly that. More about them you can read in [Web components](/docs/components/overview).
1. **Showdown extensions.** You can declare language blocks in Markdown: **msq-svg**, **msq-midi**, **msq-svg-midi** and **msq-editor**, and the rest will be handled by showdown library.
1. **Dev Tools**. 
  - You can view and generate glyphs using any music font
  - You can integrate any Sound Font
  - Add/Check tests
  - Transalte to/from MusicXML (beta)

It runs on Node 22 or newer and in modern browsers, with no build step and no runtime npm dependencies.

Read next: [Install and run](/docs/getting-started/install-and-run)
