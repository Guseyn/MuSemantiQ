'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'

export function centerX (symbol) {
  return symbol.box.x + (symbol.box.w - 1) / 2
}

export function rightX (symbol) {
  return symbol.box.x + symbol.box.w - 1
}

export function centerY (symbol) {
  return symbol.box.y + (symbol.box.h - 1) / 2
}

export function bottomY (symbol) {
  return symbol.box.y + symbol.box.h - 1
}

export function addSourceBlobs (target, sources) {
  const additions = sources.flat().filter(Boolean)
  target.sourceBlobs = [ ...new Set([ ...(target.sourceBlobs || []), ...additions ]) ]
}

export function unitEntries (measures, staveIndex, { notesOnly = false } = {}) {
  return measures.flatMap((measure) => measure.staves
    .filter((stave) => stave.staveIndex === staveIndex)
    .flatMap((stave) => stave.voices.flatMap((voice, voiceIndex) => voice
      .map((unit, unitIndex) => ({ unit, measure, stave, voiceIndex, unitIndex }))
      .filter((entry) => Number.isFinite(entry.unit.x) && (!notesOnly || !entry.unit.isRest)))))
}

export function unitX (unit) {
  if (unit.isRest) {
    const rest = (unit.sourceBlobs || []).find((blob) => roleOf(blob.className) === 'rest')
    if (rest) {
      return centerX(rest)
    }
  }
  return unit.x
}

export function unitY (unit) {
  const bodies = (unit.sourceBlobs || []).filter((blob) => [ 'head', 'rest' ].includes(roleOf(blob.className)))
  if (!bodies.length) {
    return null
  }
  return bodies.reduce((sum, blob) => sum + centerY(blob), 0) / bodies.length
}

export function nearestUnit (entries, x, tolerance = Infinity) {
  return entries
    .map((entry) => ({ entry, distance: Math.abs(unitX(entry.unit) - x) }))
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((first, second) => first.distance - second.distance)[0]?.entry || null
}

// A span may cross measures, but it may not jump from one voice to another.
export function spanEndpoints (entries, leftX, rightX, tolerance) {
  const left = nearestUnit(entries, leftX, tolerance)
  if (!left) {
    return null
  }
  const leftIndex = entries.indexOf(left)
  const right = nearestUnit(entries.filter((entry, index) =>
    index >= leftIndex && entry.voiceIndex === left.voiceIndex), rightX, tolerance)
  if (!right) {
    return null
  }
  const rightIndex = entries.indexOf(right)
  const spanned = entries.slice(leftIndex, rightIndex + 1)
    .filter((entry) => entry.voiceIndex === left.voiceIndex)
  return { left, right, spanned }
}

export function internalBarLines (barLines, systemIndex) {
  return barLines.filter((barLine) => (barLine.systemIndex ?? 0) === systemIndex &&
    (barLine.kind === undefined || barLine.kind === 'internal'))
    .sort((first, second) => first.x - second.x)
}

export function measureBounds (measure, staveIndex, staves, barLines, measures) {
  const stave = staves[staveIndex]
  const systemMeasures = measures.filter((candidate) => (candidate.systemIndex ?? 0) === (measure.systemIndex ?? 0))
  const localIndex = systemMeasures.indexOf(measure)
  const internal = internalBarLines(barLines, measure.systemIndex ?? 0)
  return {
    left: localIndex > 0 ? internal[localIndex - 1]?.x ?? stave.xStart : stave.xStart,
    right: localIndex >= 0 && localIndex < internal.length ? internal[localIndex].x : stave.xEnd
  }
}

export function measureLocation (blob, measures, staves, barLines) {
  if (blob.staveIndex === null || blob.staveIndex === undefined) {
    return null
  }
  const systemIndex = staves[blob.staveIndex]?.systemIndex ?? 0
  const candidates = measures.filter((measure) => (measure.systemIndex ?? 0) === systemIndex)
    .map((measure) => ({ measure, ...measureBounds(measure, blob.staveIndex, staves, barLines, measures) }))
  const x = centerX(blob)
  return candidates.find((location) => x >= location.left && x <= location.right) || null
}

export function hasExplicitUnits (measure) {
  return measure.staves.some((stave) => stave.voices.some((voice) => voice.some((unit) =>
    (unit.sourceBlobs || []).some((blob) => [ 'head', 'rest' ].includes(roleOf(blob.className))))))
}

export function removeGeneratedUnits (measure) {
  for (const stave of measure.staves) {
    stave.voices = stave.voices.map((voice) => voice.filter((unit) =>
      (unit.sourceBlobs || []).some((blob) => [ 'head', 'rest' ].includes(roleOf(blob.className)))))
  }
}
