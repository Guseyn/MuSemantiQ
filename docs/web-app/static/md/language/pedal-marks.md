# Pedal marks

Pedal marks are quite unique in how they are structured. They can be attached to units in different voices, and sometimes in different voices on different staves. To make life easier, pedal marks are attributes of units, and from the way they are declared, they are positioned, connected or separated when it's needed.

## 1. Simple pedal marks

Let's start with the simple pair, `with pedal` on one unit and `with release` on another:

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

As you can see, each pedal mark is configured separately. It was designed in this way intentionally, and we will get to the point in the next section. Instead of `under` you can write `below`, and the stave can be written as `second stave` or `stave 2`.

The vertical position of pedal marks is always adjusted, so they don't intersect other elements. But you still can correct it:

```msq-editor opens-with=text
measure
treble clef
a with pedal 2 down
b
```

Here we moved the pedal mark down by two intervals between stave lines.

## 2. Pedal marks with brackets, variable peaks and releases

Now, let's see how you can create more complex pedal structures. First of all, a pedal and its release on a grand staff:

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

As you can see, we also specified the stave under which we want the pedal marks. You can write `starts with bracket` or `begins with bracket` as well.

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

You can use variable peaks along the way, for a half release of the pedal:

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

Each time you use the key word `pedal`, a new pedal structure starts. Let's take a look at the following example:

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

As you can see, all the marks are right under the units where they are declared. You can easily change that with the `before` and `after` key words, so the marks are drawn before or after their units:

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

The vertical correction on the `pedal` moves the whole pedal structure:

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

And as it's been shown before, the stave you set on the `pedal` is where the whole pedal structure is positioned:

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

## 3. Pedal marks on several staves and voices

If there are several instruments with pedals, you can create pedal structures for several staves. By default, a structure is positioned under the stave where its marks are declared, but you can still specify a stave for it, like in the example above:

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

For pedal structures on several staves, it's recommended to keep them where they are declared, to avoid any confusion:

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

As it's been told before, each `pedal` key word starts a new pedal structure, and without it the other pedal marks are not drawn:

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

A pedal is also heard: from the `pedal` to its release, the MIDI player holds the sustain pedal down.

Read next: [Barlines](/docs/language/barlines)
