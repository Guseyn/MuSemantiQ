# Lyrics

Lyrics are a little different from other marks on units. They are read as a line of text under the music, but each syllable belongs to one unit, and the units can come from different voices and, in some cases, from different staves.

To make life easier, lyrics are attributes of units, and from the context of how they are declared, they are positioned as a line and get dashes and underscores where needed.

Let's start with a very basic example:

```msq-editor opens-with=text
1/4 c with lyrics "Sing"
d with lyrics "a"
e with lyrics "song"
f with lyrics "to"
g with lyrics "me"
```

The syllable is always in quotes. Instead of `with lyrics` you can also write `with lyric`, `with new lyrics` or `with new lyric`.

## 1. Dashes

A word that is split between several units needs a dash between its syllables. You just need to write `followed by dash` after a syllable:

```msq-editor opens-with=text
measure
treble clef
1/4 c with lyrics "A"
d with lyrics "men" followed by dash
e with lyrics "a" followed by dash
f with lyrics "men"
```

You can also write `is followed by dash`, and `hyphen` instead of `dash`.

## 2. Underscores

When one syllable is held over several units (a melisma), an underscore runs under them. You mark where it starts and where it finishes:

```msq-editor opens-with=text
measure
treble clef
1/4 c with lyrics "Glo" followed by dash
d with lyrics "ri" followed by dash
e with lyrics "a"
f with lyrics "in" where underscore starts
measure
1/4 g
a with lyrics "ex" where underscore ends
1/2 b with lyrics "cel" followed by dash
measure
1 c5 with lyrics "sis"
```

As you can see, the underscore can run over a barline. The unit where it finishes may carry a syllable of its own, or no syllable at all, just `with lyrics where underscore ends`:

```msq-editor opens-with=text
1/2 a with lyrics "uni" where underscore starts, tied with next
1/4 a with lyrics where underscore ends
1/4 a with lyrics "son"
```

These are all the ways to write it:

| Where | Key words |
|---|---|
| start | `where underscore starts`, `where underscore begins`, `with underscore starts`, `with underscore begins`, `underscore starts`, `underscore begins` |
| finish | `where underscore finishes`, `where underscore ends`, `with underscore finishes`, `with underscore ends`, `underscore finishes`, `underscore ends` |

## 3. Lyrics across voices and staves

Lyrics can be constructed from different voices and staves. Each syllable is placed under its own unit, and they are all read as one line:

```msq-editor opens-with=text
measure
stave with treble clef
voice
1/4 a with lyrics "what" where underscore starts, tied with next up
a
voice
1/4 c tied with next down
1/8 c with lyrics "is" where underscore ends
1/8 c
stave with bass clef
voice
1/8 a3
a3
a3
1/16 a3 with lyrics "uni" followed by dash
a3
voice
1/8 c3
c3
c3
1/16 c3
c3 with lyrics "son"
```

## 4. Lyrics under another stave

By default, lyrics are placed under the first stave. You can put them under a certain stave with the following command:

```msq-editor opens-with=text
lyrics is under stave 2

measure
stave with treble clef
stave with bass clef

measure
stave
1/4 c5 d5 e5 f5
stave
1/4 c3 with lyrics "one"
d3 with lyrics "two"
e3 with lyrics "three"
f3 with lyrics "four"
```

It's a command of the whole page, so it can be written anywhere, and it applies to every measure. `is` is optional, `below` means the same as `under`, and the stave can be written as `stave 2`, `second stave` or `2nd stave`.

## 5. Vertical position

The vertical position of lyrics is always adjusted, but you can correct it:

```msq-editor opens-with=text
measure
treble clef
1/4 c with lyrics "A"
d with lyrics "men" followed by dash
e with lyrics "a" followed by dash
f with lyrics "men"
measure
1/4 d5 with lyrics "a" 1 down
e5 with lyrics "in" 2 down
1/2 f5 with lyrics "deo"
```

`1 down` means that the syllable moves one interval between stave lines down. As you may notice, **deo** has no correction of its own but still sits with **in**: lyrics are a line, so the syllables after a correction keep it until another correction changes it.

The correction can go before the syllable or after it: `with lyrics 1 down "a"` means the same as `with lyrics "a" 1 down`.

## 6. Several lines of lyrics

A unit can carry several syllables, one for each line (verse) of lyrics. The first `with lyrics` is the first line, the second is the line under it, and so on:

```msq-editor opens-with=text
1/4 a
with lyric "one",
with lyric "two"

a tied with next,
with lyric "one" where underscore starts,
with lyric "two" where underscore starts

a
with lyric where underscore ends,
with lyric where underscore ends
```

If you correct the vertical position of the first line, the lines under it move with it:

```msq-editor opens-with=text
measure
treble clef
1/4 c with lyrics "one", with lyrics "two"
d with lyrics "three" 2 down, with lyrics "four"
e with lyrics "five", with lyrics "six"
f with lyrics "seven", with lyrics "eight"
```

**Side note:** unlike [Text labels](/docs/language/text-labels), which are placed next to their own unit, lyrics are always positioned as a line under the stave.

Read next: [Mid-measure clefs](/docs/language/mid-measure-clefs)
