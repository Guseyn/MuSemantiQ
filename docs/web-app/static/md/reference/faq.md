# FAQ and limitations

The questions that come up, with straight answers. The limitations are here too, each with the reason for it and a link to where it is discussed in more depth.

## 1. Questions

### Do I need to install anything besides Node?

For the browser example and the CLI, no: Node 22 or newer is enough, and `npm install` only downloads **c8** for test coverage. The dev tools and this documentation also need my libraries nodes, EHTML and e-ui cloned beside the repository. See [Install and run](/docs/getting-started/install-and-run).

### Can I install it from npm as a dependency?

Not at the moment. You use it from a clone of the repository: `src/api.js` for the engine, `src/language/api.js` for parsing alone, and `web-components/` for the elements. See [Low-level API](/docs/api/overview) and [Embedding in your own app](/docs/examples/embedding).

### Does the parser stop at the first mistake?

No. It never throws on bad input. It draws everything it understood and collects an error for everything it did not, with the line it was on. The CLI still writes its output and then exits with code **1**, so a script can tell. See [Handling errors](/docs/language/handling-errors).

### Is the output always the same for the same text?

Yes. The same text with the same fonts gives the same SVG and the same MIDI, byte for byte. The test suites rely on that, because they compare every output with a committed one. See [The three suites](/docs/testing/the-suites).

### Which music fonts can I use?

**Bravura** and **Leland**. A music font needs a music-js table as well as its outline file, and at the moment only those two have one. The repository also has the `.otf` files of **Petaluma** and **MuseJazz**, but no tables for them. A new table is generated from any SMuFL font with the font generator, and what it makes is a starting point that still has to be tuned by eye. See [Fonts and font config](/docs/components/fonts-and-config) and [SMuFL to music-js font](/docs/tools/smufl-font-generator).

### What does playback sound like, and does it need the internet?

When a component is not given a sound font, the player loads the default Magenta sound font, **SGM Plus**, from Google's storage, so it needs a connection. You can render a local sample set from any General MIDI `.sf2` soundbank with the sound font generator in the dev tools, which needs **fluidsynth** and **lame** installed. See [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

### How do I write several pages?

The language has no page break, so a document of several pages is split before it is parsed. The CLI and the tests split at a line reading `====next page====`, and the CLI can also take a folder with one file per page. The CLI writes one SVG per page and one MIDI file for the whole document, because music does not stop at a page boundary. See [Multiple pages](/docs/api/multiple-pages).

### Can I bring in scores I already have?

Yes, from MusicXML. `tools/musicxml` converts a MusicXML score into a page and a page back into MusicXML, and the MusicXML tool in the dev tools does it on a page and engraves both sides. Nothing is guessed on the way in: whatever is not supported is dropped and named in the import report. See [MusicXML import](/docs/tools/musicxml-import) and [MusicXML export](/docs/tools/musicxml-export).

### Can I send a pull request?

No, pull requests are not accepted. You can fork the project and change it under the terms of the [license](/docs/reference/license), and issues, suggestions and discussions on [GitHub](https://github.com/Guseyn/MuSemantiQ/issues) are welcome.

## 2. Limitations

These are the things MuSemantiQ does not do at the moment. You have to remember the following:

1. **No PDF or PNG output.** The engine draws SVG and nothing else, and the CLI writes SVG, MIDI, the page schema and the highlighted source. To get a PDF you print the SVG, from a browser for example.
2. **Safari through a polyfill.** The components are customized built-in elements, which WebKit does not implement. Chromium-based browsers and Firefox work natively, and in Safari the components load a polyfill that ships with them, so you don't have to do anything for it. The browser example, the dev tools and this documentation have been checked in WebKit, but not yet in Safari itself. See [Browser support](/docs/components/browser-support).
3. **No check that a measure adds up.** A time signature is drawn, not enforced, so MSQ will not tell you that a measure is over-full or short. You can put as many units into a measure as you want, which lets you write the music first and fix the rhythm after. See [Time signatures](/docs/language/time-signatures).
4. **No automatic line breaks.** Measures stay on the page line you wrote them on. If you never write `new line`, the line, and the page with it, just grow wider. See [Page lines](/docs/language/page-lines) and [Unit spacing](/docs/language/unit-spacing).
5. **Two music fonts.** Only Bravura and Leland have music-js tables, as described above.

> **TO WRITE**
> - which of the limitations above are planned and which are deliberately out of scope (PDF and PNG output, automatic line breaks)

Read next: [License](/docs/reference/license)
