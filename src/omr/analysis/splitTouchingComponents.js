'use strict'

/**
 * Two symbols that touch, pulled apart.
 *
 * A head against a stem, two heads sharing an edge — flood fill sees one blob.
 * The blob's column profile is the map: every symbol leaves one peak in it,
 * and the low point between two peaks is where they meet. Split there, one
 * pass — no re-profiling of the pieces, so a piece's edges can never pose as
 * valleys. Wide, flat blobs (beams, ties) have no qualifying dip and stay
 * whole.
 */

const VALLEY_FRACTION_OF_PEAK = 0.85
const WIDE_ENOUGH_TO_SPLIT = 1.15

export function splitTouchingComponents ({ width, height, grayscale }, components) {
  const split = []
  for (const component of components) {
    split.push(...splitComponent({ width, height, grayscale }, component))
  }
  return split
}

function splitComponent (bitmap, component) {
  const { box } = component
  if (box.w <= box.h * WIDE_ENOUGH_TO_SPLIT) {
    return [ component ]
  }
  const profile = smooth(columnProfile(bitmap, box))
  const peaks = findPeaks(profile)
  const splitAfter = []
  for (let pair = 1; pair < peaks.length; pair++) {
    const between = argmin(profile, peaks[pair - 1], peaks[pair])
    const lowerPeak = Math.min(profile[peaks[pair - 1]], profile[peaks[pair]])
    if (between > 0 && between < profile.length - 1 && profile[between] < VALLEY_FRACTION_OF_PEAK * lowerPeak) {
      splitAfter.push(between)
    }
  }
  if (!splitAfter.length) {
    return [ component ]
  }
  const pieces = []
  let start = 0
  for (const boundary of [ ...splitAfter, profile.length - 1 ]) {
    pieces.push({
      box: { x: box.x + start, y: box.y, w: boundary - start + 1, h: box.h },
      ink: component.ink
    })
    start = boundary + 1
  }
  return pieces.filter((piece) => piece.box.w > 0)
}

function columnProfile ({ width, grayscale }, box) {
  const profile = new Float64Array(box.w)
  for (let column = 0; column < box.w; column++) {
    let ink = 0
    for (let y = box.y; y < box.y + box.h; y++) {
      ink += grayscale[y * width + box.x + column]
    }
    profile[column] = ink
  }
  return profile
}

function smooth (profile) {
  const smoothed = new Float64Array(profile.length)
  for (let column = 0; column < profile.length; column++) {
    const before = profile[Math.max(0, column - 1)]
    const after = profile[Math.min(profile.length - 1, column + 1)]
    smoothed[column] = 0.25 * before + 0.5 * profile[column] + 0.25 * after
  }
  return smoothed
}

// One peak per symbol: a local maximum, with flat tops taken once.
function findPeaks (profile) {
  const peaks = []
  for (let column = 1; column < profile.length - 1; column++) {
    const isPeak = profile[column] > profile[column - 1] && profile[column] >= profile[column + 1]
    if (isPeak) {
      peaks.push(column)
    }
  }
  return peaks
}

function argmin (profile, from, to) {
  let best = from
  for (let column = from + 1; column <= to; column++) {
    if (profile[column] < profile[best]) {
      best = column
    }
  }
  return best
}

export default splitTouchingComponents
