'use strict'

/**
 * Long, thin, curved components are ties or slurs, not glyph blobs.
 * Straight hairpins and rectangular beams do not pass the curvature test.
 */

export function findSlurOrTieComponents (bitmap, components, staves) {
  return components.flatMap((component) => {
    const { box, ink } = component
    const stave = nearestStave(box, staves)
    if (!stave) {
      return []
    }
    const staffSpace = stave.staffSpaceHeightPx
    const wide = box.w >= 2 * staffSpace && box.w >= 2 * box.h
    const thin = ink / (box.w * box.h) <= 0.3
    if (!wide || !thin || box.h < Math.max(2, 0.2 * staffSpace) || box.h > 6 * staffSpace) {
      return []
    }
    const depth = curveDepth(bitmap, box)
    if (Math.abs(depth) < 0.2 * staffSpace) {
      return []
    }
    return [ {
      kind: 'curve',
      className: 'slur-or-tie',
      box,
      staveIndex: stave.index,
      depth
    } ]
  })
}

function curveDepth ({ width, grayscale }, box) {
  const left = averageCenterAt(grayscale, width, box, 0, 0.05)
  const middle = averageCenterAt(grayscale, width, box, 0.45, 0.55)
  const right = averageCenterAt(grayscale, width, box, 0.95, 1)
  return middle - (left + right) / 2
}

function averageCenterAt (grayscale, width, box, fromFraction, toFraction) {
  const fromX = Math.floor(box.x + fromFraction * (box.w - 1))
  const toX = Math.floor(box.x + toFraction * (box.w - 1))
  let totalY = 0
  let count = 0
  for (let x = fromX; x <= toX; x++) {
    for (let y = box.y; y < box.y + box.h; y++) {
      if (grayscale[y * width + x] > 0.25) {
        totalY += y
        count++
      }
    }
  }
  return count ? totalY / count : box.y + (box.h - 1) / 2
}

function nearestStave (box, staves) {
  const centerY = box.y + (box.h - 1) / 2
  return staves.map((stave) => {
    const anchor = centerY < stave.topY ? stave.topY : centerY > stave.bottomY ? stave.bottomY : centerY
    return { stave, distance: Math.abs(centerY - anchor) }
  }).filter((entry) => entry.distance <= 6 * entry.stave.staffSpaceHeightPx)
    .sort((first, second) => first.distance - second.distance)[0]?.stave || null
}

export default findSlurOrTieComponents
