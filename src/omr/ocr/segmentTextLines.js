'use strict'

const INK_THRESHOLD = 0.25
const DEFAULT_INTERVAL_BETWEEN_STAVE_LINES = 12

/**
 * Text blocks become lines and classifier-ready character crops.
 *
 * Blank columns are the first boundary. A connected run is split only when it
 * is wider than the line's measured characters and has a low, pronounced
 * valley near an expected character boundary. A wide `m` or `w` therefore does
 * not become two characters merely because its profile has a local minimum.
 */
export function segmentTextLines (bitmap, textBlocks = [], { intervalBetweenStaveLines = DEFAULT_INTERVAL_BETWEEN_STAVE_LINES } = {}) {
  assertBitmap(bitmap)
  const interval = positiveNumber(intervalBetweenStaveLines, DEFAULT_INTERVAL_BETWEEN_STAVE_LINES)
  return textBlocks.flatMap((block, textBlockIndex) => {
    const box = clippedBox(bitmap, block.box)
    if (!box) {
      return [ rejectedLine(block, textBlockIndex, block.box) ]
    }
    const bands = findLineBands(bitmap, box, interval)
    if (!bands.length) {
      return [ rejectedLine(block, textBlockIndex, box) ]
    }
    return bands.map((band, lineIndex) => segmentLine(bitmap, block, band, {
      textBlockIndex,
      lineIndex,
      intervalBetweenStaveLines: interval
    }))
  })
}

function segmentLine (bitmap, block, box, location) {
  const profile = columnProfile(bitmap, box)
  const runs = inkRuns(profile)
  const typicalWidth = typicalCharacterWidth(runs, box.h)
  const candidates = []
  for (let runIndex = 0; runIndex < runs.length; runIndex++) {
    const run = runs[runIndex]
    if (runIndex > 0) {
      const previous = runs[runIndex - 1]
      const gap = run.start - previous.end - 1
      const spaceWidth = Math.max(2, 0.28 * location.intervalBetweenStaveLines, 0.35 * typicalWidth)
      if (gap >= spaceWidth) {
        candidates.push(spaceCandidate(bitmap, {
          x: box.x + previous.end + 1,
          y: box.y,
          w: gap,
          h: box.h
        }))
      }
    }
    const pieceRanges = splitTouchingRun(profile, run, typicalWidth, box.h)
    for (const piece of pieceRanges) {
      const candidate = inkCandidate(bitmap, box, piece)
      if (candidate) {
        candidates.push(candidate)
      }
    }
  }
  if (!candidates.some((candidate) => candidate.kind === 'character')) {
    return rejectedLine(block, location.textBlockIndex, box, location.lineIndex)
  }
  return {
    status: 'ready',
    role: block.role,
    textBlockIndex: location.textBlockIndex,
    lineIndex: location.lineIndex,
    box: { ...box },
    ...(block.target ? { target: { ...block.target } } : {}),
    candidates,
    segmentationUncertainties: []
  }
}

function findLineBands (bitmap, box, intervalBetweenStaveLines) {
  const rows = []
  for (let y = box.y; y < box.y + box.h; y++) {
    if (rowHasInk(bitmap, box, y)) {
      rows.push(y)
    }
  }
  if (!rows.length) {
    return []
  }
  const bands = []
  const rowGap = Math.max(1, Math.round(0.3 * intervalBetweenStaveLines))
  let firstY = rows[0]
  let lastY = rows[0]
  for (let index = 1; index < rows.length; index++) {
    const y = rows[index]
    if (y - lastY > rowGap) {
      bands.push(measureBand(bitmap, box, firstY, lastY))
      firstY = y
    }
    lastY = y
  }
  bands.push(measureBand(bitmap, box, firstY, lastY))
  return bands.filter(Boolean)
}

