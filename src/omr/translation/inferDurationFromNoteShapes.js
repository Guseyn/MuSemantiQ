'use strict'

/**
 * What a note looks like → how long it lasts.
 *
 * An open head is twice a filled one; every beam or flag halves again; a stem
 * only exists when the note is shorter than a whole. Dots are counted apart,
 * the way the schema keeps them.
 */

export function inferDurationFromNoteShapes ({ isOpenHead, hasStem, beamCount = 0, flagCount = 0, headClassName = null }) {
  if (headClassName === 'notehead-double-whole') {
    return 4
  }
  if (headClassName === 'notehead-quadruple-whole') {
    return 2
  }
  if (!hasStem) {
    return 1
  }
  if (isOpenHead) {
    return 0.5
  }
  return 1 / 2 ** (2 + beamCount + flagCount)
}

export default inferDurationFromNoteShapes
