# Fermata over barline

A fermata over a barline belongs to the measure, not to a unit: it's drawn over the closing barline of the measure and says that the music pauses there. In order to draw it, you add it to the structure of the measure:

```msq-editor opens-with=text
measure
ends with fermata
treble clef
c d e f
```

The same can be written on one line with `measure`:

```msq-editor opens-with=text
measure ends with fermata
treble clef
c d e f
measure ends with fermata
g a b c5
```

It's one of the forms that are written right after `measure`, like `ends with double barline` from [Barlines](/docs/language/barlines). So it has the same ordering rule: `ends with fermata` must follow `measure` before anything else does, before a clef, a stave or a unit.

You can also declare the fermata as a separate command, which still belongs to the current measure but can be written anywhere in it:

```msq-editor opens-with=text
measure
treble clef
c d e f
fermata at the end
```

`fermata` on its own works as well.

It's important to mention how this differs from `with fermata` on a unit, which you know from [Articulations](/docs/language/articulations). A unit fermata is drawn over (or under) that unit and holds that unit, while a fermata over a barline is drawn over the barline and holds the end of the whole measure:

```msq-editor opens-with=text
measure
treble clef
c d e f with fermata
measure ends with fermata
g a b c5
```

When the music is played, a fermata over a barline adds a pause of **2.5** seconds after the measure, and a unit fermata adds a pause of **2** seconds after its unit. Both can be changed with the `fermata duration` setting, which you can read about in [MIDI settings](/docs/language/midi-settings).

Read next: [Tempo and metronome marks](/docs/language/tempo-and-metronome-marks)
