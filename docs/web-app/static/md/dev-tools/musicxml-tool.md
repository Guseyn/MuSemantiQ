# MusicXML Tool [beta]

<nav is="docs-contents"></nav>

The MusicXML tool converts MusicXML to MSQ and MSQ to MusicXML, and engraves the result, so you can see what the conversion kept. The converters themselves are described in [MusicXML Import](/docs/tools/musicxml-import) and [MusicXML Export](/docs/tools/musicxml-export).

**Important note:** this feature is in beta. Unlike the rest of the code, it was mostly drafted with an LLM, and it needs a deeper approach. I added it just to help you migrate your scores to MSQ, so it solves this problem only partly. MusicXML is a difficult and poorly documented format, so improving it is not a high priority task at the moment, although it may be more important than I think.

Open https://127.0.0.1:8889/html/music-xml.html:

![MusicXML tool](/images/dev-tools/musicxml-tool.png)

## From MusicXML to MSQ

1. On the **MusicXML in** tab, paste a MusicXML document, or drop a `.musicxml` file anywhere on the page. **Load a sample** gives you one.
2. Press **Convert and engrave**.
3. You get the engraved page, the list of what was **Not carried over**, and the same page written as MSQ, which you can take with **Copy the MSQ**.

## From MSQ to MusicXML

1. On the **MusicXML out** tab, write MSQ, or choose a test from the corpus.
2. Press **Convert and engrave**.
3. You get two engravings: the page from your MSQ, and the same page after it was written to MusicXML and read back. They should be the same music.
4. **Copy the MusicXML** copies the file, and **Send it to the other tab** converts it back on the **MusicXML in** tab.

## Good to Know

- **Not carried over** lists only what the converter knows it drops. Something it doesn't know at all is skipped silently, so judge a conversion by the engraved page.
- A page is engraved only when its page schema is valid. Otherwise you still get the MSQ and the JSON.
- At the moment, the **MusicXML out** tab doesn't show what the export could not carry over.

Read next: [Test viewer](/docs/dev-tools/test-viewer)
