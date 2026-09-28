# setupFonts

`setupFonts` loads every font the engine draws with and returns them as one object. It is the first call of the pipeline, and it is the only async function in the whole API, because it is the only one that reads files.

Let's start with the simplest case, in Node:

```js
import { setupFonts } from '#msq/api.js'

const supportedFontSources = await setupFonts()
```

With no arguments, Node loads the fonts that come with the repository, from `src/drawer/font/`.

## 1. The three font categories

A font config has three categories, and each has its own shape:

| Category | Shape of an entry | What it is used for |
| --- | --- | --- |
| `chord-letters` | `name: path` to a `.ttf` | chord letters above the stave |
| `text` | `name: { regular, bold }`, two paths to `.ttf` files | titles, lyrics, text labels, dynamics, instrument titles |
| `music` | `name: { font, js }`, a path to a SMuFL `.otf` and to its `js` table | every musical glyph |

This is the config Node uses by default, written out in full:

```json
{
  "chord-letters": {
    "gentium plus": "./src/drawer/font/chord-letters/GentiumPlus-Regular.ttf",
    "gothic a1": "./src/drawer/font/chord-letters/GothicA1-Regular.ttf"
  },
  "text": {
    "noto-serif": {
      "regular": "./src/drawer/font/text/NotoSerif-Regular.ttf",
      "bold": "./src/drawer/font/text/NotoSerif-Bold.ttf"
    },
    "noto-sans": {
      "regular": "./src/drawer/font/text/NotoSans-Regular.ttf",
      "bold": "./src/drawer/font/text/NotoSans-Bold.ttf"
    }
  },
  "music": {
    "bravura": {
      "font": "./src/drawer/font/music/Bravura.otf",
      "js": "#msq/drawer/font/music-js/bravura.js"
    },
    "leland": {
      "font": "./src/drawer/font/music/Leland.otf",
      "js": "#msq/drawer/font/music-js/leland.js"
    }
  }
}
```

The names are the ones a page uses to choose a font, as you remember from [Fonts](/docs/language/fonts): `music font is leland`, `text font is noto-serif`. When a page does not choose, the **first** font of each category is used, so the order of the entries is meaningful.

You can pass only some of the categories. In Node, a category you pass **replaces** the default one as a whole, and a category you leave out keeps its default:

```js
const supportedFontSources = await setupFonts({
  music: {
    leland: {
      font: './src/drawer/font/music/Leland.otf',
      js: '#msq/drawer/font/music-js/leland.js'
    }
  }
})
```

As you can see, this loads Leland as the only music font, and the default text and chord-letter fonts beside it. An entry with a missing field throws straight away, for example `"bold" missing for text font 'x'`.

## 2. Node takes paths, the browser takes URLs

In **Node** every `.ttf` and `.otf` is opened by opentype.js as a file, so a relative path is relative to the current working directory. That is why the defaults only work when you run your script from the repository root. From anywhere else, pass absolute paths.

The `js` entry is different: it is loaded with a dynamic `import()` from inside `src/api.js`. So it is a module specifier rather than a file path, and `#msq/drawer/font/music-js/bravura.js` works wherever you call it from.

In the **browser** there are no defaults, because a browser cannot open `./src/drawer/font/…`. Calling `setupFonts()` without a config on a page throws an error that shows a full example config. Every entry has to be a URL the browser can fetch, including the `js` one. This is the config the documentation site itself uses, from `docs/web-app/static/js/font-config.json`:

```json
{
  "chord-letters": {
    "gentium plus": "/font/chord-letters/GentiumPlus-Regular.ttf",
    "gothic a1": "/font/chord-letters/GothicA1-Regular.ttf"
  },
  "text": {
    "noto-serif": {
      "regular": "/font/text/NotoSerif-Regular.ttf",
      "bold": "/font/text/NotoSerif-Bold.ttf"
    },
    "noto-sans": {
      "regular": "/font/text/NotoSans-Regular.ttf",
      "bold": "/font/text/NotoSans-Bold.ttf"
    }
  },
  "music": {
    "bravura": {
      "font": "/font/music/Bravura.otf",
      "js": "/js/msq/worker/drawer/font/music-js/bravura.js"
    },
    "leland": {
      "font": "/font/music/Leland.otf",
      "js": "/js/msq/worker/drawer/font/music-js/leland.js"
    }
  }
}
```

The `js` URLs point into the generated worker tree, because that is where the tables are served from. A `#msq/…` specifier would not work there, since a module worker has no import map.

**Important note:** `setupFonts` decides that it is in a browser by checking for both `window` and `document`. A worker has neither, so inside the worker it takes the Node branch: a category you leave out falls back to the Node defaults, and those paths cannot be fetched. So in the browser, always give all three categories.

## 3. Why a music font needs two files

A music font is a SMuFL `.otf` plus a generated `js` table, and the engine uses both.

Most glyphs, like note heads, flags, clefs, rests and accidentals, are drawn from the `js` table. It is traced out of the `.otf` by `tools/smufl/generate-smufl-js-font.js`, and it holds every glyph as a path whose coordinates are already written in units of the interval between stave lines, together with the metrics and corrections the drawer needs for that font, such as the stem width. Drawing from it is arithmetic, not font parsing, and it is what keeps the output identical in Node and in every browser.

The `.otf` is still needed for braces. A brace stretches over as many staves as it connects, so it is drawn straight from the font, at a size worked out while laying out the page. The worker also traces single glyphs out of the `.otf` on request, for the font viewer in the dev tools.

This is also why only **bravura** and **leland** can be named at the moment: they are the only fonts with a `js` table. `Petaluma.otf` and `MuseJazz.otf` are in `src/drawer/font/music` waiting to be traced, and naming one before its table exists makes `setupFonts` throw on an import that cannot resolve.

## 4. What you get back

`setupFonts` returns `supportedFontSources`, the same tree with every path replaced by what was loaded:

```js
{
  'chord-letters': { 'gentium plus': opentypeFont, 'gothic a1': opentypeFont },
  'music': { 'bravura': opentypeFont, 'leland': opentypeFont },
  'music-js': { 'bravura': glyphTableFunction, 'leland': glyphTableFunction },
  'text': {
    'regular': { 'noto-serif': opentypeFont, 'noto-sans': opentypeFont },
    'bold': { 'noto-serif': opentypeFont, 'noto-sans': opentypeFont }
  }
}
```

The fonts are loaded in a fixed order: chord-letter fonts, regular text fonts, bold text fonts, music fonts, and the music `js` tables last. That order is what makes the output byte-for-byte deterministic, which the golden-file tests depend on.

You load the fonts once and keep this object. It goes into every call of [generateStylesForSinglePage](/docs/api/single-page) or `generateStylesForMultiplePages`, for every page you engrave. The MIDI functions do not need it.

**Side note:** the parser checks font names against its own list, not against what you loaded. By default that list is **gentium plus** and **gothic a1**, **bravura** and **leland**, **noto-sans** and **noto-serif**, so if you load a different set, pass the names you loaded as `supportedFontNames` when you parse. The worker does exactly that, deriving them from the keys of `supportedFontSources`.

Read next: [A single page](/docs/api/single-page)
