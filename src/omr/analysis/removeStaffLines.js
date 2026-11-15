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

const LINE_LENGTH_IN_STAFF_SPACES = 8

export function removeStaffLines ({ width, height, grayscale }, staves) {
  const cleaned = new Float32Array(grayscale)
  for (const stave of staves) {
    const lineLength = LINE_LENGTH_IN_STAFF_SPACES * stave.intervalBetweenStaveLines
    const lineThickness = stave.staveLineThickness || measureLineThickness(stave, { width, height, grayscale })
    const halfWidth = lineThickness / 2 + 0.25
    const maximumThinRun = Math.max(2, 2 * lineThickness)
    for (const line of stave.linesY) {
      const from = Math.round(line - halfWidth)
      const to = Math.round(line + halfWidth)
      for (let y = from; y <= to; y++) {
        for (let x = stave.xStart; x <= stave.xEnd; x++) {
          if (grayscale[y * width + x] > 0.25 && isLinePixel(grayscale, width, height, x, y, lineLength, maximumThinRun)) {
            cleaned[y * width + x] = 0
          }
        }
      }
    }
  }
  return { width, height, grayscale: cleaned }
}

function isLinePixel (grayscale, width, height, x, y, lineLength, maximumThinRun) {
  const vertical = verticalRunAround(grayscale, width, height, x, y)
  if (vertical > maximumThinRun) {
    return false
  }
  const horizontal = horizontalRunLength(grayscale, width, y, x)
  return horizontal >= lineLength
}

function measureLineThickness (stave, { width, height, grayscale }) {
  const runs = []
  const samples = Math.max(5, Math.min(40, stave.xEnd - stave.xStart + 1))
  for (const line of stave.linesY) {
    const centerY = Math.round(line)
    for (let sample = 0; sample < samples; sample++) {
      const x = Math.round(stave.xStart + (stave.xEnd - stave.xStart) * sample / Math.max(1, samples - 1))
      runs.push(verticalRunAround(grayscale, width, height, x, centerY))
    }
  }
  runs.sort((first, second) => first - second)
  return runs.length ? Math.max(1, runs[Math.floor(runs.length / 2)]) : 1
}

function verticalRunAround (grayscale, width, height, x, y) {
  let before = 0
  while (y - before - 1 >= 0 && grayscale[(y - before - 1) * width + x] > 0.25) {
    before++
  }
  let after = 0
  while (y + after + 1 < height && grayscale[(y + after + 1) * width + x] > 0.25) {
    after++
  }
  return before + after + 1
}

function horizontalRunLength (grayscale, width, y, x) {
  let left = x
  let right = x
  while (left - 1 >= 0 && grayscale[y * width + left - 1] > 0.25) {
    left--
  }
  while (right + 1 < width && grayscale[y * width + right + 1] > 0.25) {
    right++
  }
  return right - left + 1
}

export default removeStaffLines
