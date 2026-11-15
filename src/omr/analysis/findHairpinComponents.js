'use strict'

/**
 * A hairpin's two strokes may meet in one connected component. Its vertical
 * spread opens from one end to the other; a slur's stroke width stays narrow.
 */

export function findHairpinComponents (bitmap, components, staves) {
  return components.flatMap((component) => {
    const { box, ink } = component
    const stave = nearestStave(box, staves)
    if (!stave) {
      return []
    }
    const intervalBetweenStaveLines = stave.intervalBetweenStaveLines
    const wide = box.w >= 3 * intervalBetweenStaveLines && box.w >= 3 * box.h
    const thin = ink / (box.w * box.h) <= 0.3
    if (!wide || !thin) {
      return []
    }
    const middleSpread = spreadAt(bitmap, box, 0.45, 0.55)
    if (middleSpread < 0.25 * intervalBetweenStaveLines) {
      return []
    }
    const leftSpread = spreadAt(bitmap, box, 0, 0.05)
    const rightSpread = spreadAt(bitmap, box, 0.95, 1)
    const opening = rightSpread - leftSpread
    if (Math.abs(opening) < 0.4 * intervalBetweenStaveLines) {
      return []
    }
    return [ {
      kind: 'hairpin',
      className: opening > 0 ? 'crescendo' : 'diminuendo',
      box,
      staveIndex: stave.index,
      leftSpread,
      rightSpread
    } ]
  })
}

function spreadAt ({ width, grayscale }, box, fromFraction, toFraction) {
  const fromX = Math.floor(box.x + fromFraction * (box.w - 1))
  const toX = Math.floor(box.x + toFraction * (box.w - 1))
  const spreads = []
  for (let x = fromX; x <= toX; x++) {
    let minY = Infinity
    let maxY = -1
    for (let y = box.y; y < box.y + box.h; y++) {
      if (grayscale[y * width + x] > 0.25) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
    if (maxY >= minY) {
      spreads.push(maxY - minY)
    }
  }
  return spreads.length ? spreads.reduce((sum, value) => sum + value, 0) / spreads.length : 0
}

function nearestStave (box, staves) {
  const centerY = box.y + (box.h - 1) / 2
  return staves.map((stave) => {
    const anchor = centerY < stave.topY ? stave.topY : centerY > stave.bottomY ? stave.bottomY : centerY
    return { stave, distance: Math.abs(centerY - anchor) }
  }).filter((entry) => entry.distance <= 8 * entry.stave.intervalBetweenStaveLines)
    .sort((first, second) => first.distance - second.distance)[0]?.stave || null
}

export default findHairpinComponents
