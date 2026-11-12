'use strict'

/**
 * The staff lines, subtracted.
 *
 * The line positions were measured first and are kept — this removes only
 * their pixels, so symbols separate instead of fusing with the lines. A line
 * is thin and a head is thick, so each column's vertical run of ink decides:
 * short runs on a line row are line ink and go, long runs belong to a symbol
 * and stay. This is also why a head on a line survives whole, and why a stem
 * crossing a line is never cut.
 */

const MAX_LINE_THICKNESS_IN_ROWS = 6

export function removeStaffLines ({ width, height, grayscale }, staves) {
  const cleaned = new Float32Array(grayscale)
  for (const stave of staves) {
    for (const line of stave.linesY) {
      const y = Math.round(line)
      for (let x = stave.xStart; x <= stave.xEnd; x++) {
        if (cleaned[y * width + x] <= 0.5) {
          continue
        }
        let top = y
        while (top - 1 >= 0 && cleaned[(top - 1) * width + x] > 0.5) {
          top--
        }
        let bottom = y
        while (bottom + 1 < height && cleaned[(bottom + 1) * width + x] > 0.5) {
          bottom++
        }
        if (bottom - top + 1 <= MAX_LINE_THICKNESS_IN_ROWS) {
          for (let row = top; row <= bottom; row++) {
            cleaned[row * width + x] = 0
          }
        }
      }
    }
  }
  return { width, height, grayscale: cleaned }
}

export default removeStaffLines
