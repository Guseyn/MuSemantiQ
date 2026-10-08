# Articulations

You write an articulation after a unit, with the key word `with`.

Let's start with a simple example:

```msq-editor opens-with=text
1/4 c with staccato
d with accent
e with tenuto
f with marcato
g with staccato, with accent
a with fermata up
```

## 1. Supported Articulations

These are all the articulations supported at the moment:

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

## 2. Several Articulations on One Unit

A unit can have as many articulations as you need. Separate them with a comma or `and`, or put each one on its own line:

```msq-editor opens-with=text
1/4 a with staccato, with accent
b with staccato and with tenuto
c5 with tenuto
with accent
```

For a chord, the articulation goes on the `chord` line:

```msq-editor opens-with=text
chord with staccato
c e g

chord with accent, with tenuto
d f a

```

## 3. Direction

By default, an articulation is drawn above the unit. But you can easily change that with `up` and `down`, or with `above` and `below`, which mean the same:

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

As you may notice, an articulation on the same side as the stem goes at the end of the stem. On the other side, it goes next to the note head.

You can also write `over` and `under`, and put `is` in front of any of them, like `with staccato is down`:

```msq-editor opens-with=text
a with accent over
a with accent under
a with accent is down
```

## 4. Above or Below the Stave

`above stave` and `below stave` put an articulation above or below the stave, no matter where the unit is:

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

You can also write `staff` instead of `stave`, and `over` and `under` instead of `above` and `below`: `with fermata over staff`.

## 5. Vertical Correction

An articulation is always placed so that it doesn't collide with its unit. But you can still move it yourself: `2 up` moves it up by two intervals between stave lines, and `2 down` moves it down by two:

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

The number can be fractional, and it works without a direction too:

```msq-editor opens-with=text
a with fermata
a with fermata 1.5 up
a with marcato down 0.5 down
```

**Side note:** articulations are also heard in playback:

- `staccato` and `spiccato` make a note shorter.
- `accent` and `marcato` make it louder.
- Both pizzicatos and `natural harmonic` play the note with another instrument.
- How long a `fermata` holds is a MIDI setting. More about that you can read in [MIDI settings](/docs/language/midi-settings).

Read next: [Ornaments](/docs/language/ornaments)
