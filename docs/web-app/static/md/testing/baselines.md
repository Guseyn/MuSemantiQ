# Baselines

A baseline is the committed output of a test: the file a run is compared against. This page is about when and how a baseline changes, which is the one part of the testing that depends on judgement rather than on the runner.

## 1. Expected and actual

Every artifact folder in a suite has two sides:

- `expected/` holds the baseline. It is committed, and it changes only when someone adopts a new one.
- `actual/` holds what the last run produced. Every run writes it for every test it ran, pass or fail, so after a failure there is always something to compare.

A test passes when every `actual` file is byte for byte its `expected` file. That is why the output has to be deterministic: the same MSQ, on any machine, must produce the same bytes. `setupFonts` loads fonts in a fixed order for exactly that reason, and the runners give it an explicit font config instead of leaving it to the defaults.

**Side note:** `actual/` is committed too. So a change to the engine that changes any output shows up in `git status`, under `actual/`, the moment you run the suites, before anything has been adopted.

## 2. Adopting a new baseline

Adopting is copying `actual` over `expected`. You can do it at two granularities: one artifact of one test, or every artifact of one test.

The easy way is the [Test viewer](/docs/dev-tools/test-viewer). Open the test, look at both sides, and press **Adopt &lt;artifact&gt;** or **Adopt all**. It asks first, it acts on one test in one suite, and it keeps the passed and failed lists true.

By hand, one artifact is one `cp`:

```bash
cp test/visual-tests/bravura/svg/actual/chords-basics.svg \
   test/visual-tests/bravura/svg/expected/chords-basics.svg
```

And every artifact of one test in one suite is a loop over the artifact folders:

```bash
for kind in svg page-schema html-highlights errors custom-styles comments char-progressions; do
  cp test/visual-tests/bravura/$kind/actual/chords-basics.* \
     test/visual-tests/bravura/$kind/expected/
done
```

For the audio suite the folders are `svg midi page-schema html-highlights errors custom-styles midi-settings comments`, under `test/audio-tests/`. After adopting by hand, run the suite again so its lists catch up.

The serializer suite is not in the viewer, and it has to be adopted by hand. Its baseline is `msq/expected/<test>.txt`, the MSQ the inputs should serialize to:

```bash
cp test/serializer-tests/msq/actual/<test>.txt test/serializer-tests/msq/expected/<test>.txt
```

**Important note:** in the serializer suite, the four JSON folders' `expected/` files are not baselines, they are the **inputs**. Their `actual/` files are what the serialized text parsed back to. When those differ, the round trip is broken, and copying them over `expected/` would change what the test starts from so that it agrees with the bug. Only do it when the parser's own output for that page has legitimately changed.

## 3. The discipline

A diff you did not intend is a regression. It does not matter how small it is or how harmless it looks: if the change you made does not explain it, something else changed, and adopting it buries that.

It buries it for good, because from then on the suite defends the new output. The next person who fixes it sees a failing test and has to decide whether the old baseline was right.

So, before you adopt, you have to remember the following rules:

1. **Say what you expect to change before you run.** A glyph moved: every test in that font, at that glyph. A slur fixed: the tests with slurs. Then check the failures against that.
2. **Open every failing artifact, not just the first.** A test fails on the first artifact that differs; the others may differ too, for another reason.
3. **Treat a surprise as a bug until you have explained it.** A drawing change that altered `page-schema`, a MIDI change that altered the SVG, a change under Bravura and not under Leland.
4. **Adopt per artifact when you are fixing, per test when you are writing.** **Adopt all** is the right button for a test you have just added. On a failing test, it adopts what you have not looked at along with what you have.

## 4. Reviewing a baseline change in a pull request

In a pull request, a changed baseline is a changed file under some `expected/`. First list them, so you know the size of it:

```bash
git diff --stat main...HEAD -- ':(glob)test/**/expected/**'
```

Every test in that list should be explained by the description of the pull request. A test that changed and is not explained is the first thing to ask about.

JSON and MSQ baselines can be read in the diff. An SVG diff cannot, so compare the drawings. The quickest way is to put the old baselines back in the working tree and let the test viewer do it:

```bash
git checkout main -- test/visual-tests/bravura/svg/expected
node scripts/visual-tests.js --only=chords-basics
```

Now the viewer shows **expected** from `main` beside **actual** from the pull request, which is exactly the change under review. When you are done, put the pull request's baselines back:

```bash
git checkout HEAD -- test/visual-tests/bravura/svg/expected
```

Then run the same suite once more, so its passed and failed lists describe the pull request again rather than the comparison you just made.

For a single file, `git show main:test/visual-tests/bravura/svg/expected/chords-basics.svg > before.svg` gives you the old drawing to open beside the new one.

A pull request that changes baselines and not the code that produces them, or code and none of the baselines it should have moved, is worth a second look either way.

Read next: [Coverage](/docs/testing/coverage)
