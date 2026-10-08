# Fermata Over Barline

A fermata over a barline belongs to the measure, not to a unit. It's drawn over the closing barline of the measure, and it means the music pauses there. You add it right after `measure`:

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

It works like `ends with double barline` from [Barlines](/docs/language/barlines): `ends with fermata` must come right after `measure`, before anything else: before a clef, a stave or a unit.

You can also write the fermata as a separate command. It belongs to the current measure and can go anywhere in it:

```msq-editor opens-with=text
measure
treble clef
c d e f
fermata at the end
```

`fermata` on its own works as well.

It's important to mention that this is not the same as `with fermata` on a unit, which you know from [Articulations](/docs/language/articulations):

- a unit fermata is drawn over (or under) its unit and holds that unit;
- a fermata over a barline is drawn over the barline and holds the end of the whole measure.

Here are both:

```msq-editor opens-with=text
measure
treble clef
c d e f with fermata
measure ends with fermata
g a b c5
```

When the music is played, a fermata over a barline adds a pause of **2.5** seconds after the measure, and a unit fermata adds a pause of **2** seconds after its unit. You can change both with the `fermata duration` setting, see [MIDI settings](/docs/language/midi-settings).

Read next: [Tempo and metronome marks](/docs/language/tempo-and-metronome-marks)
