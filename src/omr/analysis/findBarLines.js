'use strict'

/**
 * Barlines: ink that crosses a whole stave.
 *
 * A barline runs from the top line to the bottom line and a little beyond —
 * longer than any stem, so length alone separates them. Barlines of the same
 * system line up, so positions are clustered and the cluster is what ends the
 * measure on every stave at once.
 */

const COVERS_STAVE_FRACTION = 0.95
const CLUSTER_TOLERANCE_IN_STAFF_SPACES = 0.3

export function findBarLines ({ width, height, grayscale }, staves) {
  const positions = []
  for (const stave of staves) {
    const staffSpace = stave.staffSpaceHeightPx
    const staveHeight = stave.bottomY - stave.topY
    const thinEnough = Math.max(3, 0.3 * staffSpace)
    for (let x = stave.xStart; x <= stave.xEnd; x++) {
      const { y1, y2 } = inkExtent({ width, height, grayscale }, x)
      const covers = y2 - y1 + 1 >= COVERS_STAVE_FRACTION * staveHeight &&
        y1 <= stave.topY + 0.3 * staffSpace &&
        y2 >= stave.bottomY - 0.3 * staffSpace
      // thin everywhere along the way: a note whose stem and head stack up
      // into one tall run is wide where the head is
      const thin = covers && samplesAcross({ width, height, grayscale }, y1, y2, x)
        .every((extent) => extent <= thinEnough)
      if (thin) {
        positions.push(x)
      }
    }
  }
  return cluster(positions, meanStaffSpace(staves) * CLUSTER_TOLERANCE_IN_STAFF_SPACES)
}

function samplesAcross (bitmap, y1, y2, x) {
  const samples = []
  for (let step = 0; step <= 6; step++) {
    const y = Math.round(y1 + ((y2 - y1) * step) / 6)
    samples.push(horizontalExtent(bitmap, y, x))
  }
  return samples
}

function horizontalExtent ({ width, height, grayscale }, y, x) {
  if (y < 0 || y >= height) {
    return 0
  }
  let left = x
  let right = x
  while (left - 1 >= 0 && grayscale[y * width + left - 1] > 0.5) {
    left--
  }
  while (right + 1 < width && grayscale[y * width + right + 1] > 0.5) {
    right++
  }
  return right - left + 1
}

function inkExtent ({ width, height, grayscale }, x) {
  let y1 = -1
  let y2 = -1
  for (let y = 0; y < height; y++) {
    if (grayscale[y * width + x] > 0.5) {
      if (y1 === -1) {
        y1 = y
      }
      y2 = y
    }
  }
  return { y1, y2 }
}

function cluster (positions, tolerance) {
  const sorted = [ ...new Set(positions) ].sort((first, second) => first - second)
  const clustered = []
  for (const position of sorted) {
    const current = clustered[clustered.length - 1]
    if (current !== undefined && position - current[current.length - 1] <= tolerance) {
      current.push(position)
    } else {
      clustered.push([ position ])
    }
  }
  return clustered.map((group) => Math.round(group.reduce((sum, value) => sum + value, 0) / group.length))
}

function meanStaffSpace (staves) {
  return staves.reduce((sum, stave) => sum + stave.staffSpaceHeightPx, 0) / staves.length
}

export default findBarLines
