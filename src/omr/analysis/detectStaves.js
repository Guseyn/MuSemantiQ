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

const PEAK_THRESHOLD = 0.05
const SPACING_TOLERANCE = 0.25
const LINE_COVERAGE_MIN = 0.85
const ANTIALIASED_LINE_INK_THRESHOLD = 0.25

export function detectStaves ({ width, height, grayscale }) {
  const profile = rowInkProfile({ width, height, grayscale })
  const peaks = findPeakCandidates(profile)
    .filter((y) => lineCoverage({ width, height, grayscale }, y) >= LINE_COVERAGE_MIN)
  const lines = groupPeaksIntoStaves(peaks)
  const staves = lines.map((rawLines) => buildStave(rawLines, profile, { width, height, grayscale }))
  const referenceIntervalBetweenStaveLines = staves.length ? mean(staves.map((stave) => stave.intervalBetweenStaveLines)) : 0
  return { staves, referenceIntervalBetweenStaveLines }
}

// A staff line runs unbroken along its own ink; a row of letters, a dashed
// bracket or a row crossing scattered noteheads does not. Ink columns over
// the row's own extent separates them before any grouping starts — and
// keeps a short stave in a narrow system, because the extent is its own.
function lineCoverage ({ width, height, grayscale }, lineY) {
  let start = -1
  let end = -1
  let inked = 0
  for (let x = 0; x < width; x++) {
    let hasInk = false
    for (let offset = -1; offset <= 1; offset++) {
      const y = lineY + offset
      if (y >= 0 && y < height && grayscale[y * width + x] > ANTIALIASED_LINE_INK_THRESHOLD) {
        hasInk = true
        break
      }
    }
    if (hasInk) {
      if (start < 0) start = x
      end = x
      inked++
    }
  }
  return end > start ? inked / (end - start) : 0
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
  const spacing = mean(rawLines.slice(1).map((line, index) => line - rawLines[index]))
  const linesY = rawLines.map((line) => recenterLine(line, profile, Math.max(2, Math.round(spacing / 4))))
  const gaps = linesY.slice(1).map((line, index) => line - linesY[index])
  const intervalBetweenStaveLines = mean(gaps)
  const topY = linesY[0]
  const bottomY = linesY[4]
  const { xStart, xEnd } = lineExtents(linesY, intervalBetweenStaveLines, bitmap)
  const staveLineThickness = measureLineThickness(linesY, bitmap, xStart, xEnd)
  return { linesY, intervalBetweenStaveLines, staveLineThickness, topY, bottomY, xStart, xEnd }
}

function measureLineThickness (linesY, { width, height, grayscale }, xStart, xEnd) {
  const runs = []
  const samples = Math.max(5, Math.min(40, xEnd - xStart + 1))
  for (const line of linesY) {
    const centerY = Math.round(line)
    for (let sample = 0; sample < samples; sample++) {
      const x = Math.round(xStart + (xEnd - xStart) * sample / Math.max(1, samples - 1))
      let before = 0
      let after = 0
      while (centerY - before - 1 >= 0 && grayscale[(centerY - before - 1) * width + x] > 0.25) {
        before++
      }
      while (centerY + after + 1 < height && grayscale[(centerY + after + 1) * width + x] > 0.25) {
        after++
      }
      runs.push(before + after + 1)
    }
  }
  runs.sort((first, second) => first - second)
  return runs.length ? Math.max(1, runs[Math.floor(runs.length / 2)]) : 1
}

// Interpolated lines have no ink to re-centre on and keep their guess.
function recenterLine (line, profile, window) {
  const from = Math.max(0, Math.round(line) - window)
  const to = Math.min(profile.length - 1, Math.round(line) + window)
  let weighted = 0
  let total = 0
  for (let y = from; y <= to; y++) {
    weighted += y * profile[y]
    total += profile[y]
  }
  return total > 0 ? weighted / total : line
}

// Each staff line owns one long horizontal span. Their consensus excludes a
// brace at the left, while a slur or beam crossing the line cannot shorten it.
function lineExtents (linesY, intervalBetweenStaveLines, { width, height, grayscale }) {
  const runs = linesY.map((line) => horizontalSpan({ width, height, grayscale }, Math.round(line), 8 * intervalBetweenStaveLines))
  const starts = runs.map((run) => run.start)
  const ends = runs.map((run) => run.end)
  const xStart = Math.min(...starts)
  const xEnd = Math.max(...ends)
  if (!runs.length || xStart > xEnd) {
    return { xStart: 0, xEnd: width - 1 }
  }
  return { xStart, xEnd }
}

function horizontalSpan ({ width, height, grayscale }, lineY, minimumRunLength) {
  let best = { start: 0, end: -1, length: 0 }
  for (const offset of [ 0, -1, 1 ]) {
    const y = lineY + offset
    if (y < 0 || y >= height) {
      continue
    }
    let firstInk = -1
    let lastInk = -1
    let runStart = 0
    let longestStart = 0
    let longestLength = 0
    let firstValidStart = -1
    let lastValidEnd = -1
    for (let x = 0; x <= width; x++) {
      const ink = x < width && grayscale[y * width + x] > 0.25
      if (ink) {
        if (firstInk < 0) firstInk = x
        lastInk = x
      } else {
        const length = x - runStart
        if (length > longestLength) {
          longestStart = runStart
          longestLength = length
        }
        if (length >= minimumRunLength) {
          if (firstValidStart < 0) firstValidStart = runStart
          lastValidEnd = x - 1
        }
        runStart = x + 1
      }
    }
    if (lastInk - firstInk + 1 > best.length) {
      best = {
        start: firstValidStart >= 0 ? firstValidStart : longestStart,
        end: lastValidEnd >= 0 ? lastValidEnd : lastInk,
        length: lastInk - firstInk + 1
      }
    }
  }
  return best
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default detectStaves
