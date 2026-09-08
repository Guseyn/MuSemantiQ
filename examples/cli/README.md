# MuSemantiQ CLI

Turn music written as text into an engraved score and a playable performance,
from the command line. No dependencies — everything here is Node's standard
library and MuSemantiQ itself.

```
npm run examples:cli
```

That asks a few questions. To skip them, pass flags — note the `--`, which tells
npm the flags are for the script and not for npm:

```
npm run examples:cli -- --input score.txt --out build --svg --midi
```

Running `node examples/cli/msq.js` directly works too, and avoids the `--`.

## Two ways to use it

**Interactive.** Five questions: what to generate, where the input is, the path
or the text itself, which fonts, and where the output goes. Arrow keys move,
Enter chooses, Tab completes paths, Ctrl-C cancels.

**Flags.** Anything scriptable. Exit codes are meaningful, so failures are
detectable, and output goes to stdout while problems go to stderr.

## Options

| Option | Meaning |
| --- | --- |
| `-i, --input <path>` | A file, or a folder holding one file per page |
| `-t, --text <string>` | MuSemantiQ source given directly |
| `--svg` | Engrave a score — one SVG per page (the default) |
| `--midi` | Render a performance — one MIDI for the whole document |
| `--page-schema` | Write the parsed layout as JSON |
| `--highlights` | Write the syntax-highlighted source as HTML |
| `-o, --out <path>` | Folder to write into (default: the current folder) |
| `--name <basename>` | Basename for generated files |
| `-f, --fonts <file>` | Font configuration; omit for the built-in fonts |
| `--page-delimiter <s>` | Line separating pages (default `====next page====`) |
| `-q, --quiet` | Only report problems |
| `--no-color` | No ANSI colour (`NO_COLOR` is honoured too) |
| `-h, --help` | Usage |
| `-v, --version` | Version |

With no format requested you get a score. With neither `--input` nor `--text`,
text is read from standard input:

```
cat score.txt | node examples/cli/msq.js --midi --out build
```

## Pages

MuSemantiQ has no notion of a page break, so the split happens before parsing.
There are two ways to say where pages end, and they can be combined:

- **One file, several pages** — separate them with a line reading
  `====next page====`. This is the same marker the visual and audio test
  fixtures use, so files are interchangeable with them. Change it with
  `--page-delimiter`.
- **A folder** — every `.txt` and `.msq` file in it is one page, ordered
  naturally, so `page-2` comes before `page-10` rather than after `page-1`.

A score is engraved **one SVG per page**, because a page is a sheet of paper.
A performance is **a single MIDI file** for the whole document, because music
does not stop at a page boundary.

```
build/score.page-1.svg
build/score.page-2.svg
build/score.mid            <- one continuous performance
```

Pages taken from a folder keep their own filenames (`intro.txt` → `intro.svg`),
which stays readable in a way renumbering does not.

## Fonts

Without `--fonts` you get Bravura and Leland for music, Noto Serif and Noto Sans
for text, and Gentium Plus and Gothic A1 for chord letters — all shipped in this
repository. A config file replaces a whole **category**, so this keeps the
default text and chord-letter fonts and changes only the music fonts:

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

Relative paths are resolved against the config file, not the working directory.
The `js` entry is the glyph table that goes with the font; the two must match.
Whichever music font is listed first is used when the source does not name one,
and a source can pick another by name with `music font is leland`.

Only engraving needs fonts. `--midi` on its own skips loading them, which is
noticeably faster.

## Errors

The parser does not stop at the first problem: it reports what it could not read
and carries on, so output is still written. Errors are listed with the line
they came from, and the exit code says something went wrong.

```
1 error while parsing:
    3  command 'this is not a real command' is not recognizable or applicable

Output was still written — the parser skips what it cannot read.
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Done |
| `1` | Finished, but the source had parse errors |
| `2` | Bad usage, or a prompt was needed without a terminal |
| `3` | A file could not be read or written, or fonts failed to load |
| `130` | Cancelled with Ctrl-C |

## Notes

Generated SVGs contain faint outlines around some elements. Those come from the
engine — `debugMode` in `src/drawer/elements/basic/svgAsString.js` — and not
from this tool; the committed test fixtures were produced with them on.

Prompts need a real terminal. Piped or redirected input is fine for the text
itself, but the questions cannot be asked, so use flags there; the CLI says so
rather than hanging.

## Layout

```
msq.js            entry point: picks a mode, maps errors to exit codes
args.js           flag parsing
help.js           --help and --version
interactive.js    the five questions
generate.js       the pipeline — the only place output is produced
fonts.js          the built-in font config, and loading a custom one
input.js          file, folder or text  ->  a list of pages
output.js         naming and writing the results
report.js         the errors table and the summary
lib/              terminal handling: prompts, keys, repainting, colour
```

Both modes end in the same `generate()` call, so there is one description of how
output gets made rather than two that can drift apart.
