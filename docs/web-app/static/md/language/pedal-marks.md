# Pedal Marks

Pedal marks can be on units in different voices, and sometimes in different voices on different staves. To make it simpler, pedal marks are attributes of units. From how you write them, MSQ decides where to draw them, and which of them to connect or separate.

## 1. Simple Pedal Marks

Let's start with a simple pair, `with pedal` on one unit and `with release` on another:

```msq-editor opens-with=text
measure
treble clef
1/4 c with pedal
d
e
f with release
```

By default, the text of a pedal mark is **Ped.**, but you can set your own:

```msq-editor opens-with=text
measure
treble clef
a with pedal
b
c with pedal "P"
d
```

You can also write `with sustain pedal` instead of `with pedal`, and `with pedal release` instead of `with release`.

You can choose the stave that a pedal mark is drawn under:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal under second stave
b
c with pedal "P"
d
stave with bass clef
rest
rest
rest
rest
```

As you can see, each pedal mark is set up separately. This is on purpose, and the next section shows why. Instead of `under` you can write `below`, and the stave can be `second stave` or `stave 2`.

Pedal marks are moved up or down automatically, so they don't cross other elements. But you can still move them yourself:

```msq-editor opens-with=text
measure
treble clef
a with pedal 2 down
b
```

Here the pedal mark goes down by two intervals between stave lines.

## 2. Pedal Marks With Brackets, Variable Peaks and Releases

Now, let's see how you can make more complex pedal structures. First, a pedal and its release on a grand staff:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal
b
a
c with release
stave with bass clef
a2
b2
a2
c3
```

If you want an opening bracket instead of the text, use `opens with bracket`:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal opens with bracket below second stave
b
a
e
a
c with release
stave with bass clef
a2
b2
a2
e3
a2
c3
```

As you can see, we also set the stave for the pedal marks. You can also write `starts with bracket` or `begins with bracket`.

You can use a closing bracket instead of the release mark, with `with release bracket`:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal opens with bracket below second stave
b
a
e
a
c with release bracket
stave with bass clef
a2
b2
a2
e3
a2
c3
```

