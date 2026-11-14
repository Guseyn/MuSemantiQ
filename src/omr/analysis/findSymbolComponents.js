'use strict'

/**
 * Ink that belongs together.
 *
 * A component is a connected blob of ink — one notehead with its stem, one
 * accidental, one digit. Flood fill over ink above the threshold; the bounding
 * box of each blob is what the classifier crops and what the rules measure.
 */

const INK_THRESHOLD = 0.5

export function findSymbolComponents ({ width, height, grayscale }) {
  const visited = new Uint8Array(width * height)
  const components = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      if (visited[index] || grayscale[index] <= INK_THRESHOLD) {
        continue
      }
      components.push(floodFill({ width, height, grayscale }, visited, x, y))
    }
  }
  return components.sort((first, second) => first.box.x - second.box.x || first.box.y - second.box.y)
}

function floodFill ({ width, height, grayscale }, visited, startX, startY) {
  const stack = [ [ startX, startY ] ]
  let minX = startX
  let maxX = startX
  let minY = startY
  let maxY = startY
  let ink = 0
  while (stack.length) {
    const [ x, y ] = stack.pop()
    const index = y * width + x
    if (visited[index] || grayscale[index] <= INK_THRESHOLD) {
      continue
    }
    visited[index] = 1
    ink++
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    // Antialiasing and diagonal strokes often meet only at a corner.
    for (const offsetY of [ -1, 0, 1 ]) {
      for (const offsetX of [ -1, 0, 1 ]) {
        if ((offsetX || offsetY) && x + offsetX >= 0 && x + offsetX < width && y + offsetY >= 0 && y + offsetY < height) {
          stack.push([ x + offsetX, y + offsetY ])
        }
      }
    }
  }
  return { box: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }, ink }
}

export default findSymbolComponents
