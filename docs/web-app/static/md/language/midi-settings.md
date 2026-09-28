# MIDI settings

A page is not only drawn, it is also played. MIDI settings change how it sounds: the instrument, the tempo, and how long a fermata holds. There are three of them, and they are written just like styles: the name, `is`, and a value, on a line of their own.

It's important to mention that MIDI settings change only what you hear, and never what you see. The score is drawn exactly the same with or without them. That's also why every example comes with a player: press **Render the score**, and then play, to hear the difference.

## 1. Default instrument

By default a page is played on a piano. You can set `default instrument` for the whole page without mentioning an instrument anywhere in the score:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default instrument is guitar

measure
treble clef
c d e f
g a b c5
</template>
</div>

As you remember from [Instrument titles](/docs/language/instrument-titles), a stave can have an instrument title. When the title is a name MuSemantiQ knows, the stave is played on that instrument, and it wins over the default one. So in the following example the first stave is played on a flute, and the second one on the default instrument, a cello:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default instrument is cello

measure
instrument title is "Flute" for stave 1
stave with treble clef
1/2 c5 e5
stave with bass clef
1/2 c3 g2
</template>
</div>

An instrument title is found by its whole name, in any case, and if that is not a name MuSemantiQ knows, by its first word. So a stave titled "Violin I" is played on a violin. The value of `default instrument` has to be one of the names exactly, in lower case.

The names follow the General MIDI list of instruments, and many of them have shorter forms. Here are all the names that are recognised, with the number of the MIDI program each one plays:

| Program | Names |
|---|---|
| 0 | `acoustic grand piano`, `grand piano`, `piano` |
| 1 | `bright acoustic piano`, `bright piano` |
| 2 | `electric grand piano`, `electric piano` |
| 3 | `honky-tonk piano`, `honky-tonk` |
| 4 | `electric piano 1` |
| 5 | `electric piano 2` |
| 6 | `harpsichord`, `harp` |
| 7 | `clavi` |
| 8 | `celesta` |
| 9 | `glockenspiel` |
| 10 | `music box` |
| 11 | `vibraphone`, `vibra` |
| 12 | `marimba` |
| 13 | `xylophone`, `xylo` |
| 14 | `tubular bells`, `bells` |
| 15 | `dulcimer` |
| 16 | `drawbar organ` |
| 17 | `percussive organ` |
| 18 | `rock organ` |
| 19 | `church organ`, `organ` |
| 20 | `reed organ` |
| 21 | `accordion` |
| 22 | `harmonica` |
| 23 | `tango accordion` |
| 24 | `acoustic guitar (nylon)`, `classic guitar`, `nylon guitar` |
| 25 | `acoustic guitar (steel)`, `acoustic guitar`, `concert guitar`, `steel guitar`, `guitar` |
| 26 | `electric guitar (jazz)`, `electric jazz guitar`, `jazz guitar` |
| 27 | `electric guitar (clean)`, `electric guitar`, `electric clean guitar`, `clean guitar` |
| 28 | `electric guitar (muted)`, `electric muted guitar`, `muted guitar` |
| 29 | `overdriven guitar` |
| 30 | `distortion guitar` |
| 31 | `guitar harmonics` |
| 32 | `acoustic bass`, `bass` |
| 33 | `electric bass (finger)`, `electric finger bass`, `finger bass`, `bass guitar` |
| 34 | `electric bass (pick)`, `electric pick bass`, `pick bass` |
| 35 | `fretless bass` |
| 36 | `slap bass 1` |
| 37 | `slap bass 2` |
| 38 | `synth bass 1` |
| 39 | `synth bass 2` |
| 40 | `violin` |
| 41 | `viola` |
| 42 | `cello` |
| 43 | `contrabass` |
| 44 | `tremolo strings`, `strings` |
| 45 | `pizzicato strings` |
| 46 | `orchestral harp` |
| 47 | `timpani` |
| 48 | `string ensemble 1` |
| 49 | `string ensemble 2` |
| 50 | `synthstrings 1` |
| 51 | `synthstrings 2` |
| 52 | `choir aahs` |
| 53 | `voice oohs` |
| 54 | `synth voice` |
| 55 | `orchestra hit` |
| 56 | `trumpet` |
| 57 | `trombone` |
| 58 | `tuba` |
| 59 | `muted trumpet` |
| 60 | `french horn`, `horn` |
| 61 | `brass section` |
| 62 | `synthbrass 1`, `synthbrass 2` |
| 63 | `soprano sax` |
| 64 | `alto sax` |
| 65 | `tenor sax` |
| 66 | `baritone sax` |
| 67 | `oboe` |
| 68 | `english horn` |
| 69 | `bassoon` |
| 70 | `clarinet` |
| 71 | `piccolo` |
| 72 | `flute` |
| 73 | `recorder` |
| 74 | `pan flute` |
| 75 | `blown bottle` |
| 76 | `shakuhachi` |
| 77 | `whistle` |
| 78 | `ocarina` |
| 79 | `lead 1 (square)`, `square` |
| 80 | `lead 2 (sawtooth)`, `sawtooth` |
| 81 | `lead 3 (calliope)`, `calliope` |
| 82 | `lead 4 (chiff)`, `chiff` |
| 83 | `lead 5 (charang)`, `charang` |
| 84 | `lead 6 (voice)`, `voice` |
| 85 | `lead 7 (fifths)`, `fifths` |
| 86 | `lead 8 (bass + lead)`, `bass + lead`, `bass & lead`, `bass and lead` |
| 87 | `pad 1 (new age)`, `new age` |
| 88 | `pad 2 (warm)`, `warm` |
| 89 | `pad 3 (polysynth)`, `polysynth` |
| 90 | `pad 4 (choir)`, `choir` |
| 91 | `pad 5 (bowed)`, `bowed` |
| 92 | `pad 6 (metallic)`, `metallic` |
| 93 | `pad 7 (halo)`, `halo` |
| 94 | `pad 8 (sweep)`, `sweep` |
| 95 | `fx 1 (rain)`, `rain` |
| 96 | `fx 2 (soundtrack)`, `soundtrack` |
| 97 | `fx 3 (crystal)`, `crystal` |
| 98 | `fx 4 (atmosphere)`, `atmosphere` |
| 99 | `fx 5 (brightness)`, `brightness` |
| 100 | `fx 6 (goblins)`, `goblins` |
| 101 | `fx 7 (echoes)`, `echoes` |
| 102 | `fx 8 (sci-fi)`, `sci-fi` |
| 103 | `sitar` |
| 104 | `banjo` |
| 105 | `shamisen` |
| 106 | `koto` |
| 107 | `kalimba` |
| 108 | `bag pipe` |
| 109 | `fiddle` |
| 110 | `shanai` |
| 111 | `tinkle bell` |
| 112 | `agogo` |
| 113 | `steel drums` |
| 114 | `woodblock` |
| 115 | `taiko drum` |
| 116 | `melodic tom` |
| 117 | `synth drum` |
| 118 | `reverse cymbal` |
| 119 | `guitar fret noise` |
| 120 | `breath noise` |
| 121 | `seashore` |
| 122 | `bird tweet`, `bird`, `tweet` |
| 123 | `telephone ring`, `telephone`, `ring` |
| 124 | `helicopter` |
| 125 | `applause` |
| 126 | `gunshot` |

