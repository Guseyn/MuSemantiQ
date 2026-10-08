# Coverage

<nav is="docs-contents"></nav>

Coverage is measured with **c8**, the only dev dependency in `package.json`. It runs the three suites and shows which lines of `src/` they reached.

## 1. Running It

```bash
npm run coverage
```

- It runs `npm run test:all` with coverage.
- It prints a table in the terminal and writes an HTML report to `coverage/index.html`, where every line that was never reached is marked.
- If one suite fails, the next ones don't run, so make the tests pass first.

To check the numbers against the thresholds, after `npm run coverage`:

```bash
npm run coverage:check
```

To rebuild the HTML report from the last run, without running the tests:

```bash
npm run coverage:report
```

## The Thresholds

| Metric | Threshold |
| --- | --- |
| statements | **87** |
| branches | **86** |
| functions | **82** |
| lines | **87** |

They are in the `coverage:check` script in `package.json`. They are where the coverage was when they were last raised, so they work as a floor: the tests must not start reaching less of `src/` than they do now.

## What Is Not Counted

`.nycrc.json` counts every `.js` file in `src/`, except:

- the vendored libraries in `src/drawer/lib`, `src/language/lib` and `src/midi/lib`
- the generated font tables in `src/drawer/font/`
- `src/worker.js`, which runs only in a browser
- `src/language/schema/`, and a few small helpers: `src/drawer/generateUnicodePoints.js`, `src/drawer/font-urls.js`, `src/utils.js`, `src/midi/base64FromUint8.js`, `src/drawer/elements/basic/animatedSvgString.js` and `src/language/parser/scenarios/string/`

A few files that nothing in MSQ reaches yet, such as the keys of rare accidentals, are marked with `/* c8 ignore start */` inside the file.

Read next: [Glossary](/docs/reference/glossary)
