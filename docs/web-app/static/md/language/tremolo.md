# Tremolo

A tremolo is a fast repetition. There are two kinds of it:

- strokes on one unit, which repeat that unit;
- a tremolo *between* two units, which switches between them.

Both are attributes of units, so you write them right on the unit, not as a separate command after the music.

Let's start with an example that has both of them:

```msq-editor opens-with=text
1/4 c with tremolo with 3 strokes
d
1/2 e with tremolo with next
1/2 g
```

## 1. Tremolo for a Single Unit

All you need is to write `with tremolo` after a unit:

```msq-editor opens-with=text
1 a with tremolo
1/2 a with tremolo
1/4 a with tremolo
1/8 a with tremolo
1/16 a with tremolo
1/32 a with tremolo
```

As you can see, the number of strokes depends on the duration. By default:

- a quarter and longer get three strokes;
- an eighth gets two;
- a sixteenth gets one;
- a thirty-second and shorter get no tremolo at all, because they are already too short.

You may also notice that for units with flags the strokes are shorter, because it's easier to read.

You can set the number of strokes yourself with `with 1 stroke`, `with 2 strokes` or `with 3 strokes`. But you have to remember the following rules:

1. You can't set more than three strokes.
2. For eighths, you can set only one or two strokes.
3. For sixteenths, there is always one stroke, no matter how many you set.

```msq-editor opens-with=text
new line
1 a with tremolo, with 3 strokes
1 a with tremolo, with 2 strokes
1 a with tremolo, with 1 stroke
new line
1/2 a with tremolo, with 3 strokes
1/2 a with tremolo, with 2 strokes
1/2 a with tremolo, with 1 stroke
new line
1/4 a with tremolo, with 3 strokes
1/4 a with tremolo, with 2 strokes
1/4 a with tremolo, with 1 stroke
new line
1/8 a with tremolo, with 3 strokes
1/8 a with tremolo, with 2 strokes
1/8 a with tremolo, with 1 stroke
new line
1/16 a with tremolo, with 3 strokes
1/16 a with tremolo, with 2 strokes
1/16 a with tremolo, with 1 stroke
```

The strokes also say how fast the unit is repeated when it's played: one stroke means eighths (for units longer than an eighth), two strokes mean sixteenths, and three strokes mean thirty-seconds. So a half note with three strokes is played as sixteen thirty-second notes.

## 2. Tremolo Between Two Units

To connect two units with a tremolo, you write `with tremolo with next` on the first of them:

```msq-editor opens-with=text
measure
1 f with tremolo with next
1 a with tremolo with next
measure
1/2 f with tremolo with next
1/2 a with tremolo with next
measure
1/4 f with tremolo with next
1/4 a with tremolo with next
new line
1/8 f with tremolo with next
1/8 a with tremolo with next
measure
1/16 f with tremolo with next
1/16 a with tremolo with next
```

Keep in mind:

- You can connect only two units with the same duration.
- The second unit is the next one in the same voice. It can also be the first unit of the next measure.
- When it's played, the MIDI player switches between the two units, as fast as the strokes say.

The same rules about the number of strokes work here too:

```msq-editor opens-with=text
new line
1 a with tremolo with next, with 3 strokes
1 a with tremolo, with 3 strokes
1 a with tremolo with next, with 2 strokes
1 a with tremolo, with 2 strokes
1 a with tremolo with next, with 1 stroke
1 a with tremolo, with 1 stroke
new line
1/2 a with tremolo with next, with 3 strokes
1/2 a with tremolo, with 3 strokes
1/2 a with tremolo with next, with 2 strokes
1/2 a with tremolo, with 2 strokes
1/2 a with tremolo with next, with 1 stroke
1/2 a with tremolo, with 1 stroke
new line
1/4 a with tremolo with next, with 3 strokes
1/4 a with tremolo, with 3 strokes
1/4 a with tremolo with next, with 2 strokes
1/4 a with tremolo, with 2 strokes
1/4 a with tremolo with next, with 1 stroke
1/4 a with tremolo, with 1 stroke
new line
1/8 a with tremolo with next, with 3 strokes
1/8 a with tremolo, with 3 strokes
1/8 a with tremolo with next, with 2 strokes
1/8 a with tremolo, with 2 strokes
1/8 a with tremolo with next, with 1 stroke
1/8 a with tremolo, with 1 stroke
new line
1/16 a with tremolo with next, with 3 strokes
1/16 a with tremolo, with 3 strokes
1/16 a with tremolo with next, with 2 strokes
1/16 a with tremolo, with 2 strokes
1/16 a with tremolo with next, with 1 stroke
1/16 a with tremolo, with 1 stroke
```

Read next: [Pedal marks](/docs/language/pedal-marks)
