'use strict'

/**
 * Score pages, drawn in code.
 *
 * Tests need pages with known answers: a stave at a known height, a title of a
 * known size, a page turned by a known angle. The primitives come from the
 * training drawer; this adds the stave itself.
 */

import { createBitmap, setInk, drawLine, drawFilledRect } from '#msq/omr/training/drawBitmap.js'

export { createBitmap, drawFilledRect }

// Five lines from yTop downward. A slope tilts the stave like a photographed
// page: y grows by slope for every x.
export function drawStave (bitmap, x1, x2, yTop, staffSpace, slope = 0) {
  for (let line = 0; line < 5; line++) {
    drawLine(
      bitmap,
      x1, yTop + line * staffSpace - (x1 + x2) / 2 * slope,
      x2, yTop + line * staffSpace + (x2 - x1) / 2 * slope,
      3
    )
  }
}

export function drawDot (bitmap, x, y, radius) {
  for (let row = Math.floor(y - radius); row <= y + radius; row++) {
    for (let column = Math.floor(x - radius); column <= x + radius; column++) {
      setInk(bitmap, column, row, 1)
    }
  }
}
