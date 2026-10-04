# Font viewer

The font viewer is where the music fonts are tuned. It traces one glyph at a time out of a font file, engraves it in real music, and writes the result back into the font's music-js table. It lives at **https://127.0.0.1:8889/html/font-viewer.html**.

## 1. What it shows

The page has three tabs, one per font family the drawer engraves with:

| Tab | What it tests | Where the faces come from |
| --- | --- | --- |
| **Music** | one glyph of a music font, on a stave | `src/drawer/font/music/*.otf` with a table in `src/drawer/font/music-js/` |
| **Text** | a text face, in a title, a subtitle, an instrument name, a tempo mark, a text label and a line of lyrics | `src/drawer/font/text/*.ttf` |
| **Chord letters** | a chord-letter face, over a progression with accidentals, a slash bass and superscript numerals | `src/drawer/font/chord-letters/*.ttf` |

Every list on the page is read off those folders by `GET /dev/fonts`, so a font you add shows up without a restart. A music font is only offered once it has a music-js table: a `.otf` with no table beside it is a font the [Font generator](/docs/dev-tools/font-generator) still has work to do on, and engraving with it would draw nothing.

The **Glyph table entry** picker lists every glyph the drawer can draw. It comes from `GET /dev/music-js-entries`, which puts two sources together: the entries the scaffold in `tools/smufl/scaffold.js` declares, in the scaffold's order, and after them any entry that every music-js font holds but the scaffold does not name. Those are marked **in the fonts only**, which is how a glyph added to the tables by hand gets picked up at all.

## 2. Tracing a glyph

Let's take a look at the **Music** tab. You choose a music font and a glyph table entry, and the page fills in the rest:

| Field | What it is |
| --- | --- |
| **Character or U+XXXX** | the codepoint to trace; a literal character, `U+E050`, `e050` and `0xE050` all work |
| **Font size (× interval)** | the size the glyph is drawn at, **4.0** by default, the `musicFontSourceSize` every committed table uses |
| **Interval between stave lines** | **8.5** by default, the interval the committed tables were traced at |
| **yCorrection** | the vertical correction this font currently holds for this entry |

The yCorrection is read out of the selected font's own music-js file, not out of the scaffold, because that is the value Apply would overwrite. Most glyphs are not positioned by a yCorrection at all (an articulation sits at a `yOffset` from its note), and for those the field is disabled.

**← Previous** and **Next →** walk the entries in the scaffold's order, a family at a time. Most of the tuning is done that way: going along the list one glyph at a time and seeing which ones sit wrong.

The **Points** panel shows the traced path, written the way the music-js files hold it: each command letter on its own line, each coordinate as `n.nn * intervalBetweenStaveLines`. **Copy points** puts it on the clipboard in exactly that form.

## 3. Seeing it before writing it

The engraved example is drawn by the worker, out of the font module the worker imported. So a traced glyph can only reach the stave through a different module. The page sends what you traced to `POST /dev/font-glyph/preview`, which makes the same edit Apply would make and returns the font source without writing it. The page turns that source into a blob and registers it as a font of its own, and the example is engraved with it.

As a result you see a changed size, interval or yCorrection on the stave straight away, and nothing on disk has changed yet.

## 4. Writing it back

**Apply** sends the same request to `POST /dev/font-glyph`, and that one writes. It replaces the entry's first point array and its `yCorrection` in `src/drawer/font/music-js/<font>.js`, and leaves every other line of the file as it was. Only the first point field is written, because the viewer traces one character at a time: an entry with an up and a down form is two separate visits.

It's important to mention three things that follow from writing a table:

1. The viewer reads and writes the source file in `src/`, but the browser apps load a copy of it from `static/js/msq/worker/`. Run `npm run msq:apps:update` (or keep `npm run watch:src` running) before you look at the change anywhere else.
2. A changed glyph changes every SVG engraved with that font, so the visual suite for that font will fail until you adopt the new baselines. More about that you can read in [Baselines](/docs/testing/baselines).
3. The music-js files are generated, and the endpoint finds an entry by walking their lines, one property per line. Keep that formatting if you edit a table by hand, or the viewer will not find the entry.

## 5. The examples it engraves

The music a glyph is judged in is not generated. It is one MSQ file per entry in `dev-tools/glyph-examples/`, named after the entry: `accent.txt`, `treble.txt`, `dynamicLetters.ff.txt`. The two faces have `_text.txt` and `_chord-letters.txt`, the leading underscore marking them as not a glyph. Where two entries differ only in case, as `noteLetters.T` and `noteLetters.t` do, the upper-case one takes a `.upper` suffix (`noteLetters.T.upper.txt`), so a file system that ignores case cannot let one overwrite the other.

You can fix a bad example by writing music. Open the source in the editor under **Engraved example**, change it, and press **Save this example**. After you confirm, `POST /dev/glyph-example` writes it back to `dev-tools/glyph-examples/<file>`, and it is what the next person sees that glyph in.

## 6. Adding a text or chord-letter face

The **Text** and **Chord letters** tabs each have an upload. A text face goes in as `<Family>-Regular.ttf` and `<Family>-Bold.ttf`, both at once if you like. A chord-letter face is one `.ttf`. Either is written to its folder by `POST /dev/fonts/upload` and is usable straight away, because these are fonts the engine reads directly and there is nothing to trace. A face with no bold is still offered, with its regular standing in for the bold.

The name you use in the music is derived from the file name: `NotoSerif-Regular.ttf` is `noto-serif` to `text font is …`, and `GentiumPlus-Regular.ttf` is `gentium plus` to `chord letters font is …`.

Read next: [Font generator](/docs/dev-tools/font-generator)