You can add variable peaks in between, for a half release of the pedal:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal opens with bracket below second stave
b
a with variable peak
e
a with variable peak
a
c with release bracket
stave with bass clef
a2
b2
a2
e3
a2
a2
c3
```

You can also put a text on top of a variable peak:

```msq-editor opens-with=text
measure
stave with treble clef
a with pedal opens with bracket below second stave
b
a with variable peak "Soft"
e
a with variable peak "Soft"
a
c with release bracket
stave with bass clef
a2
b2
a2
e3
a2
a2
c3
```

Each `pedal` starts a new pedal structure. Let's take a look at the following example:

```msq-editor opens-with=text
measure
treble clef
1/4 e with pedal
1/8 a
1/4 e with variable peak
1/8 a
measure
1/4 e with variable peak
1/8 a
1/4 e with variable peak "Soft"
1/8 a
measure
1/4 e with variable peak
1/8 a
1/4 e with variable peak
1/8 a with release
```

As you can see, all the marks are right under their units. You can easily change that with `before` and `after`, so the marks are drawn before or after their units:

```msq-editor opens-with=text
measure
treble clef
1/4 e with pedal before
1/8 a
1/4 e with variable peak after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft" after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak after
1/8 a with release after
```

You can also put the release at the end of the measure:

```msq-editor opens-with=text
measure
treble clef
1/4 e with pedal before
1/8 a
1/4 e with variable peak after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft" after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak after
1/8 a with release at the end of measure
```

Or you can say that the release is after the measure:

```msq-editor opens-with=text
measure
treble clef
1/4 e with pedal before
1/8 a
1/4 e with variable peak after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft" after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak after
1/8 a with release after measure
```

Moving the `pedal` up or down moves the whole pedal structure:

```msq-editor opens-with=text
measure
treble clef
1/4 e with pedal 2 down before
1/8 a
1/4 e with variable peak after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft" after
1/8 a
measure
1/4 e with variable peak before
1/8 a
1/4 e with variable peak after
1/8 a with release after measure
```

And as you saw before, the stave you set on the `pedal` is where the whole pedal structure is drawn:

```msq-editor opens-with=text
measure
stave with treble clef
1/4 e with pedal before under second stave
1/8 a
1/4 e with variable peak after
1/8 a
stave with bass clef
1/4 rest
1/8 rest
1/4 rest
1/8 rest
measure
stave
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft" after
1/8 a
stave
1/4 rest
1/8 rest
1/4 rest
1/8 rest
measure
stave
1/4 e with variable peak before
1/8 a
1/4 e
1/8 a with release
stave
1/4 rest
1/8 rest
1/4 rest
1/8 rest
```

## 3. Pedal Marks on Several Staves and Voices

If several instruments have pedals, you can make pedal structures for several staves. By default, a structure is drawn under the stave where its marks are written, but you can still set a stave for it, like in the example above:

```msq-editor opens-with=text
measure
stave
1/4 e with pedal under first stave
1/8 a
1/4 e with variable peak after
1/8 a
stave
1/4 e with pedal under third stave
1/8 a
1/4 e with variable peak after
1/8 a
stave
1/4 rest
1/8 rest
1/4 rest
1/8 rest
measure
stave
1/4 e with variable peak
1/8 a
1/4 e with variable peak "Soft"
1/8 a
stave
1/4 e with variable peak
1/8 a
1/4 e with variable peak "Soft"
1/8 a
stave
1/4 rest
1/8 rest
1/4 rest
1/8 rest
measure
stave
1/4 e with variable peak
1/8 a
1/4 e with variable peak
1/8 a with release
stave
1/4 e with variable peak
1/8 a
1/4 e with variable peak
1/8 a with release
stave
1/4 rest
1/8 rest
1/4 rest
1/8 rest
```

For pedal structures on several staves, it's better to keep them under their own staves, so it's not confusing:

```msq-editor opens-with=text
measure
stave
1/4 e with pedal
1/8 a
1/4 e with variable peak
1/8 a
stave
1/4 e with pedal
1/8 a
1/4 e with variable peak
1/8 a
measure
stave
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft"
1/8 a
stave
1/4 e with variable peak before
1/8 a
1/4 e with variable peak "Soft"
1/8 a
measure
stave
1/4 e with variable peak before
1/8 a
1/4 e with variable peak
1/8 a with release
stave
1/4 e with variable peak before
1/8 a
1/4 e with variable peak
1/8 a with release
```

A pedal structure can be built from marks in different voices:

```msq-editor opens-with=text
measure
treble clef
voice
1/8 a5 with pedal
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5 with release
voice
1/4 c
1/4 c with variable peak
1/4 c
1/4 c with variable peak
```

As you remember, each `pedal` starts a new pedal structure. Without it, the other pedal marks are not drawn:

```msq-editor opens-with=text
measure
treble clef
voice
1/8 a5
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5
1/8 a5
1/16 a5
1/16 a5 with release
voice
1/4 c
1/4 c with variable peak
1/4 c
1/4 c with variable peak
```

It's very important to let a user see errors or inaccuracies visually.

A pedal structure can also be built from marks in different voices and on different staves:

```msq-editor opens-with=text
measure
stave
voice
1/8 a with pedal under stave 2
1/16 a
1/16 a
1/8 a
1/16 a
1/16 a
1/8 a
1/16 a
1/16 a
1/8 a
1/16 a
1/16 a with release
voice
1/4 c
1/4 c with variable peak
1/4 c
1/4 c with variable peak
stave
voice
1/8 a
1/16 a with variable peak
1/16 a
1/8 a
1/16 a with variable peak
1/16 a
1/8 a
1/16 a with variable peak
1/16 a
1/8 a
1/16 a with variable peak
1/16 a
voice
1/4 c
1/4 c
1/4 c
1/4 c
```

You also hear a pedal: from the `pedal` to its release, the MIDI player holds the sustain pedal down.

Read next: [Barlines](/docs/language/barlines)
