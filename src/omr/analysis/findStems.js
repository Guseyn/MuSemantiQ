'use strict'

/**
 * Stems: tall, thin runs of ink.
 *
 * A stem is a vertical run about two staff spaces long inside a stave — long
 * enough to be more than a stray mark, short enough to be less than a barline,
 * and thin enough to be less than a clef. What sits at the stem's outer end
 * (beams, flags) is measured later, once the head says which end is outer.
 */

const MIN_STEM_LENGTH_IN_STAFF_SPACES = 1.8
const MAX_STEM_LENGTH_IN_STAFF_SPACES = 4.4
const BEAM_WIDTH_IN_STAFF_SPACES = 1.5
const END_REGION_IN_STAFF_SPACES = 0.6

export function findStems ({ width, height, grayscale }, staves) {
  const stems = []
  for (let staveIndex = 0; staveIndex < staves.length; staveIndex++) {
    const stave = staves[staveIndex]
    const staffSpace = stave.staffSpaceHeightPx
    for (let x = stave.xStart; x <= stave.xEnd; x++) {
      for (const run of verticalRuns({ width, height, grayscale }, x)) {
        const length = run.y2 - run.y1 + 1
        const tooShort = length < MIN_STEM_LENGTH_IN_STAFF_SPACES * staffSpace
        const isBarline = length > MAX_STEM_LENGTH_IN_STAFF_SPACES * staffSpace
        if (tooShort || isBarline) {
          continue
        }
        stems.push({ x, y1: run.y1, y2: run.y2, staveIndex, columns: 1 })
      }
    }
  }
  return mergeAdjacentColumns(stems).filter((stem) =>
    stem.columns <= Math.max(3, 0.3 * staves[stem.staveIndex].staffSpaceHeightPx))
}

// Wide rows at the outer end are beams; smaller ink beside the tip is flags.
export function measureStemEnds (stem, bitmap, staffSpace, outerEnd) {
  const beamRows = []
  let flagRows = 0
  const from = Math.round(outerEnd - END_REGION_IN_STAFF_SPACES * staffSpace)
  const to = Math.round(outerEnd + END_REGION_IN_STAFF_SPACES * staffSpace)
  for (let y = from; y <= to; y++) {
    const extent = horizontalExtent(bitmap, y, stem.x)
    if (extent >= BEAM_WIDTH_IN_STAFF_SPACES * staffSpace) {
      beamRows.push(y)
    } else if (extent >= 0.25 * staffSpace) {
      flagRows++
    }
  }
  let beamCount = 0
  for (let index = 0; index < beamRows.length; index++) {
    if (index === 0 || beamRows[index] - beamRows[index - 1] > 1) {
      beamCount++
    }
  }
  stem.beamRows = beamRows
  stem.beamCount = beamCount
  stem.flagCount = beamCount ? 0 : Math.min(Math.ceil(flagRows / 2), 3)
}

function verticalRuns ({ width, height, grayscale }, x) {
  const runs = []
  let start = null
  for (let y = 0; y < height; y++) {
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
    runs.push({ y1: start, y2: height - 1 })
  }
  return runs
}

function horizontalExtent ({ width, height, grayscale }, y, centerX) {
  if (y < 0 || y >= height) {
    return 0
  }
  let left = Math.round(centerX)
  let right = Math.round(centerX)
  while (left - 1 >= 0 && grayscale[y * width + left - 1] > 0.5) {
    left--
  }
  while (right + 1 < width && grayscale[y * width + right + 1] > 0.5) {
    right++
  }
  return right - left + 1
}

// A stem two pixels wide is one stem, found once per column it covers.
function mergeAdjacentColumns (stems) {
  const merged = []
  for (const stem of stems) {
    const neighbour = merged.find((other) =>
      Math.abs(other.x - stem.x) <= 1 &&
      Math.abs(other.y1 - stem.y1) <= 2 &&
      Math.abs(other.y2 - stem.y2) <= 2
    )
    if (neighbour) {
      neighbour.x = (neighbour.x + stem.x) / 2
      neighbour.columns++
    } else {
      merged.push({ ...stem })
    }
  }
  return merged.sort((first, second) => first.x - second.x)
}

export default findStems
