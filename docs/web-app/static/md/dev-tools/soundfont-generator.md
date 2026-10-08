# Magenta Soundfont Generator

<nav is="docs-contents"></nav>

This page turns a General MIDI soundbank, an `.sf2` file, into the samples the MIDI player plays. By default the player loads Magenta's own samples from `storage.googleapis.com`. With this page, you serve your own. It does the same as the command in [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder).

Open https://127.0.0.1:8889/html/magenta-sound-font-generator.html:

![Magenta soundfont generator](/images/dev-tools/soundfont-generator.png)

## Before You Start

FluidSynth and Lame have to be installed where the dev tools run. On macOS:

```bash
brew install fluidsynth lame
```

## How to Use It

1. On **Upload soundbank**, choose an `.sf2` and press **Upload it**. It is saved to `src/midi/sound-banks/`.
2. On **Render Magenta SF**, choose the soundbank and the General MIDI programs to render, for example `0,40,73`, `0-10` or `0-127`. **which program is which instrument** shows the list.
3. Wait. A render takes hours. You can close the page and come back, and the page shows the progress.
4. When it ends, the set is linked into every browser app, under `/magenta-sound-font/<set>`.
5. On **Test soundfonts**, play a short passage with your set, and compare it with Magenta's own.

## Good to Know

- Program **0**, the piano, is always rendered, because the player falls back to it.
- Only one render runs at a time. **Stop rendering** stops it, and every instrument that was finished is kept.
- One instrument takes about **105 MB**, so all 128 programs take about 13 GB. Start with the few programs you need.
- **Rendered sets** lists your sets. You can delete a whole set or one instrument from it.
- The soundbanks and the rendered sets are not committed to git.

Read next: [Test viewer](/docs/dev-tools/test-viewer)
