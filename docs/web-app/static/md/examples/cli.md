# CLI

<nav is="docs-contents"></nav>

The CLI turns MSQ text into files: SVG scores, a MIDI file, the page schema and the highlighted source. It needs Node **22** or newer, and nothing else.

## 1. Running

Run it from the root of the repository:

```sh
# with npm, the flags go after --
npm run cli-app -- --input score.txt --out build --svg --midi
```

Or directly:

```sh
node cli-app/msq.js --input score.txt --out build --svg --midi
```

With no flags, in a terminal, it asks you a few questions instead:

1. What to generate: **SVG**, **MIDI**, or **SVG and MIDI**.
2. Where the text is: in a file or a folder, or pasted.
3. The path, or the text itself. Pasted text ends with **Ctrl + D** on a new line.
4. The font config, only when it engraves. **Enter** uses the built-in fonts.
5. Where to write. **Enter** uses the current folder.

## 2. Examples

A score and a performance from one file:

```sh
node cli-app/msq.js --input score.txt --out build --svg --midi
```

Every page of a folder, and the page schema:

```sh
node cli-app/msq.js --input pages/ --out build --svg --page-schema
```

Only the performance, from the text itself:

```sh
node cli-app/msq.js --text 'measure
treble clef
c d e f' --midi --out build
```

Only the performance, from a pipe:

```sh
cat score.txt | node cli-app/msq.js --midi --out build
```

## 3. Flags

| Flag | Default | What it does |
| --- | --- | --- |
| `-i`, `--input <path>` | | A file, or a folder with one file per page |
| `-t`, `--text <string>` | | The MSQ text itself |
| `--svg` | on, if no format is given | One SVG per page |
| `--midi` | off | One MIDI file for the whole text |
| `--page-schema` | off | The page schemas, as JSON |
| `--highlights` | off | The highlighted source, as HTML |
| `-o`, `--out <path>` | the current folder | Where to write |
| `--name <basename>` | the name of the input, or **score** | The name of the files |
| `-f`, `--fonts <file>` | the built-in fonts | A font config file |
| `--page-delimiter <line>` | `====next page====` | The line between pages |
| `-q`, `--quiet` | off | Print only problems |
| `--no-color` | off | Accepted, but it changes nothing at the moment; set `NO_COLOR` instead |
| `-h`, `--help` | | Print the usage |
| `-v`, `--version` | | Print the version |

- With neither `--input` nor `--text`, the text is read from standard input.
- You can't give both `--input` and `--text`.
- A flag with a value can be written as `--out build` or `--out=build`.

## 4. Pages and Files

- In one file, pages are separated by the line `====next page====`, or by your own line from `--page-delimiter`.
- In a folder, every `.txt` and `.msq` file is a page, in natural order: `page-2` comes before `page-10`.
- One page gives `<name>.svg`. Several pages give `<name>.page-1.svg`, `<name>.page-2.svg`, and so on.
- Pages from a folder keep the names of their files: `intro.txt` becomes `intro.svg`.
- MIDI is always one file, `<name>.mid`, because the music doesn't stop at the end of a page.
- `--page-schema` gives `<name>.schema.json`, and `--highlights` gives `<name>.highlights.html`.

For example, a file with two pages gives:

```
build/score.page-1.svg
build/score.page-2.svg
build/score.mid
```

## 5. Fonts

- Without `--fonts`, you get **Bravura** and **Leland** for music, **Noto Serif** and **Noto Sans** for text, and **Gentium Plus** and **Gothic A1** for chord letters.
- A font config file replaces a whole category at a time, so a file with only `music` in it keeps the built-in text and chord-letter fonts.
- Paths in it are relative to the file itself.
- A MIDI-only run doesn't load fonts at all, so it's faster.

```json
{
  "music": {
    "leland": {
      "font": "./fonts/Leland.otf",
      "js": "#msq/drawer/font/music-js/leland.js"
    }
  }
}
```

## 6. Exit Codes

The files are always written from everything the parser could read, and the mistakes are printed with their line numbers.

| Code | What it means |
| --- | --- |
| `0` | Done |
| `1` | Done, but the music has mistakes |
| `2` | Wrong flags, or a question was needed without a terminal |
| `3` | A file could not be read or written, or the fonts failed to load |
| `130` | Cancelled with **Ctrl + C** |

Read next: [SMuFL to music-js font](/docs/tools/smufl-font-generator)
