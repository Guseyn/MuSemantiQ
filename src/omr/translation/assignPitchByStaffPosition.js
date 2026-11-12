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
  alto: { letter: 'e', octave: 4 },
  tenor: { letter: 'f', octave: 4 }
}

export function assignPitchByStaffPosition (staffPosition, clef = 'treble') {
  const start = TOP_LINE_PITCH[clef] || TOP_LINE_PITCH.treble
  let letterIndex = LETTERS.indexOf(start.letter)
  let octave = start.octave
  for (let step = 0; step < staffPosition; step++) {
    letterIndex = (letterIndex + 6) % 7
    if (letterIndex === 6) {
      octave--
    }
  }
  return { noteName: LETTERS[letterIndex], octaveNumber: String(octave) }
}

export default assignPitchByStaffPosition
