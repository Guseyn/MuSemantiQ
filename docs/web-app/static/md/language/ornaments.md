# Ornaments

Ornaments are attributes of a unit, just like [articulations](/docs/language/articulations). There are three of them: trill, mordent and turn, and the last two can be inverted.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c with trill
d with mordent
e with turn
f with trill with wave after
g with mordent with sharp key above
```

## 1. Trill

A trill is an attribute of a unit:

```msq-editor opens-with=text
a with trill
```

You can add a wave to a trill with `with wave after`. The wave runs from the trill to the next unit:

```msq-editor opens-with=text
1/2 a with trill with wave after
1/4 a
```

You can set a direction for it, with `up` and `down` or with `above` and `below`:

```msq-editor opens-with=text
measure
1/2 a with trill with wave after down
1/4 a

measure
1/2 a with trill with wave after up
1/4 a

measure
1/2 a with trill with wave after below
1/4 a

measure
1/2 a with trill with wave after above
1/4 a
```

You can also force it above or below the stave:

```msq-editor opens-with=text
1/4 a with trill above stave
b with trill below stave
```

The vertical position of a trill is always adjusted, but you can still correct it if you like. `1 down` moves it one interval between stave lines down, and `1 up` moves it one interval up:

```msq-editor opens-with=text
measure
1/2 a with trill with wave after down 1 down
1/4 a

measure
1/2 a with trill with wave after up 1 up
1/4 a
```

## 2. Mordent

A mordent is an attribute of a unit:

```msq-editor opens-with=text
a with mordent
```

You can make it inverted:

```msq-editor opens-with=text
a with mordent inverted
```

You can add keys to a mordent, above it or below it:

```msq-editor opens-with=text
a with mordent with sharp key above
a with mordent with sharp key below
a with mordent with flat key above
a with mordent with flat key below
a with mordent with natural key above
a with mordent with natural key below
```

And you can have both at once. It's easier to read when each one is on its own line:

```msq-editor opens-with=text
a with mordent
with sharp key above
with flat key below

a with mordent
with flat key above
with sharp key below
```

The keys have shorter names as well:

| Key | Key words |
| --- | --- |
| sharp | `sharp`, `sh`, `#` |
| flat | `flat`, `fl` |
| natural | `natural`, `n` |

```msq-editor opens-with=text
a with mordent with # key above
a with mordent with fl key below
a with mordent with n key above
```

The direction, `above stave` and `below stave`, and the vertical correction work for a mordent in the same way as for a trill:

```msq-editor opens-with=text
1/4 a with mordent down
b with mordent above stave
c5 with mordent with flat key below 1 up
```

## 3. Turn

A turn is an attribute of a unit:

```msq-editor opens-with=text
a with turn
```

You can make it inverted:

```msq-editor opens-with=text
a with turn inverted
```

You can add keys to it, exactly like to a mordent:

```msq-editor opens-with=text
a with turn with sharp key above
a with turn with sharp key below
a with turn with flat key above
a with turn with flat key below
a with turn with natural key above
a with turn with natural key below

a with turn
with sharp key above
with flat key below
```

You can also place a turn after a unit rather than over it, with `after`:

```msq-editor opens-with=text
1/2 a with turn after
1/4 a
```

And the vertical position of a turn can be corrected in the same way:

```msq-editor opens-with=text
a with turn with sharp key above 1 up
```

## 4. Keys on a trill

A trill can take keys too, which tell which note it alternates with:

```msq-editor opens-with=text
1/4 a with trill with sharp key above
b with trill with flat key below
```

## 5. Chords

Ornaments work for chords in the same way. The ornament goes on the `chord` line:

```msq-editor opens-with=text
1/4 chord with mordent
c e g

chord with trill
d f a

```

**Side note:** ornaments are played, not only drawn. A trill alternates with the note above it, a mordent and a turn play their notes around the unit, an inverted one goes the other way, and the keys you add change the notes they go to.

Appoggiatura and acciaccatura are not ornaments in MSQ. You write them with a [grace unit](/docs/language/grace-units) and a slur.

Read next: [Dynamics](/docs/language/dynamics)
