# Coverage

Coverage is measured with **c8**, the one dev dependency in `package.json`. It runs the three suites under V8's own coverage and says which lines of `src/` they reached.

## 1. Running it

```bash
npm run coverage
```

That is `c8 npm run test:all`: the visual, audio and serializer suites, one after the other, with coverage collected across all three. The suites chain with `&&`, so if one of them fails, the ones after it do not run, and the numbers you get cover less than the whole corpus. Get the suites green first.

When it finishes, c8 prints a table in the terminal, one row per file with its statements, branches, functions and lines, and writes the same report as HTML to `coverage/index.html`. Open that one: every file is a link, and every line that was never reached is marked in the source.

To check the numbers against the thresholds:

```bash
npm run coverage:check
```

It reads the data the last `npm run coverage` left in `.nyc_output/` and fails if any of the four totals is under its threshold. It does not run the tests itself, so run `coverage` first. `npm run coverage:report` rebuilds the HTML report from that same data, without running anything.

## 2. The thresholds

The thresholds are in the `coverage:check` script in `package.json`:

| Metric | Threshold |
| --- | --- |
| statements | **87** |
| branches | **86** |
| functions | **82** |
| lines | **87** |

What is measured, and what is left out, is configured in `.nycrc.json`, which c8 reads: every `.js` file under `src/`, including files no test loads (`"all": true`), minus the exclusions below, with the `text` and `html` reporters.

The thresholds are where the coverage was when they were last raised. When I added the chord tests, statements went from **86.25%** to **87.99%**, and the thresholds went up to match: the last report measured **87.99%** statements, **86.79%** branches, **82.45%** functions and **87.99%** lines. So they work as a ratchet. They are not a target I picked. They are a floor that says the corpus must not start reaching less of the engine than it does today.

## 3. What is deliberately not covered

`.nycrc.json` leaves out code that the suites are not the right way to test, or cannot reach:

- the vendored libraries, `src/drawer/lib`, `src/language/lib` and `src/midi/lib`, because they are not my code and not what the corpus is about
- the music-js font tables, `src/drawer/font/**`, because they are generated data, not logic
- `src/worker.js`, which only runs in a browser, behind `postMessage`
- `src/drawer/generateUnicodePoints.js`, the tracer the font tools use, and `src/drawer/font-urls.js`, a list of URLs
- `src/utils.js`, `src/midi/base64FromUint8.js` and `src/drawer/elements/basic/animatedSvgString.js`
- `src/language/schema/**`, the page-schema validation

And seven files are covered by the config but marked for c8 inside the file, with `/* c8 ignore start */`: six accidentals no key signature can hold, `demiflatKey`, `demisharpKey`, `doubleFlatKey`, `doubleSharpKey`, `sesquiflatKey` and `sesquisharpKey`, and `octaveText`, the numeral of an octave clef that every octave clef now draws itself. Nothing in MSQ reaches them today. They complete families that are otherwise whole, so rather than delete them, each one says in a note at its top what would reach it, and c8 neither counts it against the total nor hides it from the report.

Read next: [Engrave to SVG in Node](/docs/recipes/svg-in-node)
