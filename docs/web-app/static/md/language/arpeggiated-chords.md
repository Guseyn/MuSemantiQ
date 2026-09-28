# Arpeggiated chords

An arpeggiated (rolled) chord is played one note after another rather than all at once, and it is drawn with a wavy line in front of it. You can turn any chord into an arpeggiated one:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord is arpeggiated
c e g c5

chord is arpeggiated with arrow up
d f a d5

</template>
</div>

As you remember from [Chords](/docs/language/chords), everything about a chord goes on the `chord` line, and `is arpeggiated` is no exception. You can also write `is arpeggio`, or leave out `is`:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord is arpeggiated
c e g b

chord is arpeggio
c e g b

chord arpeggiated
c e g b

</template>
</div>

The wave is drawn as tall as the chord it rolls, so chords of different reach get waves of different length:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
chord is arpeggiated
c e

chord is arpeggiated
c e g

chord is arpeggiated
c e g c5

chord is arpeggiated
c e g c5 e5 g5

</template>
</div>

## 1. Arrows

You can add an arrow to the wave to show the direction of the roll:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
chord is arpeggiated with arrow up
c e g b

chord is arpeggiated with arrow down
c e g b

</template>
</div>

If you write just `with arrow`, the arrow points up.

By default, the notes of an arpeggiated chord are played from the lowest one up. An arrow down turns that around, and the chord is played from the highest note down.

## 2. Arpeggiated chords in several voices

A chord can be arpeggiated in each voice, and the waves can be joined into one. You just need to write `with chord below` on the upper chord:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
treble clef
voice
chord is arpeggiated with chord below
a c5 e5

voice
chord is arpeggiated
g3 b3 d

</template>
</div>

It's important to mention that the chord below has to be arpeggiated as well, because `with chord below` only joins two waves: it does not create the second one.

## 3. Arpeggiated chords across staves

In the same way, you can join arpeggiated chords on different staves, so that one wave spans both hands:

<div>
<template is="msq-editor" data-font-sources="msqFontSources" data-opens-with="text">
measure
stave with treble clef
stave with bass clef

measure
stave
chord is arpeggiated with chord below
c5 e5 g5

stave
chord is arpeggiated
c3 g3 c

</template>
</div>

The waves joined like this are also played as one roll, through all the chords they connect.

Read next: [Chord letters](/docs/language/chord-letters)
