# FAQ and Limitations

<nav is="docs-contents"></nav>

## Questions

### Do I Need to Install Anything Besides Node.js?

- For the low-level API, the browser example and the CLI: no, Node.js 22 or newer is enough. `npm install` only downloads **c8**, for test coverage.
- For the dev tools: they also need [nodes](https://github.com/Guseyn/nodes.js), [EHTML](https://github.com/Guseyn/EHTML) and [e-ui](https://github.com/Guseyn/e-ui), but `npm run dev-tools:setup` downloads them for you. See [Dev tools](/docs/dev-tools/overview).
- For these docs: you need the same three libraries next to the repository.

### How Do I Run the Browser Example?

```bash
npm run browser-app:setup
npm run browser-app
```

The first command copies the engine, the web components and the fonts into the app. Run it again after you change `src/` or `web-components/`. The second one only starts the server, at https://127.0.0.1:8888. See [Browser app](/docs/examples/browser-app).

### Can I Install It From npm?

Not at the moment. You download the repository and use `src/api.js` for the engine, `src/language/api.js` for parsing only, and `web-components/` for the elements. See [Low-Level API](/docs/api/overview).

### Does the Parser Stop at the First Mistake?

No. It draws everything it understood and gives you an error, with its line, for everything it didn't. The CLI still writes its files and then exits with code **1**. See [Handling errors](/docs/language/handling-errors).

### Is the Output Always the Same for the Same Text?

Yes. The same text with the same fonts gives the same SVG and MIDI, byte for byte. The tests rely on that. See [The three suites](/docs/testing/the-suites).

### Which Music Fonts Can I Use?

**Bravura** and **Leland**, because only they have a music-js table. The repository also has **Petaluma** and **MuseJazz**, but without tables. You can make a table from any SMuFL font with the font generator. See [SMuFL to music-js font](/docs/tools/smufl-font-generator).

### Does Playback Need the Internet?

Only if you don't give the player a sound font. Then it loads the default Magenta sound font, **SGM Plus**, from Google. You can make your own sound font from any General MIDI `.sf2` file. See [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

### How Do I Write Several Pages?

Separate them with a line `====next page====`. The CLI writes one SVG per page and one MIDI file for all of them. It can also take a folder with one file per page. See [CLI](/docs/examples/cli).

### Can I Bring In Scores I Already Have?

Yes, from MusicXML, but it's in beta and solves this only partly. Anything that's not supported is dropped and listed in the import report. See [MusicXML import](/docs/tools/musicxml-import) and [MusicXML export](/docs/tools/musicxml-export).

### Can I Send a Pull Request?

No, pull requests are not accepted. You can fork the project under the [license](/docs/reference/license). Issues, suggestions and discussions on [GitHub](https://github.com/Guseyn/MuSemantiQ/issues) are welcome.

## Limitations

1. **No PDF or PNG.** The engine draws SVG only. To get a PDF, print the SVG from a browser.
2. **Safari works through a polyfill.** The components load it themselves, so you don't need to do anything. It's checked in WebKit, but not yet in Safari itself.
3. **Measures are not checked.** A time signature is drawn, not enforced, so you can put as many units into a measure as you want. See [Time signatures](/docs/language/time-signatures).
4. **No automatic line breaks.** Measures stay on the page line you wrote them on. See [Page lines](/docs/language/page-lines).
5. **Two music fonts.** Only Bravura and Leland have music-js tables.

> **TO WRITE**
> - which of the limitations above are planned and which are deliberately out of scope (PDF and PNG output, automatic line breaks)

Read next: [License](/docs/reference/license)
