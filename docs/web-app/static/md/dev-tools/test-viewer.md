# Test Viewer

<nav is="docs-contents"></nav>

The test viewer shows what the last test run produced next to the committed baseline, and lets you adopt the new output when it is what you meant. Every failing test run prints a link to it. How the tests work you can read in [The Three Suites](/docs/testing/the-suites).

Open https://127.0.0.1:8889/html/test-viewer.html:

![Test viewer](/images/dev-tools/test-viewer.png)

## How to Use It

1. Choose **Visual** or **Audio**. For the visual tests, also choose the font: **Visual · Bravura** or **Visual · Leland**.
2. Choose a test: search for it, or use **← Previous** and **Next →**. A test that failed the last run is marked.
3. Click an artifact: `svg`, `midi`, `page-schema` and so on. An artifact that differs is marked with **•**. The expected one is on the left, and the actual one is on the right.
4. If the difference is exactly the change you meant, press **Adopt &lt;artifact&gt;** for that one artifact, or **Adopt all** for the whole test.

You can also write tests here:

- **Add test** writes a new test into every suite of its kind, and runs it. For the visual tests, the Leland copy starts with `music font is leland`.
- **Edit test** changes the music of a test, and runs it again.
- **Delete test** removes a test, with all its artifacts, from every suite.

## Good to Know

- The viewer doesn't run the tests. It shows what the last run wrote, so run the tests first.
- The serializer tests are not here. You compare and adopt them by hand, as described in [Baselines](/docs/testing/baselines).
- Adopting in **Bravura** doesn't change **Leland**. Each font has its own baselines.
- Before you adopt, check that only the tests you expected have changed, and only in the artifacts you expected. A drawing change that also changed `page-schema` or `errors` has reached the parser.

Read next: [The Three Suites](/docs/testing/the-suites)
