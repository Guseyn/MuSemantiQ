# Font generator

The font generator turns a SMuFL `.otf` into the music-js font the drawer reads. It is the page version of the command in [SMuFL to music-js font](/docs/tools/smufl-font-generator), and it lives at **https://127.0.0.1:8889/html/font-generator.html**.

## 1. Generating a font

All you need is to choose an `.otf` (or drop one on the page) and press **Generate the music-js font**. The file is posted to `POST /dev/font/generate`, and the server does three things:

1. it checks that the file starts like a font (`OTTO`, `true`, `ttcf` or `0x00010000`), so a file that is not a font is refused here rather than failing somewhere inside the tracer
2. it saves the `.otf` to `src/drawer/font/music/`, beside Bravura and Leland, because re-tracing a font later needs the source that made it
3. it runs `tools/smufl/generate-smufl-js-font.js` on it, which writes `src/drawer/font/music-js/<name>.js`

The name is the file's own name in lower case, with anything that is not a letter or a digit turned into a dash: `Petaluma.otf` becomes `petaluma.js`, and `music font is petaluma` is what you then write in the music.

A music-js font that already exists has been tuned by hand, and the generator knows none of those corrections. So it is never replaced silently: the server answers **409**, the page asks whether to replace it, and only a second request with `overwrite` set does.

## 2. How long it takes

A font has about two hundred glyphs to trace. From the command line that is well under a second; from the page, with the upload, it is a few seconds. The request stays open until it is done and the page shows the result.

## 3. What it writes

The result card says where the table was written and from which `.otf`, and **what the generator said** holds its whole output. There is no separate report file. The output is where you find out what the font is missing:

```text
  ! noteDot.points: U+E920 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Ped.points: U+F434 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
  ! Soft.points: U+F435 is not in this font — drawn as the "?" of NotoSerif-Regular.ttf
184 point arrays traced, 3 missing (3 drawn as "?")
```

That is what tracing **Petaluma** prints. Each `!` line is a glyph the drawer wants and the font does not have. It is drawn as a question mark rather than left empty, because an empty path has no bounding box and breaks the layout of the page much later, somewhere unrelated. A question mark is a real path, and it says on the page which symbol is missing.

Under the form, **What is there now** lists every music font on disk and whether it has been traced yet.

## 4. Before you adopt the result

What comes out is a scaffold, not a finished font. Every glyph is traced at its real size, but where each one sits, above all its `yCorrection`, starts from the mean of Bravura's and Leland's values, because no font file carries them. So before you use it for anything, you have to remember the following:

1. Read the `!` lines. Each is a glyph that will be engraved as **?** until you give it something to draw.
2. Open the font in the [Font viewer](/docs/dev-tools/font-viewer), walk the entries with **Next →**, and set each correction by eye against the engraved example, until it sits where Bravura's does. Until then, expect accidentals, articulations and clefs to be a little out.
3. Engrave a real score in it. The glyph examples show one sign at a time, and a page shows what a font looks like as a whole.
4. Register it wherever you engrave. The dev tools find it on their own, but the Node API, the CLI and the browser components only use fonts their config names. How to do that end to end is in [Ship your own music font](/docs/recipes/ship-your-own-font).

Read next: [Magenta soundfont generator](/docs/dev-tools/soundfont-generator)
