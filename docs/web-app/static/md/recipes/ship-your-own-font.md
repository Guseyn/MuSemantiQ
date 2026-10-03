# Ship your own music font

This recipe takes a SMuFL music font from an `.otf` file to a font you can name from the music with `music font is …`, in Node, in the CLI and in the browser. It uses **Petaluma** as the example, because its `.otf` is already in `src/drawer/font/music/` waiting to be traced.

## 1. Put the font where the others are

The `.otf` lives beside Bravura and Leland:

```bash
cp ~/Downloads/Petaluma.otf src/drawer/font/music/Petaluma.otf
```

Its name in the music comes from its file name: lower-cased, with anything that is not a letter or a digit turned into a dash. `Petaluma.otf` is `petaluma`.

## 2. Generate the trace

From the command line:

```bash
node tools/smufl/generate-smufl-js-font.js src/drawer/font/music/Petaluma.otf src/drawer/font/music-js/petaluma.js
```

Or from the [Font generator](/docs/dev-tools/font-generator) page of the dev tools, which saves the `.otf` and writes the same file for you. Either way you get `src/drawer/font/music-js/petaluma.js`, and a report of what the font does not have:

```text
  ! noteDot.points: U+E920 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Ped.points: U+F434 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Soft.points: U+F435 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
184 point arrays traced, 3 missing (3 drawn as "?")
```

Keep that output. Every `!` line is a glyph you will deal with in step 5.

## 3. Check it, and fix what sits wrong

The generator writes no proof sheet of its own. The proof is the [Font viewer](/docs/dev-tools/font-viewer), which engraves every glyph in a piece of music:

```bash
npm run dev-tools
```

Open **https://127.0.0.1:8889/html/font-viewer.html**, choose **petaluma** as the music font, and walk the glyph entries with **Next →**. Every point array was traced at the right size, but the positions start from the midpoint of Bravura and Leland, so expect accidentals, articulations and clefs to sit a little out.

For each one that does:

1. change its **yCorrection** until the glyph sits where it should on the stave; the example is re-engraved with the new value, and nothing is written yet
2. press **Apply**, which writes the points and the correction into `src/drawer/font/music-js/petaluma.js`

It is worth switching the music font to **bravura** now and then on the same entry. Bravura's value is the one the committed corpus was tuned against, so it is a good reference for where a glyph belongs.

## 4. Register it, and name it from the music

A table on disk is not yet a font anything engraves with. Every place that engraves is given a font config, and only the fonts in it can be named. The music family of a config is replaced as a whole, so list the fonts you still want alongside the new one. The first one listed is the one used when the music names none.

**In Node**, pass it to `setupFonts`:

```js
const supportedFontSources = await setupFonts({
  music: {
    bravura: {
      font: './src/drawer/font/music/Bravura.otf',
      js: '#msq/drawer/font/music-js/bravura.js'
    },
    petaluma: {
      font: './src/drawer/font/music/Petaluma.otf',
      js: '#msq/drawer/font/music-js/petaluma.js'
    }
  }
})
```

The text and chord-letter fonts stay the defaults, because the config does not name those families.

**In the CLI**, write the same thing as a JSON file and pass it with `--fonts`:

```json
{
  "music": {
    "bravura": {
      "font": "../src/drawer/font/music/Bravura.otf",
      "js": "#msq/drawer/font/music-js/bravura.js"
    },
    "petaluma": {
      "font": "../src/drawer/font/music/Petaluma.otf",
      "js": "#msq/drawer/font/music-js/petaluma.js"
    }
  }
}
```

```bash
node cli-app/msq.js --input score.txt --fonts config/fonts.json --out build
```

Relative font paths are resolved against the config file, so `config/fonts.json` reaches `src/` with `../`. The `#msq/…` specifiers are left as they are, because they are resolved by the repository's own `package.json`.

**In the browser**, the table has to be in the worker tree first, so rebuild it:

```bash
npm run create:msq:worker
```

and then name the font in the loader's config, with the `js` at its URL in that tree:

```json
"music": {
  "bravura": {
    "font": "/font/music/Bravura.otf",
    "js": "/js/msq/worker/drawer/font/music-js/bravura.js"
  },
  "petaluma": {
    "font": "/font/music/Petaluma.otf",
    "js": "/js/msq/worker/drawer/font/music-js/petaluma.js"
  }
}
```

In all three, the music then picks it by name, with `music font is petaluma` at the top of the page. More about that command you can read in [Fonts](/docs/language/fonts).

A name the config does not register is not a silent fallback. It is a parse error on the line that names it, saying the command `petaluma` is not recognizable or applicable.

**Side note:** the test suites have font configs of their own, in `scripts/visual-tests.js`, `scripts/audio-tests.js` and `scripts/serializer-tests.js`, and they name only **bravura** and **leland**. A visual suite for the new font is a new folder, `test/visual-tests/petaluma/`, with the corpus in it and `music font is petaluma` at the top of every test, and it needs the font added to the visual runner's config as well.

## 5. A glyph the font does not have

Every glyph in the `!` lines is drawn as a question mark. That is deliberate, because an empty glyph has no bounding box and breaks the layout of the page, and a **?** says on the page which symbol is missing. But it is not something to ship. There are three ways to give it a real shape:

1. **Trace another character of the same font.** In the font viewer, choose the entry, type a different codepoint into **Character or U+XXXX**, one the font does have and that looks right in its place, and **Apply**. The entry keeps its name; only its points change.
2. **Borrow the points from another font.** Every music-js table is written in the same units, multiples of the stave-line interval, so the point array of the same entry in `bravura.js` can be copied into `petaluma.js` as it is. It will be drawn in Bravura's hand, which is sometimes better than a **?**.
3. **Leave it.** If the music you will engrave never uses that sign, the **?** is never drawn. For Petaluma, `Ped` and `Soft` are letters of the pedal marks (`pedalLetters` in the table), and `noteDot` is the dot of every dotted note, so only the first two can really be left, and only for music without pedal marks.

Whichever you choose, run the visual suites afterwards if the font is in the corpus, and look at every page that changed. More about that you can read in [Baselines](/docs/testing/baselines).

Read next: [Convert a MusicXML library](/docs/recipes/convert-musicxml-library)
