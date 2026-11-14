'use strict'

/**
 * Ink is 1, paper is 0 — whatever colours the picture came in.
 *
 * Every rule in the translator assumes that convention. A score printed
 * white on a dark ground would otherwise hand the classifier a negative,
 * and a coloured ground would leave a grey floor under every value. The
 * page's dominant tone is the paper: when it reads as ink the picture is
 * negative and the values flip, and in either case the paper level is
 * subtracted away and the rest stretched.
 */
export function normalizeInkPolarity ({ width, height, grayscale }) {
  const middle = medianOf(grayscale)
  const offset = middle > 0.5 ? 1 - middle : middle
  const stretch = 1 / (1 - offset)
  const leveled = new Float32Array(grayscale.length)
  for (let index = 0; index < grayscale.length; index++) {
    const value = middle > 0.5 ? 1 - grayscale[index] : grayscale[index]
    leveled[index] = Math.max(0, (value - offset) * stretch)
  }
  return { width, height, grayscale: leveled }
}

function medianOf (values) {
  const sorted = Float32Array.from(values).sort()
  return sorted[Math.floor(sorted.length / 2)]
}

export default normalizeInkPolarity
