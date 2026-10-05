# Embed a playable score

This recipe puts a score you can hear on a page of your own: the engraving, a player under it, and each note highlighted as it sounds. It uses [msq-svg-midi](/docs/components/overview#4-msq-svg-midi) inside an [msq-font-loader](/docs/components/overview#1-msq-font-loader). How the pieces fit together in general is in [Embedding in your own app](/docs/examples/embedding).

## 1. Build the three trees

The components are not served from `src/` or `web-components/`. They are served from three generated folders, and the build scripts write them into the browser example:

```bash
npm run msq:apps:update
npm run web-components:update
```

Now `browser-app/web-app/static/js/msq/` holds:

```text
js/msq/
  web-components/   the components, copied from web-components/
  language/         src/language, for the editor, which parses on the page
  worker/           all of src/, with its imports rewritten to real URLs
```

Copy that folder into your own static folder, so your server answers it at **`/js/msq/`**:

```bash
cp -R browser-app/web-app/static/js/msq/ /path/to/your/static/js/msq/
```

It's important to mention that `/js/msq/` is not a suggestion. A module worker gets no import map, so every import in `worker/` has been rewritten to an absolute URL, `/js/msq/worker/…`, from the `worker.importmap` field of `package.json`. Serve the trees anywhere else and the worker cannot load a single module.

## 2. Serve the fonts

Copy the font files you name in the config. For the page below that is one of each family:

```bash
mkdir -p /path/to/your/static/font/music /path/to/your/static/font/text /path/to/your/static/font/chord-letters
cp src/drawer/font/music/Bravura.otf /path/to/your/static/font/music/
cp src/drawer/font/text/NotoSerif-Regular.ttf src/drawer/font/text/NotoSerif-Bold.ttf /path/to/your/static/font/text/
cp src/drawer/font/chord-letters/GentiumPlus-Regular.ttf /path/to/your/static/font/chord-letters/
```

The glyph table that goes with Bravura is already in the worker tree, at `/js/msq/worker/drawer/font/music-js/bravura.js`.

## 3. The smallest complete host page

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>A playable score</title>
    <script type="importmap">
      {
        "imports": {
          "#msq/web-components/": "/js/msq/web-components/"
        }
      }
    </script>
    <script type="module">
      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-svg-midi-template.js'
    </script>
  </head>
  <body>
    <template
      is='msq-font-loader'
      data-font-sources-reference="msqFontSources"
      data-font-config='{
        "chord-letters": {
          "gentium plus": "/font/chord-letters/GentiumPlus-Regular.ttf"
        },
        "text": {
          "noto-serif": {
            "regular": "/font/text/NotoSerif-Regular.ttf",
            "bold": "/font/text/NotoSerif-Bold.ttf"
          }
        },
        "music": {
          "bravura": {
            "font": "/font/music/Bravura.otf",
            "js": "/js/msq/worker/drawer/font/music-js/bravura.js"
          }
        }
      }'
    >
      <template is='msq-svg-midi' data-font-sources="msqFontSources">
        measure
        treble clef
        c d e f
      </template>
    </template>
  </body>
</html>
```

That is all a page needs: the import map, the two components, the loader, and the score inside it. The loader loads the fonts once, in the worker, and then its children take its place, which is also what keeps the score from asking for an engraving before the fonts are there. If you add an `msq-editor`, add `"#msq/language/": "/js/msq/language/"` to the import map as well, because the editor parses what you type on the page.

**Side note:** there is no polyfill to import for Safari. The components are customized built-in elements, which WebKit does not support, so they load the polyfill for it themselves, from their own `lib/` folder, before any of them is defined. More about that you can read in [Browser support](/docs/components/overview).

## 4. Choosing and serving a soundfont

With no `data-sound-font`, the player uses Magenta's own sample set, fetched from `storage.googleapis.com`. It holds every General MIDI instrument and you serve nothing, but every note the page plays is a request to Google's storage.

To serve your own, render a set with the [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder), copy it into your static folder, and point the score at it:

```bash
cp -RL src/midi/magenta-sound-font/FluidR3_GM /path/to/your/static/magenta-sound-font/
```

```html
<template is='msq-svg-midi' data-font-sources="msqFontSources" data-sound-font="/magenta-sound-font/FluidR3_GM">
  measure
  treble clef
  c d e f
</template>
```

The URL is the folder of the set. The player reads `soundfont.json` from it first, then each instrument's `instrument.json` and samples. `-L` matters when you copy from an app's static folder, where each set is a symlink.

A set holds only the instruments you rendered, so choose it for the music you will play. A stave sounds as the instrument its title names, and program **0**, the grand piano, is in every set.

## 5. The two things that most often go wrong

**Nothing appears.** A component that cannot start leaves nothing on the page: there is no element yet to show an error in. Open the browser console, where it shows up as an unhandled rejection. It is almost always one of these:

1. the `msq-svg-midi` is outside the `msq-font-loader`, or its `data-font-sources` does not match the loader's `data-font-sources-reference`
2. a font URL, or the `js` of a music font, answers 404
3. the trees are not at `/js/msq/`, so the worker fails on its first import
4. the browser is Safari, and `lib/custom-elements-polyfill.js` is missing from the components' folder, so they cannot load it

**It draws, but it is silent.** The score is there and the player moves, but you hear nothing. Magenta's player skips a note whose instrument is not in the set, with only a line in the console, so either the set does not hold the instrument the stave names, or the `data-sound-font` URL does not reach a folder with a `soundfont.json` in it. Open the URL of `soundfont.json` in the browser: if it is not there, neither is anything else.

Mistakes in the music itself are a different matter. Those do not stop the component; they are listed in a panel at the bottom of it, with the line each one came from. More about that you can read in [Errors and troubleshooting](/docs/components/overview).

## 6. If the first paint feels slow

Open the Network panel and reload. Everything the score waits for happens before the first note is drawn, and it adds up:

| What | Size here | Why it is on the path |
| --- | --- | --- |
| the worker's modules | about 580 files under `/js/msq/worker/` | the worker imports the whole engine before it answers anything |
| `Bravura.otf` | about 500 KB | the loader waits for every font |
| `bravura.js` | about 1.6 MB | the glyph table, loaded with its font |
| `NotoSerif-Regular.ttf` and `-Bold.ttf` | about 370 and 390 KB | the same |
| `GentiumPlus-Regular.ttf` | about 780 KB | the same, even if the music has no chord letters |

So measure three things: the time until the loader's font requests finish, the time until the worker has loaded its modules, and then the engraving itself, which is the first `postMessage` round trip after that. Register only the fonts you use, since every one is waited for, and let your server compress and cache the `.js` and the fonts.

The samples are a separate cost. The player loads every sample the score needs as soon as it is created, one mp3 per pitch and velocity, and it shows as loading until they have all arrived. That does not delay the engraving, but on a long score it delays the moment you can press play.

Read next: [Ship your own music font](/docs/recipes/ship-your-own-font)
