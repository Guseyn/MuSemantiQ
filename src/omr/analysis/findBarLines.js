'use strict'

/**
 * Barlines: continuous ink that crosses a whole stave.
 *
 * Candidates are measured inside one stave, then aligned into one boundary
 * per system. Initial and final boundaries stay in the result for their
 * notation meaning, but only internal boundaries divide the music model.
 */

const COVERS_STAVE_FRACTION = 0.95
const CLUSTER_TOLERANCE_IN_STAFF_SPACES = 0.8
const EDGE_TOLERANCE_IN_STAFF_SPACES = 0.6

export function findBarLines ({ width, height, grayscale }, staves) {
  const candidates = []
  for (const stave of staves) {
    const staffSpace = stave.staffSpaceHeightPx
    const staveHeight = stave.bottomY - stave.topY
    const thinEnough = Math.max(3, 0.3 * staffSpace)
    const fromY = Math.max(0, Math.floor(stave.topY - 0.35 * staffSpace))
    const toY = Math.min(height - 1, Math.ceil(stave.bottomY + 0.35 * staffSpace))
    for (let x = stave.xStart; x <= stave.xEnd; x++) {
      for (const run of verticalRuns({ width, grayscale }, x, fromY, toY)) {
        const covers = run.y2 - run.y1 + 1 >= COVERS_STAVE_FRACTION * staveHeight &&
          run.y1 <= stave.topY + 0.3 * staffSpace &&
          run.y2 >= stave.bottomY - 0.3 * staffSpace
        if (covers && thinCore({ width, grayscale }, run, x, thinEnough)) {
          candidates.push({
            x,
            y1: run.y1,
            y2: run.y2,
            staveIndex: stave.index,
            systemIndex: stave.systemIndex ?? 0
          })
        }
      }
    }
  }
  return cluster(candidates, staves)
}

function verticalRuns ({ width, grayscale }, x, fromY, toY) {
  const runs = []
  let start = null
  for (let y = fromY; y <= toY; y++) {
    const ink = grayscale[y * width + x] > 0.5
    if (ink && start === null) {
      start = y
    }
    if (!ink && start !== null) {
      runs.push({ y1: start, y2: y - 1 })
      start = null
    }
  }
  if (start !== null) {
    runs.push({ y1: start, y2: toY })
  }
  return runs
}

// A head or repeat dot may protrude at a few rows; the line's vertical core
// still has to be thin almost everywhere.
function thinCore ({ width, grayscale }, run, x, thinEnough) {
  let thinRows = 0
  const rows = run.y2 - run.y1 + 1
  for (let y = run.y1; y <= run.y2; y++) {
    const extent = horizontalExtent({ width, grayscale }, y, x)
    if (extent > 0 && extent <= thinEnough) {
      thinRows++
    }
  }
  return thinRows / rows >= 0.9
}

function horizontalExtent ({ width, grayscale }, y, x) {
  if (grayscale[y * width + x] <= 0.5) {
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

function cluster (candidates, staves) {
  const sorted = candidates.sort((first, second) => first.systemIndex - second.systemIndex || first.x - second.x)
  const clustered = []
  for (const candidate of sorted) {
    const current = clustered[clustered.length - 1]
    const staffSpace = staves[candidate.staveIndex].staffSpaceHeightPx
    if (current && current.systemIndex === candidate.systemIndex &&
      Math.abs(candidate.x - current.x) <= staffSpace * CLUSTER_TOLERANCE_IN_STAFF_SPACES) {
      current.candidates.push(candidate)
      current.x = mean(current.candidates.map((item) => item.x))
    } else {
      clustered.push({ systemIndex: candidate.systemIndex, x: candidate.x, candidates: [ candidate ] })
    }
  }
  return clustered.map((group) => {
    const staveIndexes = [ ...new Set(group.candidates.map((candidate) => candidate.staveIndex)) ]
    const systemStaves = staves.filter((stave) => (stave.systemIndex ?? 0) === group.systemIndex)
    // A grand staff's measure boundary has support on every stave. A long
    // beamed-note run on only one stave is not a system barline.
    if (staveIndexes.length < systemStaves.length) {
      return null
    }
    const staffSpace = mean(systemStaves.map((stave) => stave.staffSpaceHeightPx))
    const x = Math.round(group.x)
    const atStart = systemStaves.every((stave) => Math.abs(x - stave.xStart) <= EDGE_TOLERANCE_IN_STAFF_SPACES * staffSpace)
    const atEnd = systemStaves.every((stave) => Math.abs(x - stave.xEnd) <= EDGE_TOLERANCE_IN_STAFF_SPACES * staffSpace)
    return {
      x,
      y1: Math.min(...group.candidates.map((candidate) => candidate.y1)),
      y2: Math.max(...group.candidates.map((candidate) => candidate.y2)),
      systemIndex: group.systemIndex,
      staveIndexes,
      kind: atStart ? 'opening' : atEnd ? 'closing' : 'internal'
    }
  }).filter(Boolean).sort((first, second) => first.systemIndex - second.systemIndex || first.x - second.x)
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default findBarLines
