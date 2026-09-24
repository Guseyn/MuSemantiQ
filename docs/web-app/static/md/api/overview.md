# Overview

> **TO WRITE**
> - the ten public functions, in one table
> - **the parse/render split** — the two intermediate-structure functions live in the language half and are only re-exported, so a page that merely highlights text never loads the drawer, the fonts or the MIDI engine
> - the pipeline in order: text → intermediate structures → styles → SVG or MIDI
> - that only `setupFonts` is async
> - the difference between Node and browser usage
