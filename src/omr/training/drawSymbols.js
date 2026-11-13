'use strict'

import { createBitmap, drawLine, drawEllipse, drawEllipseOutline } from './drawBitmap.js'

/**
 * Symbol shapes, drawn as the training set's stand-in glyphs.
 *
 * Each class knows how to draw itself with a little jitter — size, weight,
 * position — so the model sees variation, not one template. When the renderer
 * path lands (page schema → SVG → raster), these become real engravings and
 * the labels keep coming from the drawing. Every drawable here is a row of
 * symbolClasses.js.
 */

export const drawableSymbols = {
  'notehead-filled' (bitmap, x, y, size, random) {
    drawEllipse(bitmap, x, y, size * (0.55 + 0.1 * random()), size * (0.38 + 0.08 * random()))
  },
  'notehead-open' (bitmap, x, y, size, random) {
    drawEllipseOutline(bitmap, x, y, size * (0.52 + 0.1 * random()), size * (0.36 + 0.08 * random()), 1 + random())
  },
  'ghost-head' (bitmap, x, y, size, random) {
    const spread = size * 0.5
    const weight = 1 + random()
    drawLine(bitmap, x - spread, y - spread * 0.7, x + spread, y + spread * 0.7, weight)
    drawLine(bitmap, x - spread, y + spread * 0.7, x + spread, y - spread * 0.7, weight)
  },
  dot (bitmap, x, y, size, random) {
    drawEllipse(bitmap, x, y, size * 0.18, size * (0.16 + 0.05 * random()))
  },
  sharp (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawLine(bitmap, x - size * 0.22, y - size * 0.55, x - size * 0.22, y + size * 0.55, weight)
    drawLine(bitmap, x + size * 0.22, y - size * 0.55, x + size * 0.22, y + size * 0.55, weight)
    drawLine(bitmap, x - size * 0.42, y - size * 0.12, x + size * 0.42, y - size * 0.2, weight + 1)
    drawLine(bitmap, x - size * 0.42, y + size * 0.2, x + size * 0.42, y + size * 0.12, weight + 1)
  },
  flat (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawLine(bitmap, x - size * 0.25, y - size * 0.6, x - size * 0.25, y + size * 0.45, weight)
    drawLine(bitmap, x - size * 0.25, y + size * 0.45, x + size * 0.1, y + size * 0.1, weight + 1)
    drawLine(bitmap, x + size * 0.1, y + size * 0.1, x - size * 0.25, y - size * 0.05, weight + 1)
  },
  natural (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawLine(bitmap, x - size * 0.22, y - size * 0.55, x - size * 0.22, y + size * 0.25, weight)
    drawLine(bitmap, x + size * 0.22, y - size * 0.25, x + size * 0.22, y + size * 0.55, weight)
    drawLine(bitmap, x - size * 0.35, y - size * 0.18, x + size * 0.35, y - size * 0.28, weight)
    drawLine(bitmap, x - size * 0.35, y + size * 0.28, x + size * 0.35, y + size * 0.18, weight)
  },
  'rest-quarter' (bitmap, x, y, size, random) {
    const weight = 2 + random()
    drawLine(bitmap, x - size * 0.15, y - size * 0.55, x + size * 0.2, y - size * 0.1, weight)
    drawLine(bitmap, x + size * 0.2, y - size * 0.1, x - size * 0.1, y + size * 0.15, weight)
    drawLine(bitmap, x - size * 0.1, y + size * 0.15, x + size * 0.18, y + size * 0.55, weight)
  },
  'stem' (bitmap, x, y, size, random) {
    drawLine(bitmap, x, y - size * (0.5 + 0.15 * random()), x, y + size * 0.5, 1 + random())
  },
  junk (bitmap, x, y, size, random) {
    for (let stroke = 0; stroke < 3; stroke++) {
      drawLine(
        bitmap,
        x + (random() - 0.5) * size, y + (random() - 0.5) * size,
        x + (random() - 0.5) * size, y + (random() - 0.5) * size,
        1 + random()
      )
    }
  }
}

export const drawableClassIds = Object.keys(drawableSymbols).filter((id) => id !== 'junk')

// One symbol on a fresh bitmap, jittered. The full bitmap is the crop source.
export function drawSymbolSample (classId, drawSize, random) {
  const bitmap = createBitmap(drawSize, drawSize)
  const center = drawSize / 2
  const size = drawSize * (0.5 + 0.12 * (random() - 0.5))
  drawableSymbols[classId](bitmap, center, center, size, random)
  return bitmap
}
