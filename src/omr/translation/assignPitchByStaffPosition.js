'use strict'

/**
 * Staff position → pitch.
 *
 * The position is half staff-spaces down from the top line (0 is the top
 * line, 2 the first space). Walking it downward walks the letters d, c, b…,
 * and the octave ticks down whenever the walk passes from c to b. The clef
 * says which pitch the top line starts at — the same table the drawer reads
 * in reverse.
 */

const LETTERS = [ 'c', 'd', 'e', 'f', 'g', 'a', 'b' ]

const TOP_LINE_PITCH = {
  treble: { letter: 'f', octave: 5 },
  bass: { letter: 'a', octave: 3 },
  alto: { letter: 'g', octave: 4 },
  baritone: { letter: 'c', octave: 4 },
  mezzoSoprano: { letter: 'b', octave: 4 },
  soprano: { letter: 'd', octave: 5 },
  tenor: { letter: 'e', octave: 4 },
  octaveEightUp: { letter: 'f', octave: 6 },
  octaveEightDown: { letter: 'f', octave: 4 },
  octaveFifteenUp: { letter: 'f', octave: 7 },
  octaveFifteenDown: { letter: 'f', octave: 3 }
}

export function assignPitchByStaffPosition (staffPosition, clef = 'treble') {
  const start = TOP_LINE_PITCH[clef] || TOP_LINE_PITCH.treble
  const diatonicIndex = start.octave * LETTERS.length + LETTERS.indexOf(start.letter) - staffPosition
  const noteName = LETTERS[(diatonicIndex % LETTERS.length + LETTERS.length) % LETTERS.length]
  return { noteName, octaveNumber: String(Math.floor(diatonicIndex / LETTERS.length)) }
}

export default assignPitchByStaffPosition
