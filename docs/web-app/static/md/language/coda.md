# Coda

Each measure can have a coda symbol. Like a [sign](/docs/language/sign), you add it with `coda` inside the measure:

```msq-editor opens-with=text
measure
treble clef
coda at the end of the measure
c d e f
```

By default, a coda is at the start of the measure:

```msq-editor opens-with=text
measure
treble clef
c d e f
measure
coda
g a b c5
```

You can say explicitly where to put it, at the start or at the end of the measure:

```msq-editor opens-with=text
measure
treble clef
coda at the start of the measure
c d e f
measure
coda at the end of the measure
g a b c5
measure
c5 b a g
```

A coda moves up or down by itself, depending on what's in the measure. But you can still correct it:

```msq-editor opens-with=text
measure
treble clef
coda 1 up
a b d
```

Here we moved the coda up by one interval between stave lines.

Usually, codas come in a pair, together with a sign and a repetition instruction:

- the first coda marks where you leave;
- the second coda marks where the coda section starts;
- a "D.S. al Coda" (or "D.C. al Coda") instruction says when to go back.

Here are the two codas and the sign. The instruction itself is on the next page:

```msq-editor opens-with=text
measure
treble clef
sign
c d e f
measure
closes with double barline
coda at the end of the measure
g a b c5
measure
c5 b a g
measure
closes with double bold barline
coda
c e g c5
```

The MIDI player follows this: after "D.S. al Coda" it goes back to the sign, plays until the first coda, and then jumps to the next coda on the page. The instructions are described in [Repetition instructions](/docs/language/repetition-instructions).

Read next: [Repetition instructions](/docs/language/repetition-instructions)