function measureBand (bitmap, box, firstY, lastY) {
  let minX = box.x + box.w
  let maxX = box.x - 1
  for (let y = firstY; y <= lastY; y++) {
    for (let x = box.x; x < box.x + box.w; x++) {
      if (isInk(bitmap, x, y)) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
      }
    }
  }
  if (maxX < minX) {
    return null
  }
  return {
    x: minX,
    y: firstY,
    w: maxX - minX + 1,
    h: lastY - firstY + 1
  }
}

function rowHasInk (bitmap, box, y) {
  for (let x = box.x; x < box.x + box.w; x++) {
    if (isInk(bitmap, x, y)) {
      return true
    }
  }
  return false
}

function columnProfile (bitmap, box) {
  const profile = new Float64Array(box.w)
  for (let column = 0; column < box.w; column++) {
    for (let y = box.y; y < box.y + box.h; y++) {
      const value = bitmap.grayscale[y * bitmap.width + box.x + column]
      if (value > INK_THRESHOLD) {
        profile[column] += value
      }
    }
  }
  return profile
}

function inkRuns (profile) {
  const runs = []
  let start = -1
  for (let column = 0; column <= profile.length; column++) {
    const hasInk = column < profile.length && profile[column] > 0
    if (hasInk && start < 0) {
      start = column
    }
    if (!hasInk && start >= 0) {
      runs.push({ start, end: column - 1 })
      start = -1
    }
  }
  return runs
}

function typicalCharacterWidth (runs, lineHeight) {
  const isolatedWidths = runs
    .map((run) => run.end - run.start + 1)
    .filter((width) => width <= 0.8 * lineHeight)
    .sort((first, second) => first - second)
  if (!isolatedWidths.length) {
    return Math.max(1, 0.55 * lineHeight)
  }
  const middle = Math.floor(isolatedWidths.length / 2)
  const median = isolatedWidths.length % 2
    ? isolatedWidths[middle]
    : (isolatedWidths[middle - 1] + isolatedWidths[middle]) / 2
  return Math.max(1, Math.min(lineHeight, median))
}

function splitTouchingRun (profile, run, typicalWidth, lineHeight) {
  const whole = [ { start: run.start, end: run.end } ]
  const width = run.end - run.start + 1
  const estimatedCount = Math.round(width / typicalWidth)
  const minimumPieceWidth = Math.max(1, Math.min(0.2 * lineHeight, 0.25 * typicalWidth))
  if (estimatedCount < 2 || width <= 1.4 * typicalWidth || width < 2 * minimumPieceWidth) {
    return whole
  }
  const valleys = touchingValleys(profile, run, lineHeight)
  if (!valleys.length) {
    return whole
  }
  const cuts = []
  for (let boundary = 1; boundary < estimatedCount; boundary++) {
    const ideal = run.start + boundary * width / estimatedCount - 0.5
    const previousCut = cuts.length ? cuts[cuts.length - 1] : run.start - 1
    const remainingBoundaries = estimatedCount - boundary
    const earliest = previousCut + minimumPieceWidth
    const latest = run.end - remainingBoundaries * minimumPieceWidth
    const possible = valleys
      .filter((valley) => valley.column >= earliest && valley.column <= latest && !cuts.includes(valley.column))
      .sort((first, second) => {
        const distance = Math.abs(first.column - ideal) - Math.abs(second.column - ideal)
        return distance || first.ratio - second.ratio || first.column - second.column
      })
    if (possible.length) {
      cuts.push(possible[0].column)
    }
  }
  if (!cuts.length) {
    return whole
  }
  cuts.sort((first, second) => first - second)
  const pieces = []
  let start = run.start
  for (const cut of cuts) {
    pieces.push({ start, end: cut })
    start = cut + 1
  }
  pieces.push({ start, end: run.end })
  return pieces
}