## 2. Default tempo

By default a page is played at **120** quarter notes per minute. You can set `default tempo`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default tempo is "1/4 = 60"

measure
treble clef
c d e f
g a b c5
</template>
</div>

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default tempo is "1/4 = 200"

measure
treble clef
c d e f
g a b c5
</template>
</div>

Unlike a style, the value of `default tempo` is written in quotes, because it is the same text a tempo mark takes, and it is understood the same way. As you remember from [Tempo and metronome marks](/docs/language/tempo-and-metronome-marks), that text can be a duration and a number, like **"1/4 = 76"** or **"1/2 = 60"**, a tempo word, like **"Andante"**, or both. A word on its own gives the tempo that word usually means:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default tempo is "Andante"

measure
treble clef
c d e f
g a b c5
</template>
</div>

The difference is that a tempo mark is drawn, and the default tempo is not. That's what the default tempo is for: a score that has to be played at a certain speed, but that you don't want to put a metronome mark on.

When the first measure has a tempo mark of its own, the default tempo is not used at all: what is written on the page wins. And a tempo mark further on changes the tempo from its measure, whatever the default was:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
default tempo is "1/4 = 60"

measure
treble clef
c d e f

measure
tempo is "1/4 = 120"
c d e f
</template>
</div>

## 3. Fermata duration

A fermata holds the music: the unit under it sounds longer, and everything after it comes later. By default a fermata on a unit adds **2** seconds, and a fermata over a barline adds **2.5** seconds. You can set how many **seconds** a fermata adds with `fermata duration`, and it works both for the fermata articulation and for the fermata at the end of a measure:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
fermata duration is 0.5

measure
treble clef
1/4 c with fermata
d e f
</template>
</div>

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
fermata duration is 4

measure
ends with fermata
treble clef
c d e f

measure
g a b c5
</template>
</div>

The number can have a fraction, and it can be **0**, in which case a fermata is drawn but doesn't hold the music at all.

## 4. Spellings and values

| Setting | Value | Default |
|---|---|---|
| `default instrument` | one of the names above, without quotes | **acoustic grand piano** |
| `default tempo` | the text of a tempo mark, in quotes | **120** quarter notes per minute |
| `fermata duration` | a number of seconds, without quotes | **2** on a unit, **2.5** over a barline |

Like styles, MIDI settings apply to the whole page wherever they are written, and if you set the same one twice, the last one wins. A value that is not recognised, like an instrument that is not in the table, is reported as an error, as explained in [Handling errors](/docs/language/handling-errors), and the default is used.

Read next: [Command index](/docs/language/command-index)
