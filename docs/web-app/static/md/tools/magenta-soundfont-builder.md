# Magenta soundfont builder

`tools/magenta/generate-magenta-sound-font.js` renders every note of the General MIDI programs you ask for, out of an `.sf2` soundbank, into the sample layout Magenta's `SoundFontPlayer` reads. The [Magenta soundfont generator](/docs/dev-tools/soundfont-generator) page runs this same script in the background; this page is about running it yourself.

It is ported from the MIDI.js soundfont builder by 0xFE (Mohit Muthanna), as edited by Valentijn Nieman.

## 1. What it renders, and what reads the result

For each program, the script writes a one-note MIDI file for every key and velocity, renders it through **FluidSynth** with your soundbank, and encodes the WAV to mp3 with **Lame**. The result is read by the player inside `msq-midi`, `msq-svg-midi` and `msq-editor`, which is `html-midi-player` on top of Magenta's `SoundFontPlayer`. The player asks for samples by real MIDI pitch and velocity, so that is the layout the script writes.

## 2. Prerequisites, and what it costs

FluidSynth and Lame have to be on your PATH:

```bash
brew install fluidsynth lame
```

The script looks them up with `which`, prints the paths it found, and stops with `Can't find 'lame' command` or `Can't find 'fluidsynth' command` if one is missing.

The cost is time and disk, and both grow with the number of programs:

- every program is the **88** keys of a piano, A0 (21) to C8 (108), at **29** velocities, so **2,552** samples
- every sample holds the note for **4.5** seconds, and FluidSynth renders the release after it
- programs are rendered in parallel, as many at a time as `os.availableParallelism()` says the machine has, but the notes inside one program are one at a time
- one program of **FluidR3_GM** comes to about **105 MB** of mp3, so all 128 would be about 13 GB

A handful of programs takes a while; the whole of General MIDI takes hours. It's better to render the few you need first.

## 3. Running it, and choosing instruments

```bash
node tools/magenta/generate-magenta-sound-font.js <soundfont.sf2> [instruments] [output dir] [--yes]
```

`instruments` is a list of General MIDI program numbers and ranges, and it defaults to `0-127`:

```bash
node tools/magenta/generate-magenta-sound-font.js src/midi/sound-banks/FluidR3_GM.sf2 0,40,73
```

That renders a grand piano (**0**), a violin (**40**) and a flute (**73**). The number of every program is written next to its name in `MIDIJS_PATCH_NAMES` at the top of the script, and the dev tools page lists them by family. A range must go upwards and stay within **0-127**, or the script stops before it starts.

Program **0** is always rendered, whether you ask for it or not. The player plays a note that names no program as program 0, and a set without it falls silent for anything it does not hold, so a set that cannot play a plain note is useless.

Before it starts, the script lists the instruments, the two encoders and the output folder, and waits for you to press return. `--yes` skips that, and so does running it without a terminal, which is how the dev tools run it.

## 4. The output layout

The output folder defaults to `src/midi/magenta-sound-font/<soundbank name>`:

```text
src/midi/magenta-sound-font/FluidR3_GM/
  soundfont.json
  acoustic_grand_piano/
    instrument.json
    p21_v0.mp3
    p21_v20.mp3
    …
    p108_v127.mp3
  violin/
    …
```

Each instrument folder is named after its General MIDI patch, lower-cased with underscores, and each sample is `p<pitch>_v<velocity>.mp3`. `instrument.json` says what is in the folder:

```json
{"name":"acoustic_grand_piano","minPitch":21,"maxPitch":108,"durationSeconds":4.5,"releaseSeconds":1,"percussive":false,"velocities":[0,20,25,30,35,40,45,47,50,55,57,60,65,70,75,80,85,90,95,100,105,110,112,115,117,120,122,125,127]}
```

`soundfont.json` at the root is what the player reads first. It maps a program number to the folder its samples are in, and without it the set cannot be played at all:

```json
{
  "name": "FluidR3_GM",
  "instruments": {
    "0": "acoustic_grand_piano",
    "1": "bright_acoustic_piano"
  }
}
```

It is written from what is on disk rather than from what the run asked for, so a set built up over several runs still names everything it has.

## 5. How an app reaches it

A set is not copied into any app. `npm run setup:symlinks` links each set folder into the `static/magenta-sound-font/` folder of the browser example, the dev tools and the docs, one link per set, and removes links whose set is gone. Every app start runs it, and so does the dev tools page when a render ends. If you ran the script yourself, run it once more:

```bash
npm run setup:symlinks
```

Then point a component at the set by its URL:

```html
<template is='msq-svg-midi' data-font-sources="msqFontSources" data-sound-font="/magenta-sound-font/FluidR3_GM">
  measure
  treble clef
  c d e f
</template>
```

An empty `data-sound-font`, or none at all, means Magenta's own set, fetched from `storage.googleapis.com`. More about that you can read in [msq-midi](/docs/components/msq-midi).

Read next: [MusicXML import](/docs/tools/musicxml-import)
