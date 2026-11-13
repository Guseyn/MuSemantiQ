'use strict'

import { createBitmap, drawLine, drawEllipse, drawEllipseOutline, drawFilledRect } from './drawBitmap.js'

/**
 * Symbol shapes, drawn as the training set's stand-in glyphs.
 *
 * One shape per row of symbolClasses.js — the drawer covers the whole class
 * table, so training can see every feature MSQ knows. Each shape draws itself
 * with a little jitter: size, weight, position, so the model sees variation,
 * not one template. When the renderer path lands (page schema → SVG →
 * raster), these become real engravings and the labels keep coming from the
 * drawing. Labels are never written by hand.
 */

// A curve is many short segments — enough for braces, clefs and turns.
function polyline (bitmap, points, weight = 1) {
  for (let index = 1; index < points.length; index++) {
    drawLine(bitmap, points[index - 1][0], points[index - 1][1], points[index][0], points[index][1], weight)
  }
}

function arc (bitmap, x, y, radiusX, radiusY, fromAngle, toAngle, weight = 1, steps = 12) {
  const points = []
  for (let step = 0; step <= steps; step++) {
    const angle = fromAngle + (toAngle - fromAngle) * step / steps
    points.push([ x + radiusX * Math.cos(angle), y + radiusY * Math.sin(angle) ])
  }
  polyline(bitmap, points, weight)
}

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
  'double-sharp' (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawFilledRect(bitmap, x - size * 0.18, y - size * 0.12, size * 0.36, size * 0.24)
    drawLine(bitmap, x - size * 0.42, y - size * 0.28, x + size * 0.42, y + size * 0.28, weight)
    drawLine(bitmap, x - size * 0.42, y + size * 0.28, x + size * 0.42, y - size * 0.28, weight)
  },
  'double-flat' (bitmap, x, y, size, random) {
    drawableSymbols.flat(bitmap, x - size * 0.28, y + size * 0.05, size * 0.9, random)
    drawableSymbols.flat(bitmap, x + size * 0.22, y + size * 0.05, size * 0.9, random)
  },
  'clef-treble' (bitmap, x, y, size, random) {
    const weight = 1 + random()
    arc(bitmap, x - size * 0.05, y + size * 0.18, size * 0.32, size * 0.4, 0, 2 * Math.PI, weight)
    polyline(bitmap, [
      [ x + size * 0.12, y + size * 0.62 ], [ x + size * 0.1, y - size * 0.1 ],
      [ x + size * 0.06, y - size * 0.62 ], [ x - size * 0.18, y - size * 0.78 ],
      [ x - size * 0.3, y - size * 0.58 ]
    ], weight + 1)
    drawEllipse(bitmap, x - size * 0.02, y + size * 0.2, size * 0.12, size * 0.12)
  },
  'clef-bass' (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawEllipse(bitmap, x - size * 0.18, y - size * 0.18, size * 0.17, size * 0.15)
    arc(bitmap, x - size * 0.12, y - size * 0.12, size * 0.5, size * 0.55, -0.4, 1.35, weight + 1)
    drawEllipse(bitmap, x + size * 0.28, y - size * 0.3, size * 0.08, size * 0.08)
    drawEllipse(bitmap, x + size * 0.28, y + size * 0.02, size * 0.08, size * 0.08)
  },
  'clef-alto' (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawFilledRect(bitmap, x - size * 0.08, y - size * 0.62, size * 0.16, size * 1.24)
    arc(bitmap, x + size * 0.02, y - size * 0.32, size * 0.3, size * 0.26, Math.PI * 0.6, Math.PI * 1.55, weight + 1)
    arc(bitmap, x + size * 0.02, y + size * 0.32, size * 0.3, size * 0.26, Math.PI * 1.55, Math.PI * 2.5, weight + 1)
    drawEllipse(bitmap, x - size * 0.14, y - size * 0.32, size * 0.08, size * 0.08)
    drawEllipse(bitmap, x - size * 0.14, y + size * 0.32, size * 0.08, size * 0.08)
  },
  'rest-whole' (bitmap, x, y, size, random) {
    drawFilledRect(bitmap, x - size * 0.3, y - size * 0.16, size * 0.6, size * (0.28 + 0.08 * random()))
  },
  'rest-half' (bitmap, x, y, size, random) {
    drawFilledRect(bitmap, x - size * 0.3, y - size * 0.02, size * 0.6, size * (0.28 + 0.08 * random()))
    drawFilledRect(bitmap, x - size * 0.3, y - size * 0.24, size * 0.22, size * 0.18)
  },
  'rest-quarter' (bitmap, x, y, size, random) {
    const weight = 2 + random()
    drawLine(bitmap, x - size * 0.15, y - size * 0.55, x + size * 0.2, y - size * 0.1, weight)
    drawLine(bitmap, x + size * 0.2, y - size * 0.1, x - size * 0.1, y + size * 0.15, weight)
    drawLine(bitmap, x - size * 0.1, y + size * 0.15, x + size * 0.18, y + size * 0.55, weight)
  },
  'rest-eighth' (bitmap, x, y, size, random) {
    const weight = 2 + random()
    drawLine(bitmap, x - size * 0.12, y - size * 0.55, x - size * 0.12, y + size * 0.2, weight)
    drawEllipse(bitmap, x + size * 0.08, y - size * 0.32, size * 0.17, size * 0.24)
  },
  'digit-0' (bitmap, x, y, size) {
    drawEllipseOutline(bitmap, x, y, size * 0.28, size * 0.5, 2)
  },
  'digit-1' (bitmap, x, y, size) {
    polyline(bitmap, [ [ x - size * 0.18, y - size * 0.32 ], [ x, y - size * 0.5 ], [ x, y + size * 0.5 ] ], 2)
  },
  'digit-2' (bitmap, x, y, size) {
    polyline(bitmap, [
      [ x - size * 0.26, y - size * 0.3 ], [ x - size * 0.08, y - size * 0.52 ], [ x + size * 0.18, y - size * 0.48 ],
      [ x + size * 0.26, y - size * 0.22 ], [ x - size * 0.24, y + size * 0.42 ], [ x - size * 0.28, y + size * 0.5 ],
      [ x + size * 0.28, y + size * 0.5 ]
    ], 2)
  },
  'digit-3' (bitmap, x, y, size) {
    polyline(bitmap, [
      [ x - size * 0.26, y - size * 0.42 ], [ x + size * 0.06, y - size * 0.52 ], [ x + size * 0.26, y - size * 0.32 ],
      [ x - size * 0.02, y - size * 0.02 ], [ x + size * 0.26, y + size * 0.26 ], [ x + size * 0.02, y + size * 0.52 ],
      [ x - size * 0.28, y + size * 0.42 ]
    ], 2)
  },
  'digit-4' (bitmap, x, y, size) {
    polyline(bitmap, [
      [ x + size * 0.12, y - size * 0.52 ], [ x - size * 0.28, y + size * 0.16 ], [ x + size * 0.3, y + size * 0.16 ]
    ], 2)
    drawLine(bitmap, x + size * 0.12, y - size * 0.52, x + size * 0.12, y + size * 0.52, 2)
  },
  'digit-5' (bitmap, x, y, size) {
    polyline(bitmap, [
      [ x + size * 0.28, y - size * 0.5 ], [ x - size * 0.24, y - size * 0.5 ], [ x - size * 0.22, y - size * 0.02 ],
      [ x + size * 0.14, y - size * 0.08 ], [ x + size * 0.28, y + size * 0.2 ], [ x + size * 0.1, y + size * 0.52 ],
      [ x - size * 0.28, y + size * 0.44 ]
    ], 2)
  },
  'digit-6' (bitmap, x, y, size) {
    arc(bitmap, x, y + size * 0.12, size * 0.3, size * 0.38, 0, 2 * Math.PI, 2)
    polyline(bitmap, [ [ x + size * 0.26, y - size * 0.42 ], [ x - size * 0.14, y - size * 0.1 ] ], 2)
  },
  'digit-7' (bitmap, x, y, size) {
    polyline(bitmap, [
      [ x - size * 0.28, y - size * 0.5 ], [ x + size * 0.28, y - size * 0.5 ], [ x - size * 0.08, y + size * 0.52 ]
    ], 2)
  },
  'digit-8' (bitmap, x, y, size) {
    arc(bitmap, x, y - size * 0.24, size * 0.24, size * 0.26, 0, 2 * Math.PI, 2)
    arc(bitmap, x, y + size * 0.22, size * 0.3, size * 0.3, 0, 2 * Math.PI, 2)
  },
  'digit-9' (bitmap, x, y, size) {
    arc(bitmap, x, y - size * 0.12, size * 0.3, size * 0.38, 0, 2 * Math.PI, 2)
    polyline(bitmap, [ [ x + size * 0.22, y + size * 0.1 ], [ x - size * 0.1, y + size * 0.52 ] ], 2)
  },
  fermata (bitmap, x, y, size, random) {
    arc(bitmap, x, y + size * 0.18, size * 0.48, size * 0.42, Math.PI, 2 * Math.PI, 2 + random())
    drawEllipse(bitmap, x, y + size * 0.12, size * 0.1, size * 0.1)
  },
  'breath-mark' (bitmap, x, y, size, random) {
    drawEllipse(bitmap, x - size * 0.05, y - size * 0.12, size * 0.14, size * 0.12)
    drawLine(bitmap, x - size * 0.12, y, x + size * 0.18, y + size * 0.4, 1 + random())
  },
  staccato (bitmap, x, y, size) {
    drawEllipse(bitmap, x, y, size * 0.11, size * 0.11)
  },
  accent (bitmap, x, y, size, random) {
    const weight = 2 + random()
    polyline(bitmap, [ [ x - size * 0.45, y - size * 0.2 ], [ x + size * 0.45, y ], [ x - size * 0.45, y + size * 0.2 ] ], weight)
  },
  tenuto (bitmap, x, y, size, random) {
    drawLine(bitmap, x - size * 0.32, y, x + size * 0.32, y, 2 + random())
  },
  marcato (bitmap, x, y, size, random) {
    const weight = 2 + random()
    polyline(bitmap, [ [ x - size * 0.35, y + size * 0.22 ], [ x, y - size * 0.28 ], [ x + size * 0.35, y + size * 0.22 ] ], weight)
  },
  'grace-slash' (bitmap, x, y, size, random) {
    drawLine(bitmap, x - size * 0.35, y + size * 0.38, x + size * 0.35, y - size * 0.38, 2 + random())
  },
  segno (bitmap, x, y, size, random) {
    const weight = 1 + random()
    arc(bitmap, x, y - size * 0.16, size * 0.22, size * 0.18, Math.PI * 0.5, Math.PI * 1.6, weight + 1)
    arc(bitmap, x, y + size * 0.16, size * 0.22, size * 0.18, Math.PI * 1.5, Math.PI * 2.6, weight + 1)
    drawLine(bitmap, x - size * 0.3, y + size * 0.36, x + size * 0.3, y - size * 0.36, weight + 1)
    drawEllipse(bitmap, x - size * 0.26, y - size * 0.18, size * 0.07, size * 0.07)
    drawEllipse(bitmap, x + size * 0.26, y + size * 0.18, size * 0.07, size * 0.07)
  },
  coda (bitmap, x, y, size, random) {
    const weight = 1 + random()
    drawEllipseOutline(bitmap, x, y, size * 0.3, size * 0.3, weight + 1)
    drawLine(bitmap, x, y - size * 0.55, x, y + size * 0.55, weight + 1)
    drawLine(bitmap, x - size * 0.55, y, x + size * 0.55, y, weight + 1)
  },
  pedal (bitmap, x, y, size, random) {
    const weight = 2 + random()
    drawLine(bitmap, x - size * 0.3, y - size * 0.5, x - size * 0.3, y + size * 0.5, weight)
    arc(bitmap, x - size * 0.05, y - size * 0.3, size * 0.28, size * 0.24, -Math.PI / 2, Math.PI / 2, weight)
    drawLine(bitmap, x - size * 0.3, y + size * 0.5, x + size * 0.2, y + size * 0.5, weight)
  },
  turn (bitmap, x, y, size, random) {
    const weight = 1 + random()
    arc(bitmap, x - size * 0.16, y, size * 0.18, size * 0.16, Math.PI * 0.5, Math.PI * 2.5, weight + 1)
    arc(bitmap, x + size * 0.16, y, size * 0.18, size * 0.16, Math.PI * 1.5, Math.PI * 3.5, weight + 1)
    drawLine(bitmap, x - size * 0.38, y, x - size * 0.28, y, weight)
  },
  mordent (bitmap, x, y, size, random) {
    const weight = 1 + random()
    polyline(bitmap, [
      [ x - size * 0.42, y + size * 0.18 ], [ x - size * 0.14, y - size * 0.22 ],
      [ x + size * 0.12, y + size * 0.18 ], [ x + size * 0.4, y - size * 0.22 ]
    ], weight + 1)
    drawLine(bitmap, x + size * 0.4, y - size * 0.22, x + size * 0.4, y + size * 0.18, weight)
  },
  trill (bitmap, x, y, size, random) {
    const weight = 1 + random()
    const points = []
    for (let step = 0; step <= 12; step++) {
      const t = step / 12
      points.push([ x - size * 0.42 + t * size * 0.84, y + Math.sin(t * Math.PI * 3) * size * 0.18 ])
    }
    polyline(bitmap, points, weight + 1)
    drawLine(bitmap, x - size * 0.42, y + size * 0.3, x + size * 0.42, y + size * 0.3, weight)
  },
  simile (bitmap, x, y, size, random) {
    drawLine(bitmap, x - size * 0.35, y + size * 0.35, x + size * 0.35, y - size * 0.35, 2 + random())
    drawEllipse(bitmap, x - size * 0.22, y - size * 0.2, size * 0.08, size * 0.08)
    drawEllipse(bitmap, x + size * 0.22, y + size * 0.2, size * 0.08, size * 0.08)
  },
  brace (bitmap, x, y, size, random) {
    const weight = 2 + random()
    polyline(bitmap, [
      [ x + size * 0.14, y - size * 0.68 ], [ x - size * 0.06, y - size * 0.6 ],
      [ x - size * 0.12, y - size * 0.28 ], [ x - size * 0.36, y ],
      [ x - size * 0.12, y + size * 0.28 ], [ x - size * 0.06, y + size * 0.6 ],
      [ x + size * 0.14, y + size * 0.68 ]
    ], weight)
  },
  bracket (bitmap, x, y, size, random) {
    const weight = 3 + random()
    drawLine(bitmap, x, y - size * 0.68, x, y + size * 0.68, weight)
    drawLine(bitmap, x, y - size * 0.68, x + size * 0.26, y - size * 0.68, weight)
    drawLine(bitmap, x, y + size * 0.68, x + size * 0.26, y + size * 0.68, weight)
  },
  'repeat-dot' (bitmap, x, y, size) {
    drawEllipse(bitmap, x, y - size * 0.2, size * 0.1, size * 0.1)
    drawEllipse(bitmap, x, y + size * 0.2, size * 0.1, size * 0.1)
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
