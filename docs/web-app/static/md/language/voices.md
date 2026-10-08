# Voices

Each stave consists of voices. A voice is a separate line of music. Two voices on one stave play at the same time, each with its own rhythm.

Let's start with a simple example:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 c5 b a g
voice
1/2 c e
```

As you can see, each `voice` starts a new voice on the current stave. The units after it, until the next `voice`, belong to it.

## 1. Declaring a Voice

`voice` must be the first word on its line, and the units of the voice start on the next line. You don't need `stave` for voices. Without it, the voices go on the stave that MSQ creates for you.

```msq-editor opens-with=text
measure
treble clef
voice
1/4 g a b c5
voice
1/4 c c c c
```

You see a voice only when it has units. You can declare as many voices on a stave as you need:

```msq-editor opens-with=text
measure
treble clef
voice
1/4 g a b c5
voice
1/4 e f g a
voice
1/4 c c c c
```

## 2. Stems

By default, the first voice has stems up, and all the other voices have stems down. This way the voices don't get in each other's way, and that's why you didn't need to write any stem direction above. As you remember from [Stems](/docs/language/stems), you can still change the direction of any unit.

## 3. Each Voice Remembers Its Own Duration

As you remember from [Durations](/docs/language/durations), a duration stays until you write another one. It's important to mention that this works for each voice separately. Each voice keeps its own duration and its own stem direction, from one measure to the next.

```msq-editor opens-with=text
measure
treble clef
voice
1/4 c5 b a g
voice
1/2 c e

measure
voice
f5 e5 d5 c5
voice
f a
```

As you may notice, in the second measure no voice has a duration, but the first voice is still in quarters and the second one in halves.

## 4. Voices Across Staves

Voices are inside a stave. So each stave has its own voices, and they are numbered from one on every stave:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 e5 d5 c5 b
voice
1/2 g g
stave with bass clef
voice
1/4 c3 d3 e3 f3
voice
1 c2
```

## 5. When Rhythms Do Not Line Up

The units of different voices are placed by time, not by their order. If a unit starts at the same time as a unit in another voice, it's drawn above or below it. Units that start in between are placed in between:

```msq-editor opens-with=text
measure
treble clef
voice
1/2 c5
1/4 b a
voice
1/4 e f g f
```

Voices don't have to be the same length. You can put as many units into a voice as you want. Other voices and the time signature don't limit it. So you can write the melody first and fix the details later:

```msq-editor opens-with=text
measure
treble clef
voice
1/4 c5 c5 c5 c5 c5 c5
voice
1/2 e
```

When a voice has a pause, give it a rest, so that the other voice stays in its place:

```msq-editor opens-with=text
measure
treble clef
voice
1/2 d5
1/4 c5 b
voice
1/4 rest
1/4 g f e
```

Read next: [Page lines](/docs/language/page-lines)
