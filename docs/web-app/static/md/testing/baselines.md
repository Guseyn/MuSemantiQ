# Baselines

<nav is="docs-contents"></nav>

A baseline is the committed output a test is compared with.

## Expected and Actual

Every output folder has two sides:

- `expected/` is the baseline. It changes only when you accept a new one.
- `actual/` is what the last run produced, for every test it ran, pass or fail.

A test passes when every `actual` file is the same as its `expected` file, byte for byte. That's why the same MSQ must give the same bytes on any machine, and why `setupFonts` loads fonts in a fixed order.

## Accepting a New Baseline

To accept a new baseline, you copy `actual` over `expected`.

The easy way is the [Test viewer](/docs/dev-tools/test-viewer): open the test, compare both sides, and press **Adopt** for one output or **Adopt all** for the whole test.

By hand, one output of one test:

```bash
cp test/visual-tests/bravura/svg/actual/chords-basics.svg \
   test/visual-tests/bravura/svg/expected/chords-basics.svg
```

Then run the suite again, so its lists of passed and failed tests are up to date.

The serializer suite is not in the test viewer. Its baseline is the MSQ in `msq/expected/`:

```bash
cp test/serializer-tests/msq/actual/<test>.txt test/serializer-tests/msq/expected/<test>.txt
```

**Important note:** in the serializer suite, the JSON files in `expected/` are the inputs, not baselines. Don't copy `actual` over them to make a failing round trip pass.

## Before You Accept

You have to remember the following rules:

1. Know what you expect to change before you run the tests.
2. Open every output that differs, not only the first one.
3. A change you can't explain is a bug until you can.
4. On a failing test, accept output by output. **Adopt all** is for a test you've just added.

Read next: [Coverage](/docs/testing/coverage)
