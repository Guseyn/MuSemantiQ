# Magenta soundfont builder

<nav is="docs-contents"></nav>

`tools/magenta/generate-magenta-sound-font.js` turns an `.sf2` soundbank into a sound font for the player in `<msq-midi>`, `<msq-svg-midi>` and `<msq-editor>`. The [Magenta soundfont generator](/docs/dev-tools/soundfont-generator) page in the dev tools runs the same script.

## What You Need

FluidSynth and Lame in your PATH:

```bash
brew install fluidsynth lame
```

## How to Run It

```bash
node tools/magenta/generate-magenta-sound-font.js <soundfont.sf2> [instruments] [output dir] [--yes]
```

For example, a grand piano (**0**), a violin (**40**) and a flute (**73**):

```bash
node tools/magenta/generate-magenta-sound-font.js src/midi/sound-banks/FluidR3_GM.sf2 0,40,73
```

- `instruments`: General MIDI program numbers and ranges, like `0,40,73` or `0-10`. **0-127** by default.
- `output dir`: **src/midi/magenta-sound-font/&lt;soundbank name&gt;** by default.
- `--yes`: don't wait for you to press return before it starts.
- Program **0** is always added, because the player uses it for any note that doesn't name an instrument.

## What You Get

```text
src/midi/magenta-sound-font/FluidR3_GM/
  soundfont.json
  acoustic_grand_piano/
    instrument.json
    p21_v0.mp3
    …
```

- `soundfont.json`: which folder holds which program. The player reads it first.
- One folder per instrument, with one mp3 for every key (**21** to **108**) and velocity.

## How to Use It

Link the sets into the apps, then point a component at one:

```bash
npm run setup:symlinks
```

```html
<template is="msq-svg-midi" data-font-sources="myFonts" data-sound-font="/magenta-sound-font/FluidR3_GM">
  measure
  treble clef
  c d e f
</template>
```

Without the `data-sound-font` attribute, the player uses Magenta's own sound font from `storage.googleapis.com`.

## What to Remember

- It takes a lot of time and space. One program is about **105 MB**, and all 128 programs take hours.
- Render only the instruments you need.

Read next: [Dev tools](/docs/dev-tools/overview)
