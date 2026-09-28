# Test viewer

The test viewer shows what the last test run produced beside the committed baseline, and lets you adopt the new one when it is the output you meant. It lives at **https://127.0.0.1:8889/html/test-viewer.html**, and it is the link every failing run prints. How the suites themselves work is in [The three suites](/docs/testing/the-suites).

## 1. Browsing the suites

The page narrows down in three steps: which kind of test, which suite of that kind, which test.

- The **Visual** and **Audio** tabs choose the kind. They are also in the URL, so `#visual` and `#audio` open straight to one.
- Under **Visual** there is one button per font, **Bravura** and **Leland**, because the visual tests run the same corpus once per font. The buttons are read off the folders in `test/visual-tests/`, so a new font folder is a new button, without a restart. **Audio** has one suite, so there is nothing to choose.
- The **Test** picker holds every test of that suite, and you can search it. **← Previous** and **Next →** walk the tests in the order the runner does, which is the order their names sort in, so a prefix like `chords-` stays together. A test that failed the last run is marked as failing, from the suite's `list-of-failed-tests.json`.

It's important to mention that the serializer suite is not in the viewer. Its artifacts are MSQ text and JSON, and you compare and adopt them by hand, as described in [Baselines](/docs/testing/baselines).

## 2. Comparing a test

Once you choose a test, the page asks `GET /dev/tests/status` how each of its artifacts stands, and says either **everything matches** or how many of them differ. Every artifact is a button, and one that differs carries a **•**. The first differing one is opened for you.

An artifact is shown as what it is, with **expected** on the left and **actual** on the right, and the size of each file above it:

| Artifact | Shown as |
| --- | --- |
| `svg` | the score, as an image |
| `midi` | a player, so you can hear both sides |
| `html-highlights` | the highlighted source as the editor would show it, with the markup underneath |
| `page-schema`, `errors`, `custom-styles`, `comments`, `char-progressions`, `midi-settings` | the JSON, as text |

The comparison is the same byte comparison the runners make. A side that does not exist yet says so, which is what a test that has never been run, or never had a baseline, looks like. The **source** link opens the test's MSQ.

The viewer never runs a suite to answer. What it shows is whatever the last run wrote to `actual/`, so run the suite first (the next section is the exception).

## 3. Adopting a new baseline

There are two buttons, and they are the two granularities:

- **Adopt &lt;artifact&gt;** copies that one artifact of this test from `actual/` over `expected/`
- **Adopt all** copies every artifact of this test that has an actual side

Both ask first. Both act on this one test, in this one suite: adopting in **Bravura** does not touch **Leland**, which has its own baselines. When every artifact of the test matches after the copy, the viewer also moves the test from the suite's failed list to its passed one, so it stops being labelled as failing before the next run.

## 4. Writing, editing and deleting a test

**Add test** opens a dialog with a name and an editor. The name is letters, digits, dashes and underscores, with no dots, because the runners take everything before the first dot as the name. The music is written into every suite of the kind: for a visual test that is a copy in `test/visual-tests/bravura/msq/` and one in `test/visual-tests/leland/msq/`, the Leland copy starting with `music font is leland`. A corpus where Bravura has a test Leland does not is a corpus that has stopped comparing anything, so the choice is not offered.

The suite is then run over that one test, with `--only=<name>`, so its artifacts exist the moment you save. Only the actual side is written. The baseline is what you adopt, once you have looked at it.

**Edit test** rewrites the music in every suite of its kind in the same way, and runs it again. **Delete test** removes the source and both sides of every artifact from every suite of its kind, and takes the test out of both lists.

## 5. When adopting is right, and when it is hiding a regression

Adopting is right when you changed something on purpose and the diff is exactly that change. You moved a glyph, and every score in that font moved by the same amount in the same place. You fixed a slur, and the tests with slurs changed and the others did not. You added a test, and there was no expected side to compare with.

Adopting is hiding a regression when the diff is bigger than the change, or somewhere else. Before you press either button, look for these:

1. **Tests you did not expect to change.** A change to beams that alters a test with no beams in it is telling you something.
2. **An artifact that should not have moved.** A drawing change that also changed `page-schema` or `errors` has reached the parser.
3. **One font only, or one suite only.** A visual change that shows under Bravura and not under Leland, or in the visual suite and not in the audio one, is usually a font table, not the engine.
4. **Adopt all as a habit.** It is the right button for a test you have just written. On a failing test it adopts the artifacts you have not opened along with the one you have.

A diff you did not intend is a regression, whatever it looks like. Adopting it makes it the baseline, and from then on the suite defends it.

Read next: [SMuFL to music-js font](/docs/tools/smufl-font-generator)
