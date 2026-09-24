/*
Which page introduces which concept.

The parser names every construct it recognises — 578 of them — and reports,
for any source, exactly which ones fired. That makes "no example uses a concept
before it is described" a thing a script can check rather than a thing an author
has to remember. This file is the missing half: scenario name -> the page that
introduces it.

Rules are tried in order and the first match wins, so specific rules come before
general ones. Every scenario name must match some rule; scripts/check-docs-examples.js
fails if one does not, which is how a newly added language feature announces
that the documentation has not caught up with it.

Node only. The browser never loads this.
*/

/** @type {Array<[RegExp, string]>} */
export const rules = [
  // ─── Operational ───────────────────────────────────────────────────────
  [ /^command is not recognizable$/, 'language/handling-errors' ],
  [ /^midi setting/, 'language/midi-settings' ],

  // ─── Structural no-ops, legal from the first page ──────────────────────
  [ /^punctuation$/, 'language/first-notes' ],
  [ /^empty line/, 'language/first-notes' ],

  // ─── Notes on a page ───────────────────────────────────────────────────
  [ /^comment/, 'language/comments' ],
  [ /^quote ends comment/, 'language/comments' ],
  [ /^(note|chord) with number of dots$/, 'language/dots' ],
  [ /^dotted (note|chord)$/, 'language/dots' ],
  [ /^(note|chord) is rest$/, 'language/rests' ],
  [ /^(note|chord) with key with parentheses$/, 'language/accidentals' ],
  [ /^(note|chord) with key$/, 'language/accidentals' ],

  // ─── Grouping notes ────────────────────────────────────────────────────
  [ /^chord$/, 'language/chords' ],
  [ /^(note|chord) (beamed|not beamed)/, 'language/beams' ],
  [ /^(note|chord) stem direction$/, 'language/stems' ],
  [ /^(note|chord) (is tied|tied)/, 'language/ties' ],
  [ /^tuplet/, 'language/tuplets' ],
  [ /\(tuplet[^)]*\)$/, 'language/tuplets' ],

  // ─── The page ──────────────────────────────────────────────────────────
  [ /^clef$/, 'language/clefs' ],
  [ /^stave( with clef)?$/, 'language/staves' ],
  [ /^voice$/, 'language/voices' ],
  [ /^(new|new line)$/, 'language/page-lines' ],
  [ /^key signature/, 'language/key-signatures' ],
  [ /^time signature/, 'language/time-signatures' ],
  [ /^page meta$/, 'language/titles-and-page-meta' ],

  // Measures, and the rests and similes that are a property of one
  [ /^measure$/, 'language/measures' ],
  [ /^(measure with )?(multi )?measure rest/, 'language/measures' ],
  [ /^multi measure rest count$/, 'language/measures' ],

  // ─── Marks on units ────────────────────────────────────────────────────
  [ /^(note|chord) with articulation/, 'language/articulations' ],
  [ /^(note|chord) with (trill|turn|mordent)/, 'language/ornaments' ],
  [ /^(note|chord) (with dynamic|dynamic vertical correction)/, 'language/dynamics' ],
  [ /^(note|chord) with text/, 'language/text-labels' ],
  [ /^(note|chord) (is grace|with crushed grace)/, 'language/grace-units' ],
  [ /^(note|chord) is (not )?ghost$/, 'language/ghost-units' ],
  [ /^(note|chord) with parentheses/, 'language/parentheses' ],
  [ /^(note|chord) with breath mark/, 'language/breath-marks' ],
  [ /^chord is arpeggiated/, 'language/arpeggiated-chords' ],
  [ /^(note|chord) with chord letter/, 'language/chord-letters' ],
  [ /^chord letters font style/, 'language/fonts' ],
  [ /^(note|chord) with lyrics/, 'language/lyrics' ],
  [ /^lyrics position/, 'language/lyrics' ],
  [ /^(note|chord) with clef( and key signature)? before$/, 'language/mid-measure-clefs' ],
  [ /^(note|chord) with key signature before$/, 'language/mid-measure-key-signatures' ],
  [ /^(note|chord) is centralized$/, 'language/centralized-units' ],
  [ /^(note|chord) with horizontal correction$/, 'language/adjusting-units' ],
  [ /^(note|chord) stave position$/, 'language/cross-stave-chords' ],

  // ─── Spans ─────────────────────────────────────────────────────────────
  [ /^slur/, 'language/slurs' ],
  [ /\(slur[^)]*\)$/, 'language/slurs' ],
  [ /^crescendo\|diminuendo/, 'language/crescendo-and-diminuendo' ],
  [ /\(crescendo\|diminuendo[^)]*\)$/, 'language/crescendo-and-diminuendo' ],
  [ /^octave sign/, 'language/octave-signs' ],
  [ /^(note|chord) with octave sign/, 'language/octave-signs' ],
  [ /\(octave sign[^)]*\)$/, 'language/octave-signs' ],
  [ /^glissando/, 'language/glissando' ],
  [ /^(note|chord) with glissando/, 'language/glissando' ],
  [ /\(glissando[^)]*\)$/, 'language/glissando' ],
  [ /^(note|chord) with tremolo/, 'language/tremolo' ],
  [ /^(note|chord) with (pedal|release|variable peak)/, 'language/pedal-marks' ],

  // ─── Measure furniture ─────────────────────────────────────────────────
  [ /(^|\b)(opening|closing) bar line$/, 'language/barlines' ],
  [ /^no start bar line$/, 'language/barlines' ],
  [ /^measure (opens|closes) with bar line$/, 'language/barlines' ],
  [ /^measure without start bar line$/, 'language/barlines' ],
  [ /^repeat sign/, 'language/repeat-signs' ],
  [ /^measure with repeat sign/, 'language/repeat-signs' ],
  [ /^volta/, 'language/volta-brackets' ],
  [ /\(volta[^)]*\)$/, 'language/volta-brackets' ],
  [ /^sign/, 'language/sign' ],
  [ /^coda/, 'language/coda' ],
  [ /^repetition note/, 'language/repetition-instructions' ],
  [ /^measure (fermata|ends with fermata)/, 'language/fermata-over-barline' ],
  [ /^tempo mark/, 'language/tempo-and-metronome-marks' ],
  [ /measure numbers/, 'language/measure-numbers' ],
  [ /^instrument title/, 'language/instrument-titles' ],
  [ /^(bracket or brace|connection)/, 'language/cross-stave-connections' ],
  [ /simile/, 'language/similes' ],
  [ /^repeat (note|chord)/, 'language/similes' ],

  // ─── Layout and styles ─────────────────────────────────────────────────
  [ /^(compress|stretch) units/, 'language/unit-spacing' ],
  [ /^hide the last measure/, 'language/unit-spacing' ],
  [ /^color style/, 'language/colours' ],
  [ /^(music|text) font style/, 'language/fonts' ],
  [ /^style (name|value)/, 'language/page-format' ],

  // ─── The generic unit / measure / stave / voice / line addressing ──────
  // These only ever appear as clauses of a span, so they are legal wherever
  // the span that owns them is. Anchored last so a span-specific rule wins.
  [ /^(unit|measure|stave|voice|line) position/, 'language/slurs' ],
  [ /^position of (unit|measure|stave|voice|line)/, 'language/slurs' ],

  // ─── Whatever is left of note/chord is the unit itself ─────────────────
  [ /^(note|chord)$/, 'language/first-notes' ]
]

/** The page ref that introduces `scenarioName`, or null if no rule matches. */
export function introducedBy(scenarioName) {
  for (const [ pattern, ref ] of rules) {
    if (pattern.test(scenarioName)) {
      return ref
    }
  }
  return null
}
