# CLI

The CLI turns MSQ text into files from the command line: SVG scores, a MIDI file, and if you want, the page schema and the highlighted source. It uses nothing but Node's standard library and MuSemantiQ itself, and it needs Node **22** or newer.

```
npm run examples:cli
```

Running `node examples/cli/msq.js` directly works too. With `npm run`, the flags go after `--`, which tells npm they are for the script and not for npm:

```
npm run examples:cli -- --input score.txt --out build --svg --midi
```

## 1. Two ways to use it

**Interactive.** With no flags at all, in a terminal, it asks five questions:

1. What do you want to generate? **SVG**, **MIDI**, or **SVG and MIDI** (the last one is chosen by default).
2. Where is the input text? In a file or folder, or pasted right there.
3. The path to the file or folder, or the text itself. Pasted text ends with **Ctrl + D** on a new line.
4. The font config, asked only when something is engraved. **Enter** alone uses the built-in fonts.
5. Where should the output go? **Enter** alone uses the current folder.

The arrow keys move between the choices, **Enter** chooses, **Tab** completes paths, and **Ctrl + C** cancels. The questions need a real terminal. Run with no flags and no terminal, and the CLI prints its usage instead of hanging.

**Flags.** Everything the questions ask, and a bit more, can be given as flags, which is what you want in a script. With neither `--input` nor `--text`, the text is read from standard input:

```
cat score.txt | node examples/cli/msq.js --midi --out build
```

## 2. The flags

| Flag | Default | What it does |
| --- | --- | --- |
| `-i`, `--input <path>` | | A file, or a folder that holds one file per page |
| `-t`, `--text <string>` | | The MSQ text itself |
| `--svg` | on, when no format is given | Engrave a score, one SVG per page |
| `--midi` | off | Render a performance, one MIDI file for the whole document |
| `--page-schema` | off | Write the page schema of every page as JSON |
| `--highlights` | off | Write the highlighted source as HTML |
| `-o`, `--out <path>` | the current folder | The folder to write into |
| `--name <basename>` | the name of the input file or folder, or **score** | The base name of the generated files |
| `-f`, `--fonts <file>` | the built-in fonts | A font config file |
| `--page-delimiter <line>` | `====next page====` | The line that separates pages |
| `-q`, `--quiet` | off | Print only problems |
| `--no-color` | off | Accepted, but it changes nothing at the moment; set `NO_COLOR` instead |
| `-h`, `--help` | | Print the usage |
| `-v`, `--version` | | Print the version |

Colours are turned off by themselves when the output is not a terminal or when `NO_COLOR` is set, and `FORCE_COLOR` turns them on whatever else is true. A flag with a value can be written as `--flag value` or as `--flag=value`. You cannot give both `--input` and `--text`. `--out` can also name a file, but only when the run writes exactly one file.

Without `--fonts`, you get **Bravura** and **Leland** for music, **Noto Serif** and **Noto Sans** for text, and **Gentium Plus** and **Gothic A1** for chord letters. A config file replaces a whole family at a time, so a file with only `music` in it keeps the built-in text and chord-letter fonts. Relative paths in it are resolved against the config file, not the current folder. The config is the same shape as in [Fonts and font config](/docs/components/fonts-and-config), except that here the paths are files on disk and the `js` entry can stay a `#msq/...` specifier:

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

A MIDI-only run does not load any font at all, because playback never needs one, so it is noticeably faster.

## 3. The outputs

A score is **one SVG per page**, because a page is a sheet of paper. A performance is **one MIDI file for the whole document**, because the music does not stop at the end of a page:

```
build/score.page-1.svg
build/score.page-2.svg
build/score.mid
```

| Output | File |
| --- | --- |
| `--svg`, one page | `<name>.svg` |
| `--svg`, several pages | `<name>.page-1.svg`, `<name>.page-2.svg`, … (numbered with leading zeros when there are ten pages or more, so they sort correctly) |
| `--midi` | `<name>.mid` |
| `--page-schema` | `<name>.schema.json`, the schemas of all pages in one array |
| `--highlights` | `<name>.highlights.html`, the pages separated by the page delimiter |

Pages that come from a folder keep the names of their own files: `intro.txt` becomes `intro.svg`. An explicit `--name` replaces those names for every page.

## 4. Pages

MSQ has no page break of its own, so the CLI splits the input into pages before it is parsed. You can say where a page ends in two ways, and you can combine them:

1. **One file, several pages.** Separate them with a line that reads `====next page====`, or with your own line given by `--page-delimiter`. It is the same line the test suites use, so their inputs work here as they are.
2. **A folder.** Every `.txt` and `.msq` file in it is a page, in natural order, so `page-2` comes before `page-10`. A file in the folder can itself hold several pages; the first one keeps the file's name, and the others get `.page-2`, `.page-3`, … after it.

Empty pages, such as the one after a trailing delimiter, are dropped.

## 5. Exit codes

The parser does not stop at a mistake, so output is always written from everything it understood, and the mistakes are listed with the lines they came from. But a run with mistakes does not end the same way as one without them, so a script can tell:

| Code | What it means | What a script should do |
| --- | --- | --- |
| `0` | Done | Use the output |
| `1` | Done, but the music had parse errors | The files are there, but check them, or treat it as a failure |
| `2` | Bad usage, or a question was needed without a terminal | Fix the command |
| `3` | A file could not be read or written, or the fonts failed to load | Check the paths and the font config |
| `130` | Cancelled with **Ctrl + C** | Nothing was written |

Output goes to standard output, and problems go to standard error.

Read next: [Embedding in your own app](/docs/examples/embedding)
