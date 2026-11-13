'use strict'

/**
 * Where the staff lines are.
 *
 * The lines are the strongest horizontal ink on the page: the row ink profile
 * has one sharp peak per line. Peaks with near-constant spacing form a staff;
 * a run of four peaks gets its missing line reconstructed, because lines are
 * equally spaced by definition. Each line is then re-centred on its ink, and
 * every position is kept — this measurement is the coordinate system the rest
 * of the tool reads against (pixels are removed later, coordinates are not).
 */

const PEAK_THRESHOLD = 0.15
const SPACING_TOLERANCE = 0.25

export function detectStaves ({ width, height, grayscale }) {
  const profile = rowInkProfile({ width, height, grayscale })
  const peaks = findPeakCandidates(profile)
  const lines = groupPeaksIntoStaves(peaks)
  const staves = lines.map((rawLines) => buildStave(rawLines, profile, { width, height, grayscale }))
  const staffSpaceHeightPx = mean(staves.map((stave) => stave.staffSpaceHeightPx))
  return { staves, staffSpaceHeightPx }
}

function rowInkProfile ({ width, height, grayscale }) {
  const profile = new Float64Array(height)
  for (let y = 0; y < height; y++) {
    let ink = 0
    for (let x = 0; x < width; x++) {
      ink += grayscale[y * width + x]
    }
    // a one-row smoothing keeps single dead pixels from becoming peaks
    profile[y] = ink / width
  }
  const smoothed = new Float64Array(height)
  for (let y = 0; y < height; y++) {
    const before = profile[Math.max(0, y - 1)]
    const after = profile[Math.min(height - 1, y + 1)]
    smoothed[y] = 0.25 * before + 0.5 * profile[y] + 0.25 * after
  }
  return smoothed
}

function findPeakCandidates (profile) {
  const peaks = []
  for (let y = 1; y < profile.length - 1; y++) {
    const isPeak = profile[y] >= PEAK_THRESHOLD && profile[y] >= profile[y - 1] && profile[y] > profile[y + 1]
    if (isPeak) {
      peaks.push(y)
    }
  }
  return peaks
}

// Runs of peaks with constant spacing are staves. A gap of about two spacings
// means a line is missing and is filled in; anything else ends the run.
function groupPeaksIntoStaves (peaks) {
  const staves = []
  let index = 0
  while (index < peaks.length - 1) {
    const spacing = peaks[index + 1] - peaks[index]
    const run = [ peaks[index] ]
    let cursor = index
    while (run.length < 5 && cursor + 1 < peaks.length) {
      const gap = peaks[cursor + 1] - peaks[cursor]
      const steps = Math.round(gap / spacing)
      if (steps < 1 || steps > 2 || Math.abs(gap - steps * spacing) > Math.max(1, SPACING_TOLERANCE * spacing)) {
        break
      }
      for (let step = 1; step < steps; step++) {
        run.push(peaks[cursor] + step * spacing)
      }
      run.push(peaks[cursor + 1])
      cursor++
    }
    if (run.length >= 5) {
      staves.push(run.slice(0, 5))
      index = cursor + 1
    } else if (run.length === 4) {
      staves.push([ ...run, run[3] + spacing ])
      index = cursor + 1
    } else {
      index++
    }
  }
  return staves
}

function buildStave (rawLines, profile, bitmap) {
  const linesY = rawLines.map((line) => recenterLine(line, profile))
  const gaps = linesY.slice(1).map((line, index) => line - linesY[index])
  const staffSpaceHeightPx = mean(gaps)
  const topY = linesY[0]
  const bottomY = linesY[4]
  const { xStart, xEnd } = lineExtents(linesY, staffSpaceHeightPx, bitmap)
  return { linesY, staffSpaceHeightPx, topY, bottomY, xStart, xEnd }
}

// Interpolated lines have no ink to re-centre on and keep their guess.
function recenterLine (line, profile) {
  const from = Math.max(0, Math.round(line) - 2)
  const to = Math.min(profile.length - 1, Math.round(line) + 2)
  let weighted = 0
  let total = 0
  for (let y = from; y <= to; y++) {
    weighted += y * profile[y]
    total += profile[y]
  }
  return total > 0 ? weighted / total : line
}

// The stave's horizontal extent is where most of its lines carry ink, so text
// sitting beside the stave does not stretch it.
function lineExtents (linesY, staffSpaceHeightPx, { width, height, grayscale }) {
  let xStart = width
  let xEnd = 0
  for (let x = 0; x < width; x++) {
    let linesWithInk = 0
    for (const line of linesY) {
      const y = Math.round(line)
      if (y >= 0 && y < height && grayscale[y * width + x] > 0.5) {
        linesWithInk++
      }
    }
    if (linesWithInk >= 3) {
      xStart = Math.min(xStart, x)
      xEnd = Math.max(xEnd, x)
    }
  }
  if (xStart > xEnd) {
    xStart = 0
    xEnd = width - 1
  }
  return { xStart, xEnd }
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default detectStaves
