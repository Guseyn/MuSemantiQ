'use strict'

import normalizeInkPolarity from '#msq/omr/analysis/normalizeInkPolarity.js'

/**
 * Image pixels, as the numbers the analysis works in.
 *
 * `grayscale` is darkness, not lightness: 0 is paper, 1 is ink. Every formula
 * downstream can then just say "ink". Colour is flattened by the standard luma
 * weights; the palette of the page is measured later from these same values.
 */

export function readBitmapFromImage ({ width, height, data }) {
  const grayscale = new Float32Array(width * height)
  const rgb = new Float32Array(width * height * 3)
  for (let index = 0; index < grayscale.length; index++) {
    const offset = index * 4
    const luma = (0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2]) / 255
    grayscale[index] = 1 - luma
    rgb[index * 3] = data[offset] / 255
    rgb[index * 3 + 1] = data[offset + 1] / 255
    rgb[index * 3 + 2] = data[offset + 2] / 255
  }
  return { ...normalizeInkPolarity({ width, height, grayscale }), rgb }
}

export default readBitmapFromImage
