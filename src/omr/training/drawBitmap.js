'use strict'

/**
 * Drawing into a bitmap.
 *
 * Symbols need pictures with known answers: training crops, test pages. These
 * primitives are how they get drawn until the renderer path (page schema → SVG
 * → raster) replaces them — labels still come from the drawing, never from a
 * human. Everything is ink on paper: 0 is paper, 1 is ink.
 */

export function createBitmap (width, height) {
  return { width, height, grayscale: new Float32Array(width * height) }
}

export function setInk (bitmap, x, y, value) {
  const column = Math.round(x)
  const row = Math.round(y)
  if (column >= 0 && row >= 0 && column < bitmap.width && row < bitmap.height) {
    bitmap.grayscale[row * bitmap.width + column] = value
  }
}

export function drawLine (bitmap, x1, y1, x2, y2, thickness = 1) {
  const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))
  const radius = (thickness - 1) / 2
  for (let step = 0; step <= steps; step++) {
    const x = x1 + ((x2 - x1) * step) / steps
    const y = y1 + ((y2 - y1) * step) / steps
    for (let row = Math.floor(y - radius); row <= y + radius; row++) {
      for (let column = Math.floor(x - radius); column <= x + radius; column++) {
        setInk(bitmap, column, row, 1)
      }
    }
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
  drawEllipseShape(bitmap, centerX, centerY, radiusX, radiusY, 1)
}

export function drawEllipseOutline (bitmap, centerX, centerY, radiusX, radiusY, thickness = 2) {
  drawEllipseShape(bitmap, centerX, centerY, radiusX, radiusY, 0, thickness)
}

function drawEllipseShape (bitmap, centerX, centerY, radiusX, radiusY, fill, thickness = 0) {
  const outerX = radiusX + (fill ? 0 : thickness / 2)
  const outerY = radiusY + (fill ? 0 : thickness / 2)
  for (let row = Math.floor(centerY - outerY); row <= centerY + outerY; row++) {
    for (let column = Math.floor(centerX - outerX); column <= centerX + outerX; column++) {
      const distance = ((column - centerX) / radiusX) ** 2 + ((row - centerY) / radiusY) ** 2
      const inside = fill ? distance <= 1 : distance <= 1.25 && distance >= 0.55
      if (inside) {
        setInk(bitmap, column, row, 1)
      }
    }
  }
}