function touchingValleys (profile, run, lineHeight) {
  const valleys = []
  for (let column = run.start + 1; column < run.end; column++) {
    const value = profile[column]
    const isValley = (value <= profile[column - 1] && value < profile[column + 1]) ||
      (value < profile[column - 1] && value <= profile[column + 1])
    if (!isValley) {
      continue
    }
    let leftPeak = 0
    let rightPeak = 0
    for (let left = run.start; left < column; left++) {
      leftPeak = Math.max(leftPeak, profile[left])
    }
    for (let right = column + 1; right <= run.end; right++) {
      rightPeak = Math.max(rightPeak, profile[right])
    }
    const lowerPeak = Math.min(leftPeak, rightPeak)
    const ratio = lowerPeak ? value / lowerPeak : 1
    // A real joining stroke is both lower than its neighbouring strokes and
    // small in absolute terms; the inner diagonals of a wide glyph are not.
    if (ratio <= 0.55 && value <= Math.max(0.75, 0.18 * lineHeight)) {
      valleys.push({ column, ratio })
    }
  }
  return valleys
}

function inkCandidate (bitmap, lineBox, range) {
  let minY = lineBox.y + lineBox.h
  let maxY = lineBox.y - 1
  const x = lineBox.x + range.start
  const w = range.end - range.start + 1
  for (let y = lineBox.y; y < lineBox.y + lineBox.h; y++) {
    for (let column = 0; column < w; column++) {
      if (isInk(bitmap, x + column, y)) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (maxY < minY) {
    return null
  }
  const box = { x, y: minY, w, h: maxY - minY + 1 }
  return {
    kind: 'character',
    box,
    sourcePixels: crop(bitmap, box)
  }
}

function spaceCandidate (bitmap, box) {
  return {
    kind: 'space',
    character: ' ',
    box: { ...box },
    sourcePixels: crop(bitmap, box)
  }
}

function crop (bitmap, box) {
  const grayscale = new Float64Array(box.w * box.h)
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      grayscale[y * box.w + x] = bitmap.grayscale[(box.y + y) * bitmap.width + box.x + x]
    }
  }
  return { width: box.w, height: box.h, grayscale }
}

function rejectedLine (block, textBlockIndex, box, lineIndex = 0) {
  const locatedBox = box && Number.isFinite(box.x) && Number.isFinite(box.y)
    ? { x: box.x, y: box.y, w: Math.max(0, box.w || 0), h: Math.max(0, box.h || 0) }
    : { x: 0, y: 0, w: 0, h: 0 }
  return {
    status: 'rejected',
    role: block.role,
    textBlockIndex,
    lineIndex,
    box: locatedBox,
    ...(block.target ? { target: { ...block.target } } : {}),
    candidates: [],
    segmentationUncertainties: [ {
      box: { ...locatedBox },
      reason: 'no-readable-ink'
    } ]
  }
}

function clippedBox (bitmap, box) {
  if (!box || ![ box.x, box.y, box.w, box.h ].every(Number.isFinite) || box.w <= 0 || box.h <= 0) {
    return null
  }
  const x = Math.max(0, Math.floor(box.x))
  const y = Math.max(0, Math.floor(box.y))
  const right = Math.min(bitmap.width, Math.ceil(box.x + box.w))
  const bottom = Math.min(bitmap.height, Math.ceil(box.y + box.h))
  return right > x && bottom > y ? { x, y, w: right - x, h: bottom - y } : null
}

function isInk (bitmap, x, y) {
  return bitmap.grayscale[y * bitmap.width + x] > INK_THRESHOLD
}

function positiveNumber (value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function assertBitmap (bitmap) {
  if (!bitmap || !Number.isInteger(bitmap.width) || !Number.isInteger(bitmap.height) ||
    bitmap.width <= 0 || bitmap.height <= 0 || !bitmap.grayscale ||
    bitmap.grayscale.length < bitmap.width * bitmap.height) {
    throw new TypeError('segmentTextLines needs a bitmap with width, height and grayscale pixels')
  }
}

export default segmentTextLines
