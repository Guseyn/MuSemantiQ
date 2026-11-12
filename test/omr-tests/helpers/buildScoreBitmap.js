'use strict'

/**
 * Score bitmaps, drawn in code.
 *
 * Tests need pages with known answers: a stave at a known height, a title of a
 * known size, a page turned by a known angle. Drawing them is exact and needs
 * no image files; the same helpers will build the synthetic training pages.
 */

export function createBitmap (width, height) {
  return { width, height, grayscale: new Float32Array(width * height) }
}

export function drawLine (bitmap, x1, y1, x2, y2, thickness = 3) {
  const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))
  for (let step = 0; step <= steps; step++) {
    const x = x1 + ((x2 - x1) * step) / steps
    const y = y1 + ((y2 - y1) * step) / steps
    drawDot(bitmap, x, y, (thickness - 1) / 2)
  }
}

export function drawFilledRect (bitmap, x, y, w, h) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      setInk(bitmap, column, row, 1)
    }
  }
}

export function drawEllipse (bitmap, centerX, centerY, radiusX, radiusY) {
  for (let row = Math.floor(centerY - radiusY); row <= centerY + radiusY; row++) {
    for (let column = Math.floor(centerX - radiusX); column <= centerX + radiusX; column++) {
      const inside = ((column - centerX) / radiusX) ** 2 + ((row - centerY) / radiusY) ** 2 <= 1
      if (inside) {
        setInk(bitmap, column, row, 1)
      }
    }
  }
}

// Five lines from yTop downward. A slope tilts the stave like a photographed
// page: y grows by slope for every x.
export function drawStave (bitmap, x1, x2, yTop, staffSpace, slope = 0) {
  for (let line = 0; line < 5; line++) {
    drawLine(
      bitmap,
      x1, yTop + line * staffSpace + (0 - (x1 + x2) / 2) * slope,
      x2, yTop + line * staffSpace + (x2 - (x1 + x2) / 2) * slope
    )
  }
}

function drawDot (bitmap, x, y, radius) {
  for (let row = Math.floor(y - radius); row <= y + radius; row++) {
    for (let column = Math.floor(x - radius); column <= x + radius; column++) {
      setInk(bitmap, column, row, 1)
    }
  }
}

function setInk (bitmap, x, y, value) {
  if (x >= 0 && y >= 0 && x < bitmap.width && y < bitmap.height) {
    bitmap.grayscale[Math.round(y) * bitmap.width + Math.round(x)] = value
  }
}
