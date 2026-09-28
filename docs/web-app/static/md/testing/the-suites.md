# The three suites

MuSemantiQ is tested with golden files. Every test is a piece of MSQ, every run produces everything the engine makes of it, and every one of those outputs is compared, byte for byte, with a committed copy.

I test it this way because engraving is hard to assert on in pieces. Whether a slur clears the notes under it is not a fact about one function, it is a fact about the whole page. A whole SVG compared against the one I have looked at and accepted catches any change at all, and an SVG can be opened and judged by eye, which an assertion cannot.

## 1. What each suite pins

There are three suites, and each pins a different half of the engine:

| Suite | Runner | What it pins |
| --- | --- | --- |
| **Visual** | `scripts/visual-tests.js` | the engraving, once per music font, together with everything the parser produces |
| **Audio** | `scripts/audio-tests.js` | the MIDI and the MIDI settings, together with the same parser outputs and the engraving |
| **Serializer** | `scripts/serializer-tests.js` | a round trip: a parsed page written back as MSQ, and that MSQ parsed again |

The serializer suite is the odd one out. Its inputs are not MSQ but four files exactly as the parser produced them: the page schema, the custom styles, the MIDI settings and the comments. A run serializes them, compares the text with the expected MSQ, which pins the wording down, then parses that text again and requires no errors and the same four files back. That second half is what makes it a round trip rather than a snapshot.

## 2. The artifacts

Each test produces one file per artifact kind, named after the test:

| Artifact | File | Visual | Audio | Serializer |
| --- | --- | --- | --- | --- |
| `svg` | `.svg`, every page stacked into one | yes | yes | |
| `midi` | `.mid`, every page on one timeline | | yes | |
| `page-schema` | `.json` | yes | yes | input, and read back |
| `html-highlights` | `.html`, the editor's highlighted source with its `ref-id`s | yes | yes | |
| `errors` | `.json`, the parser's messages for each page | yes | yes | |
| `custom-styles` | `.json` | yes | yes | input, and read back |
| `comments` | `.json` | yes | yes | input, and read back |
| `char-progressions` | `.json`, which scenarios the parser ran at each character | yes | | |
| `midi-settings` | `.json` | | yes | input, and read back |
| `msq` | `.txt`, the serialized text | | | yes |

So a visual test is seven comparisons and an audio test is eight. A test passes only when all of them match; the first one that does not is recorded as the reason it failed.

## 3. Running them

One suite at a time:

```bash
npm run test:visual:all
npm run test:audio:all
npm run test:serializer:all
```

All three, one after the other, stopping at the first suite that fails:

```bash
npm run test:all
```

And only the tests whose name contains a word, which all three runners accept:

```bash
node scripts/visual-tests.js --only=chord
```

The match is a plain substring of the file name, so `--only=chord` runs all fifteen `chords-` tests, and also `connection-ties-in-chords`, `layout-chord-letters` and every other test with **chord** anywhere in its name. Through npm it needs the `--`:

```bash
npm run test:visual:all -- --only=chord
```

A runner that has a failure exits with an error that says how many tests failed, and the visual and audio runners print the address of the [Test viewer](/docs/dev-tools/test-viewer) to look at them in. The visual runner runs every font before it throws, so a failure under Bravura never leaves Leland unrun.

It's important to mention that every run writes the `actual/` side of every artifact of every test it ran, pass or fail, and updates the suite's `list-of-passed-tests.json` and `list-of-failed-tests.json`. The visual and audio runners merge an `--only` run into those lists, so the other tests keep their verdicts. The serializer runner writes the lists from scratch every time, so after an `--only` run they name only the tests that ran.

## 4. Where the fixtures live

```text
test/
  visual-tests/
    bravura/
      msq/                  the inputs, one .txt per test
      svg/expected/         the baselines
      svg/actual/           what the last run produced
      page-schema/…         and so on, one folder per artifact
      list-of-passed-tests.json
      list-of-failed-tests.json
    leland/                 the same corpus, for Leland
  audio-tests/
    msq/
    svg/, midi/, …          the same shape, one suite
  serializer-tests/
    page-schema/expected/   the inputs
    msq/expected/           the MSQ they should serialize to
    …
```

The visual runner runs one suite per folder it finds in `test/visual-tests/`, so a font is added to the corpus by adding a folder. The two copies of a test are the same music; the Leland one starts with `music font is leland`, because a test file says on its face what it engraves with.

An input may hold several pages, separated by a line reading `====next page====`, the same delimiter the CLI uses. Each page is parsed on its own, and the outputs of all pages go into the one artifact.

## 5. How a test is named

A test's name is its file name up to the first dot, so a name never carries one. It is a family, then what the test is about: `chords-basics`, `connection-slur-s-shape`, `rhythm-beam-spellings`, `error-measure-not-found`. The families in the visual corpus are **structure**, **rhythm**, **connection**, **layout**, **chords**, **pitch**, **expression**, **articulation**, **error**, **score** and **comment**; the audio corpus adds **midi**.

Because the family comes first, a family stays together wherever tests are listed in the order their names sort in, as the test viewer lists them, and `--only=` with a family runs that family, plus any test that mentions it later in its name, like `structure-connection-for-stave`.

Read next: [Baselines](/docs/testing/baselines)
