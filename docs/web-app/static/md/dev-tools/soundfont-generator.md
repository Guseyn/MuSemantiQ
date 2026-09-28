# Magenta soundfont generator

This page renders a General MIDI soundbank, an `.sf2` file, into the sample set the MIDI player loads. It is the page version of the command in [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder), and it lives at **https://127.0.0.1:8889/html/magenta-sound-font-generator.html**.

## 1. What a sample set is, and why you need one

The player under `msq-midi`, `msq-svg-midi` and the editor does not synthesise sound. It is built on Magenta's `SoundFontPlayer`, which plays recorded samples: one mp3 per note and velocity, per instrument, in a folder layout of its own. By default it fetches Magenta's own set from `storage.googleapis.com`.

A set of your own means two things: the sound comes from your own server rather than someone else's, and it is the soundbank you chose. An `.sf2` file cannot be played directly, so it has to be rendered into that layout first, and that is what this page does.

## 2. What must be on PATH

Two programs do the actual work, and both have to be on the **server's** PATH:

- **FluidSynth** renders each note of the soundbank to a WAV file
- **Lame** encodes each WAV to mp3

On macOS:

```bash
brew install fluidsynth lame
```

The page does not check for them before you start. The renderer does, and if either is missing the render fails at once with `Can't find 'lame' command` or `Can't find 'fluidsynth' command` in its log.

## 3. The four tabs

**Upload soundbank.** Choose an `.sf2`. A full General MIDI bank is often **300 MB** and more, so it is not read into the page the way the font generator reads a font: it is streamed to `POST /dev/magenta/upload?name=<file>.sf2` with a progress bar, and written to `src/midi/sound-banks/`.

**Render Magenta SF.** Pick an uploaded bank and say which General MIDI programs to render, as numbers and ranges: `0,40,73`, `0-10,15,20-40`, or `0-127` for all of them. **which program is which instrument** opens the list of the 128 programs in their sixteen families, with the folder each lands in. Program **0** is always rendered, whether you ask for it or not, because it is what the player falls back to for a note that names no program.

**Rendered sets.** Every set under `src/midi/magenta-sound-font/`, with its instruments and how many samples each holds. You can delete a whole set or one instrument out of it. It asks first, because deleting is the one thing on this page that destroys work, and it refuses to touch a set that is being rendered.

**Test soundfonts.** A bench for hearing a set, described below.

## 4. It takes hours

A render is started in the background by `POST /dev/magenta/generate` and outlives the request that started it. It also outlives the page and the server: the renderer runs detached, in its own process group, and what the server needs to pick it back up is written to `.generator-logs/rendering.json`. You can close the page, restart the dev tools, and come back.

While it runs, the page asks `GET /dev/magenta/progress` every three seconds. The renderer writes one line to its log each time it finishes a note at every velocity, and walks the **88** keys of a piano (A0 to C8) per instrument, so the progress is real: notes done against programs × 88, which instrument it is on, and, once enough notes are done to mean anything, about how long is left. Only one render runs at a time.

The whole log is kept at `.generator-logs/magenta-<set>.log`, and the page shows the last forty lines of it. When a render fails, that log is what is left to look at.

**Stop rendering** asks first, then kills the whole process group, so FluidSynth and Lame stop too. Every instrument it had finished is kept. The one it was in the middle of is not complete, and its half-written note is swept up.

When a render ends, finished or stopped, the server runs `scripts/setup-symlinks.js`, which links the set into the `static/magenta-sound-font/` folder of every browser app. The card then says the set is linked and ready to play.

## 5. How much disk a set costs

Each instrument is **88** notes × **29** velocities, which is **2,552** mp3 files plus an `instrument.json`. Rendered from **FluidR3_GM**, that is about **105 MB** per instrument. So three instruments are about 300 MB, and all 128 programs would be about 13 GB. It's better to start with the few programs you need, like `0,40,73`, before committing to the lot.

**Side note:** the page itself says a full set is about 184 MB. That figure does not match what the renderer writes today; the numbers above are measured from a set on disk.

Both folders are gitignored: `src/midi/sound-banks/*` and `src/midi/magenta-sound-font/*`, except their `.gitinfo` files.

## 6. Testing a set

A set is judged by ear, not by its file count: whether the samples are in tune, whether the instrument is the one asked for, whether a note sounds at all. The **Test soundfonts** tab engraves a short passage in an editor and plays it through whichever set you pick, from `/magenta-sound-font/<set>`, the same URL either app would load it from. **Magenta's own (over the network)** is in the list too, so you have something to compare with.

The passage is two staves titled **Piano**, which is program **0**, and every set holds program 0 because the renderer always renders it. That matters, because a stave sounds as the instrument its title names, and Magenta's player simply skips a note whose program is not in the set, with nothing but a line in the console. To hear another instrument of the set, change the instrument titles in the passage to that instrument and render it again.

Read next: [MusicXML tool](/docs/dev-tools/musicxml-tool)
