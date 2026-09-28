# MusicXML tool

The MusicXML tool converts a score in either direction, MusicXML to MSQ and MSQ to MusicXML, and engraves what comes out. It lives at **https://127.0.0.1:8889/html/music-xml.html**, and it is marked **beta**: MusicXML is a large format, and the converters cover what MuSemantiQ itself can express.

The converters are `tools/musicxml/fromMusicXml.js` and `tools/musicxml/toMusicXml.js`, described in [MusicXML import](/docs/tools/musicxml-import) and [MusicXML export](/docs/tools/musicxml-export). This page is the quickest way to try them.

## 1. MusicXML in

The **MusicXML in** tab takes a `score-partwise` document (a `score-timewise` one is turned partwise first). You can paste it, or simply drop a `.musicxml` file anywhere on the page. **Load a sample** makes one for you by exporting a test from the corpus, so there is always a score this build can produce.

**Convert and engrave** posts it to `POST /dev/musicxml/import`, and you get back:

- the page title, and how many measures and staves it has
- the page, engraved
- what could not be carried over (see below)
- the same page written back as MSQ, with **Copy the MSQ**
- the page schema, the custom styles and the MIDI settings, each under its own heading

The MSQ is the form you would actually keep, and it is far easier to judge an import by reading the language than by reading a tree of JSON, so the tool runs the serializer for you.

## 2. MusicXML out

The **MusicXML out** tab takes MSQ. Write it yourself, or pick any test of the visual corpus from the list, and **Convert and engrave** posts it to `POST /dev/musicxml/export`.

The result is two engravings side by side: **from the source**, the page as MuSemantiQ engraves it, and **after the round trip**, the same page written out as MusicXML and read straight back in. They should be the same music. **Copy the MusicXML** takes the file, and **Send it to the other tab** runs it through the import, so you can see what the importer makes of it.

## 3. Why it engraves on the server

The converting itself is pure and could run in the page. The engraving cannot, because it needs the fonts, and those live on disk. So both endpoints load the fonts once with `setupFonts()`, which in Node reads **Bravura**, **Leland**, **Noto Serif**, **Noto Sans**, **Gentium Plus** and **Gothic A1** straight from `src/drawer/font/`, and keep them for every request after. Doing both on the server keeps a conversion to one request, and what you look at is what the renderer actually produced, not an approximation of it.

It's important to mention that a page is only engraved when its schema is valid. When the import produces a schema that is not, the header says **the page schema is not valid** and nothing is drawn, but the MSQ and the JSON are still there to read.

## 4. Reading what was not carried over

On the **MusicXML in** tab, under the score, **Not carried over** lists what the importer dropped, one line per kind of thing, with how many times it happened:

```text
<schleifer> — 2 times
a page break, which becomes a line break — 1 time
```

When nothing is listed, the page says **Everything in the file has a place on the page.** Take that for what it says: the list names the features the converter knows it cannot hold. An element it does not know at all is skipped without a word, so judge a conversion by the stave, not by its having finished or by an empty list.

The export has a report of its own, which `/dev/musicxml/export` returns as `report`, but at the moment the **MusicXML out** tab does not show it. What it can hold is described in [MusicXML export](/docs/tools/musicxml-export).

## 5. When something did not survive

As you may notice, the tool gives you three places to look, and they narrow it down:

1. **Compare the two engravings.** If the music differs, the difference is on the stave, and you can see which measure and which staff.
2. **Read the MSQ.** It is the page the converter built, written out. A note on the wrong octave, a missing slur, a key signature that went astray is a line you can read, and often the line you would write by hand to fix it.
3. **Read the report.** If what is missing is named there, it is a limit of the converter, not a mistake in the file.

If the loss is in the file you are importing, the fix is usually to copy the MSQ, correct it by hand, and keep that. If the loss is in the converter, the case to reproduce it is the smallest MusicXML that shows it, and **Send it to the other tab** is how you find it: export a corpus test, import it back, and see what changed.

Read next: [Test viewer](/docs/dev-tools/test-viewer)
