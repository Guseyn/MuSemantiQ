# msq-svg-midi

`msq-svg-midi` is the score and the player together: the engraved music, with a player under it. As the music plays, every note is highlighted in the score while it sounds.

Let's start with a simple example. Press play:

```html
<template is='msq-svg-midi' data-font-sources='msqFontSources'>
  measure
  treble clef
  c d e f
</template>
```

```msq-svg-midi
measure
treble clef
c d e f
```

It works the other way too. Click a note head or a rest in the score, and the player jumps to it.

## 1. The attributes

| Attribute | Default | What it does |
| --- | --- | --- |
| `data-font-sources` | none, it is required | The reference a `msq-font-loader` registered its fonts under |
| `data-highlight-color` | **#C40233** | The colour of a note while it sounds |
| `data-sound-font` | empty, which means Magenta's own sound font | The URL of a Magenta-format sound font, as in [msq-midi](/docs/components/msq-midi) |
| `data-file-name` | a random id of the element | The name of both downloaded files, without the extension |

The toolbar over the score is the same as in [msq-svg](/docs/components/msq-svg): download the SVG, open it in a new tab, copy the source. The player has the same two buttons as in `msq-midi`: download the MIDI file, copy the source.

By default, a sounding note turns red. But you can easily change that:

```html
<template
  is='msq-svg-midi'
  data-font-sources='msqFontSources'
  data-highlight-color='#1f7a8c'
>
  measure
  treble clef
  c d e f
</template>
```

```msq-svg-midi highlight-color=#1f7a8c
measure
treble clef
c d e f
```

When a note stops sounding, it goes back to the font colour of the score (the one set with the [colour styles](/docs/language/colours)), or to **#121212** when the music sets none.

## 2. How the highlighting works

Both halves come from one request to the worker, which parses the music once and gives back the SVG, the MIDI file and two maps. When the SVG is drawn, every element that belongs to something written in the music carries a `ref-ids` attribute naming it, and the MIDI generator uses the same names: `timeStampsMappedWithRefsOn` maps the moment a note starts (in seconds) to the refs that sound then and how long they last, and `refsOnMappedWithTimeStamps` maps each ref back to its moment. On every `note` event of the player, the component looks up the refs that start within five milliseconds of that note, paints their glyphs with the highlight colour, and paints them back when their duration has passed. A click on a note head or a rest does the reverse: it reads the ref off the clicked glyph, finds its moment, and moves the seek bar there.

## 3. A worked example

Let's take a look at two staves, so you can see a chord and a bass line light up together:

```html
<template is='msq-svg-midi' data-font-sources='msqFontSources' data-file-name='two-staves'>
  default tempo is "1/4 = 84"

  measure
  time signature is 4:4
  stave with treble clef
  1/4 e5 d5 c5 d5
  stave with bass clef
  1/2 chord
  c3 g3
  chord
  g2 d3

  measure
  stave
  1/4 e5 e5 1/2 e5
  stave
  1 chord
  c3 g3
</template>
```

```msq-svg-midi file-name=two-staves
default tempo is "1/4 = 84"

measure
time signature is 4:4
stave with treble clef
1/4 e5 d5 c5 d5
stave with bass clef
1/2 chord
c3 g3
chord
g2 d3

measure
stave
1/4 e5 e5 1/2 e5
stave
1 chord
c3 g3
```

As you may notice, both notes of a chord are highlighted at once, because they start at the same moment.

Read next: [msq-editor](/docs/components/msq-editor)
