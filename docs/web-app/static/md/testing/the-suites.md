# The Three Suites

<nav is="docs-contents"></nav>

MuSemantiQ is tested with golden files. Every test is a piece of MSQ. A run makes everything the engine makes of it and compares each output, byte for byte, with a committed copy.

## What Each Suite Checks

- **Visual** (`scripts/visual-tests.js`): the SVG and everything the parser makes, once per music font.
- **Audio** (`scripts/audio-tests.js`): the same, plus the MIDI and the MIDI settings.
- **Serializer** (`scripts/serializer-tests.js`): a round trip. A parsed page is written back as MSQ, the text is compared with the expected MSQ, and then it's parsed again and must give the same page back, with no errors.

## What Each Test Makes

Each test makes one file per kind of output, named after the test:

| Output | Visual | Audio | Serializer |
| --- | --- | --- | --- |
| `svg` | yes | yes | |
| `midi` | | yes | |
| `page-schema` | yes | yes | input |
| `html-highlights` | yes | yes | |
| `errors` | yes | yes | |
| `custom-styles` | yes | yes | input |
| `comments` | yes | yes | input |
| `char-progressions` | yes | | |
| `midi-settings` | | yes | input |
| `msq` | | | yes |

A test passes only when every output matches.

## Running Them

One suite:

```bash
npm run test:visual:all
npm run test:audio:all
npm run test:serializer:all
```

All three, one after another:

```bash
npm run test:all
```

Only the tests whose name contains a word (all three runners accept it):

```bash
npm run test:visual:all -- --only=chord
```

You have to remember the following:

- `--only` matches any part of the name, so `--only=chord` also runs `connection-ties-in-chords`.
- Every run writes the `actual/` files of every test it ran, pass or fail.
- Every run updates `list-of-passed-tests.json` and `list-of-failed-tests.json`. The visual and audio runners keep the verdicts of tests an `--only` run skipped; the serializer runner does not.
- A failing run prints how many tests failed, and the visual and audio runners print the address of the [Test viewer](/docs/dev-tools/test-viewer).

## Where the Files Are

```text
test/
  visual-tests/
    bravura/
      msq/                  the inputs, one .txt per test
      svg/expected/         what a run must produce
      svg/actual/           what the last run produced
      page-schema/…         one folder per kind of output
      list-of-passed-tests.json
      list-of-failed-tests.json
    leland/                 the same tests, for Leland
  audio-tests/              the same shape
  serializer-tests/
    page-schema/expected/   the inputs
    msq/expected/           the MSQ they must serialize to
```

- The visual runner runs one suite per folder in `test/visual-tests/`, so a new font is a new folder.
- An input can have several pages, separated by a line `====next page====`.
- A test's name is its file name up to the first dot: a family, then what it's about, like `chords-basics` or `error-measure-not-found`.

Read next: [Baselines](/docs/testing/baselines)
