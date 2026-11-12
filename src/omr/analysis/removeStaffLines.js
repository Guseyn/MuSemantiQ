'use strict'

/**
 * The staff lines, subtracted.
 *
 * The line positions were measured first and are kept — this removes only
 * their pixels, so symbols separate instead of fusing with the lines. Every
 * decision reads the input, never the work in progress: clearing left to
 * right would shrink each line's run until the rest of it stops looking like
 * a line.
 *
 * A pixel goes when its vertical run is thin (a head or a stem passing
 * through is thick and stays) and its horizontal run says line rather than
 * speck. Ink that lies exactly on a line row and is no thicker than the line
 * goes with it — a beam that thin on a line row is undetectable here and
 * shows up in the report; beams are usually thicker and their extra rows
 * survive outside the line band.
 */

const LINE_HALF_WIDTH_IN_PIXELS = 1.5
const LINE_LENGTH_IN_STAFF_SPACES = 8
const THIN_RUN_IN_PIXELS = 6

export function removeStaffLines ({ width, height, grayscale }, staves) {
  const cleaned = new Float32Array(grayscale)
  for (const stave of staves) {
    const lineLength = LINE_LENGTH_IN_STAFF_SPACES * stave.staffSpaceHeightPx
    for (const line of stave.linesY) {
      const from = Math.round(line - LINE_HALF_WIDTH_IN_PIXELS)
      const to = Math.round(line + LINE_HALF_WIDTH_IN_PIXELS)
      for (let y = from; y <= to; y++) {
        for (let x = stave.xStart; x <= stave.xEnd; x++) {
          if (grayscale[y * width + x] > 0.5 && isLinePixel(grayscale, width, height, x, y, lineLength)) {
            cleaned[y * width + x] = 0
          }
        }
      }
    }
  }
  return { width, height, grayscale: cleaned }
}

function isLinePixel (grayscale, width, height, x, y, lineLength) {
  const vertical = verticalRunAround(grayscale, width, height, x, y)
  if (vertical > THIN_RUN_IN_PIXELS) {
    return false
  }
  const horizontal = horizontalRunLength(grayscale, width, y, x)
  return horizontal >= lineLength || horizontal <= 3
}

function verticalRunAround (grayscale, width, height, x, y) {
  let before = 0
  while (y - before - 1 >= 0 && grayscale[(y - before - 1) * width + x] > 0.5) {
    before++
  }
  let after = 0
  while (y + after + 1 < height && grayscale[(y + after + 1) * width + x] > 0.5) {
    after++
  }
  return before + after + 1
}

function horizontalRunLength (grayscale, width, y, x) {
  let left = x
  let right = x
  while (left - 1 >= 0 && grayscale[y * width + left - 1] > 0.5) {
    left--
  }
  while (right + 1 < width && grayscale[y * width + right + 1] > 0.5) {
    right++
  }
  return right - left + 1
}

export default removeStaffLines
