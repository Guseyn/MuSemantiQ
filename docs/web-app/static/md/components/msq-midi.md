# msq-midi

`msq-midi` turns the music into a MIDI file and gives you a player for it. It draws no score.

It is the one component that needs no fonts, so it takes no `data-font-sources` and does not have to wait for a `msq-font-loader`. Fonts are only needed to draw glyphs, and playback never draws anything: the MIDI is made from the notes and their durations, the tempo and the [MIDI settings](/docs/language/midi-settings), none of which depend on how a note looks.

Let's start with a simple example:

```html
<template is='msq-midi'>
  measure
  treble clef
  c d e f
</template>
```

```msq-midi
measure
treble clef
c d e f
```

## 1. The attributes

| Attribute | Default | What it does |
| --- | --- | --- |
| `data-sound-font` | empty, which means Magenta's own sound font | The URL of a Magenta-format sound font the player loads its samples from |
| `data-file-name` | a random id of the element | The name of the downloaded MIDI file, without the extension |

## 2. Sound fonts

The player plays through Magenta's `SoundFontPlayer`, which does not synthesize anything: it plays recorded samples, one short audio file per instrument, pitch and velocity. A sound font is a folder of them:

```
<sound font>/soundfont.json
<sound font>/<instrument>/instrument.json
<sound font>/<instrument>/p<pitch>_v<velocity>.mp3
```

By default, the player loads Magenta's own sound font, `https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus`, which holds every General MIDI instrument. But you can easily point it at your own:

```html
<template is='msq-midi' data-sound-font='/magenta-sound-font/FluidR3_GM'>
  measure
  treble clef
  c d e f
</template>
```

You can make a sound font of your own from any `.sf2` soundbank, with the [Magenta soundfont generator](/docs/dev-tools/soundfont-generator) in the dev tools or with the [Magenta soundfont builder](/docs/tools/magenta-soundfont-builder) from the command line. Every app in this repository serves the sets rendered that way under `/magenta-sound-font/`, by a symlink to `src/midi/magenta-sound-font`, which `npm run setup:symlinks` creates.

**Important note:** a sound font plays only the instruments it holds. The player loads just the samples the music needs, when it loads the music, so a sound font rendered with piano alone plays nothing for a violin.

## 3. The player

The player shows a play and stop button, the elapsed and the total time, and a seek bar. While the samples are loading, the controls are disabled and the panel shimmers. If the music cannot be loaded, the button shows an error icon, and the error is the panel's tooltip.

Next to the controls there are two buttons of its own:

| Button | What it does |
| --- | --- |
| Download | Downloads the MIDI file as `<data-file-name>.midi` |
| Copy | Copies the MSQ source to the clipboard |

Only one player on a page plays at a time: starting one stops whichever was playing.

For script, the player is a `<midi-player>` element inside the rendered element's shadow root. It fires `load` when the samples are ready, `start` and `stop` around playback (`stop` has `event.detail.finished`), `loop` when it starts again by itself, and `note` for every note it plays, with the note in `event.detail.note`. It has `currentTime`, `duration` and `playing` properties, and `start()` and `stop()` methods:

```js
const host = document.querySelector('div[data-rendered-by=\'template[is="msq-midi"]\']')
const player = host.shadowRoot.querySelector('midi-player')
player.addEventListener('stop', (event) => {
  console.log(event.detail.finished ? 'played to the end' : 'stopped')
})
```

## 4. A worked example

Let's hear something with a tempo and an instrument of its own. The instrument and the default tempo are MIDI settings: they change what is heard, and never what is drawn.

```html
<template is='msq-midi' data-file-name='a-short-tune'>
  default instrument is flute
  default tempo is "1/4 = 96"

  measure
  treble clef
  time signature is 3:4
  1/4 g a b

  measure
  1/2 c5 dotted
</template>
```

```msq-midi file-name=a-short-tune
default instrument is flute
default tempo is "1/4 = 96"

measure
treble clef
time signature is 3:4
1/4 g a b

measure
1/2 c5 dotted
```

As you can see, the music is written exactly as it would be for a score. You can take the same text and give it to `msq-svg` or `msq-svg-midi` without changing a word.

Read next: [msq-svg-midi](/docs/components/msq-svg-midi)
