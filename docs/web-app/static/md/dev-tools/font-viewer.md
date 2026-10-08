# Font Viewer

<nav is="docs-contents"></nav>

The font viewer is where the music fonts are tuned. You trace one glyph out of a font file, see it in real music, and write it back into the font's music-js table.

Open https://127.0.0.1:8889/html/font-viewer.html:

![Font viewer](/images/dev-tools/font-viewer.png)

## Why the Music Fonts Need Tuning

- MSQ doesn't draw music symbols with the font file. Each symbol, or glyph, is traced once into a path, and the path is kept in a JavaScript file, the music-js font: `src/drawer/font/music-js/<font>.js`.
- That's why a score is only paths. It looks the same in every browser and every SVG viewer, and nobody needs the font installed to see it.
- But a traced path loses the font's baseline: it starts from its own top-left corner. So the drawer needs to know where to put each glyph. For example, how high a note head sits on its line, or how far a clef goes below the stave. These numbers are **yCorrection**, and for articulations **yOffset**.
- Font files don't have these numbers, and every font draws its glyphs in a slightly different size and position. So they are set by eye, for every music font.
- The [Font generator](/docs/dev-tools/font-generator) starts every number from the middle between Bravura and Leland. So a new font is close, but accidentals, articulations and clefs are usually a little off until you tune them here.

## How to Use It

1. Choose a tab: **Music**, **Text** or **Chord letters**.
2. On the **Music** tab, choose a music font and a **Glyph table entry**. The character, the font size, the interval between stave lines and the yCorrection are filled in for you.
3. Change the font size, the interval or the yCorrection. The **Engraved example** is redrawn straight away, and nothing is written to disk yet.
4. Use **← Previous** and **Next →** to go through the glyphs one by one.
5. Press **Apply** to write the glyph into `src/drawer/font/music-js/<font>.js`.

**Copy points** copies the traced path in the same form the music-js files use.

## Good to Know

- The browser apps use a copy of `src`. Run `npm run msq:apps:update`, or keep `npm run watch:src` running, to see the change there.
- A changed glyph changes every score engraved with that font, so the visual tests for that font fail until you adopt the new baselines. More about that you can read in [Baselines](/docs/testing/baselines).
- The music each glyph is shown in is a file in `dev-tools/glyph-examples/`. You can change it in the editor under **Engraved example** and press **Save this example**.
- On the **Text** and **Chord letters** tabs you can upload a new `.ttf` face. Its name in the music comes from the file name: `NotoSerif-Regular.ttf` is `noto-serif`, and `GentiumPlus-Regular.ttf` is `gentium plus`.
- A music font shows up here only when it has a music-js table. A new `.otf` gets one from the [Font generator](/docs/dev-tools/font-generator).

Read next: [Font generator](/docs/dev-tools/font-generator)
