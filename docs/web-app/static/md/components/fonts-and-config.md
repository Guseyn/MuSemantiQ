# Fonts and font config

The font config is what you give to `msq-font-loader`: a JSON object that says which fonts exist and where each file is. It is the same shape that [setupFonts](/docs/api/setup-fonts) takes, because the loader hands it to `setupFonts` inside the worker.

## 1. The shape of the config

Let's start with the complete config this documentation uses (`/js/font-config.json`):

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

As you can see, there are three families, and in each of them a font is listed under its name:

| Family | Each entry | What it draws |
| --- | --- | --- |
| `music` | `{ "font", "js" }`: the `.otf` of a SMuFL font, and its generated glyph table | Everything musical: note heads, clefs, rests, accidentals, dynamics |
| `text` | `{ "regular", "bold" }`: two `.ttf` files | Titles, subtitles, text labels, lyrics and the rest of the words on the page |
| `chord-letters` | the URL of one `.ttf` file | Chord letters over the stave, such as **Cmaj7** |

The names are what the music uses to pick a font, so they are written exactly as the music writes them:

<div>
<template is="msq-svg" data-font-sources="msqFontSources">
music font is leland
text font is noto-sans

title is "In Leland, with Noto Sans"

measure
treble clef
c d e f
</template>
</div>

When the music names no music font, the first one in the config is used, so the order of `music` matters. More about choosing fonts from the music you can read in [Fonts](/docs/language/fonts).

A music font needs two files because the engine does not draw its glyphs straight from the outline file. The `js` file is a table generated from the SMuFL font by `tools/smufl/`: every glyph the engine uses, traced into path points measured in intervals between stave lines, together with the offsets that put it in its place. That is what lets every glyph scale with the stave. Only **Bravura** and **Leland** have such tables at the moment, so only they can be listed under `music`. More about generating a table for another font you can read in [SMuFL to music-js font](/docs/tools/smufl-font-generator).

## 2. The rules for the URLs

You have to remember the following rules:

1. Every URL is fetched by the worker, not by the page. A path from the site root, such as `/font/music/Bravura.otf`, is the simplest and always works.
2. The `js` entry of a music font is imported by the worker, and a module worker has no import map. So in the browser it has to be a real URL, such as `/js/msq/worker/drawer/font/music-js/bravura.js`, and not a `#msq/...` specifier.
3. Give all three families. In the worker, `setupFonts` fills a family you left out with its own Node defaults, which are relative paths into `./src/drawer/font/` that no browser app serves, so the fonts fail to load.

## 3. Where the font files live

Every font file in the repository lives in one place, `src/drawer/font/`:

```
src/drawer/font/
  chord-letters/   GentiumPlus-Regular.ttf, GothicA1-Regular.ttf
  text/            NotoSerif-Regular.ttf, NotoSerif-Bold.ttf, NotoSans-Regular.ttf, NotoSans-Bold.ttf
  music/           Bravura.otf, Leland.otf (and Petaluma.otf, MuseJazz.otf, which have no tables yet)
  music-js/        bravura.js, leland.js
```

The apps never copy them. `npm run setup:symlinks` (which also runs on `npm install`) links `static/font/chord-letters`, `static/font/music` and `static/font/text` of every app (the examples app, the dev tools and this documentation) to those folders, so each app serves them under `/font/...`. The glyph tables are served from a different place: they are part of `src/`, so they reach the page inside the worker tree that `npm run create:msq:worker` writes, under `/js/msq/worker/drawer/font/music-js/`.

## 4. A config served by URL

Instead of writing the config into the page, you can serve it and point the loader at it with `data-font-config-src`:

```html
<template
  is='msq-font-loader'
  data-font-sources-reference='msqFontSources'
  data-font-config-src='/js/font-config.json'
>
  ...
</template>
```

The loader fetches it with a plain `fetch()`. It can be a static file, as it is here, or an endpoint of your server that builds the config, for example to point at a CDN. The only requirements are that the response is successful and its body is the config as JSON. If the response is not successful, the loader stops with `Font config could not be loaded: <status>`, and its content never appears.

## 5. A font that was never registered

The fonts the music may name are the ones in the config, and nothing else. If the music names one that is not there, the parser does not recognise the command, reports it as an error, and draws the score with the default font:

<!-- check-docs-examples: allow-errors -->
<div>
<template is="msq-svg" data-font-sources="msqFontSources">
music font is petaluma

measure
treble clef
c d e f
</template>
</div>

As you can see, **Petaluma** is not in the config of this site, so the score is engraved in **Bravura**, and the errors panel says that the command `petaluma` is not recognizable or applicable on the line 1.

Read next: [Errors and troubleshooting](/docs/components/errors)
