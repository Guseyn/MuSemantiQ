# Articulations

An articulation is an attribute of a unit: you write it after the unit, with the key word `with`.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c with staccato
d with accent
e with tenuto
f with marcato
g with staccato, with accent
a with fermata up
```

## 1. Supported articulations

Below you can see all articulations supported at the moment:

```msq-editor opens-with=text
a with staccato
a with spiccato
a with accent
a with tenuto
a with marcato
a with fermata
a with left hand pizzicato
a with snap pizzicato
a with natural harmonic
a with up bow
a with down bow
```

Some of them have shorter names as well:

| Articulation | Key words |
| --- | --- |
| staccato | `staccato` |
| spiccato | `spiccato` |
| accent | `accent` |
| tenuto | `tenuto` |
| marcato | `marcato` |
| fermata | `fermata` |
| left hand pizzicato | `left hand pizzicato`, `left pizzicato`, `left hand pizz`, `left pizz` |
| snap pizzicato | `snap pizzicato`, `snap pizz` |
| natural harmonic | `natural harmonic`, `natural harm` |
| up bow | `up bow` |
| down bow | `down bow` |

So this is the same thing written shorter:

```msq-editor opens-with=text
a with left pizz
a with snap pizz
a with natural harm
```

## 2. Several articulations on one unit

You can put as many articulations on one unit as you need. Separate them with a comma, with `and`, or just put each one on its own line:

```msq-editor opens-with=text
1/4 a with staccato, with accent
b with staccato and with tenuto
c5 with tenuto
with accent
```

It works for chords in the same way. The articulation goes on the `chord` line:

```msq-editor opens-with=text
chord with staccato
c e g

chord with accent, with tenuto
d f a

```

## 3. Direction

By default, an articulation is drawn above the unit. But you can easily change that with `up` or `down`, or with `above` or `below`, which mean the same:

```msq-editor opens-with=text
measure
a with stem down, with staccato up
a with spiccato above
a with accent up
a with tenuto above
a with fermata up
a with up bow above

measure
a with stem up, with staccato down
a with spiccato below
a with accent down
a with tenuto below
a with fermata below
a with up bow down
```

As you may notice, when an articulation is on the same side as the stem, it is placed at the end of the stem, and when it is on the other side, it is placed next to the note head.

`over` and `under` are accepted as well, and so is `is` in front of any of them — `with staccato is down`:

```msq-editor opens-with=text
a with accent over
a with accent under
a with accent is down
```

## 4. Above or below the stave

You can force an articulation to be above or below the stave, no matter where the unit is, with `above stave` or `below stave`:

```msq-editor opens-with=text
measure
a with stem down, with staccato above stave
a with accent above stave
a with tenuto above stave
a with fermata above stave
a with up bow above stave

measure
a with stem up, with staccato below stave
a with accent below stave
a with tenuto below stave
a with fermata below stave
a with up bow below stave
```

`staff` is accepted instead of `stave`, and `over` and `under` instead of `above` and `below`: `with fermata over staff`.

## 5. Vertical correction

The vertical position of an articulation is always adjusted, so that it does not collide with the unit it belongs to. But you can still correct it if you like: `2 up` moves an articulation up by two intervals between stave lines, and `2 down` moves it down by two:

```msq-editor opens-with=text
measure
a with stem down, with staccato above stave 2 up
a with accent above stave 2 up
a with tenuto above stave 2 up
a with fermata above stave 2 up

measure
a with stem up, with staccato below stave 2 down
a with accent below stave 2 down
a with tenuto below stave 2 down
a with fermata below stave 2 down
```

The number does not have to be whole, and the correction works without a direction as well:

```msq-editor opens-with=text
a with fermata
a with fermata 1.5 up
a with marcato down 0.5 down
```

**Side note:** articulations are also heard, not only seen. In playback, `staccato` and `spiccato` shorten a note, `accent` and `marcato` make it louder, and both pizzicatos and `natural harmonic` play the note with another instrument. How long a `fermata` holds is a MIDI setting, more about that you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Ornaments](/docs/language/ornaments)
