'use strict'

/**
 * Heads at the same x are one chord.
 *
 * A chord is one unit with several notes, and engraving puts its heads on one
 * vertical — so heads within a third of a staff space of each other are one
 * unit. Each unit keeps its x, which is what orders it in the measure.
 */

const MAX_HORIZONTAL_DISTANCE_IN_STAFF_SPACES = 0.3

export function groupChordsByHorizontalProximity (headBlobs, staffSpaceHeightPx) {
  const tolerance = MAX_HORIZONTAL_DISTANCE_IN_STAFF_SPACES * staffSpaceHeightPx
  const sorted = [ ...headBlobs ].sort((first, second) => centerX(first) - centerX(second))
  const units = []
  for (const head of sorted) {
    const current = units[units.length - 1]
    if (current && Math.abs(centerX(head) - current.x) <= tolerance) {
      current.heads.push(head)
    } else {
      units.push({ x: centerX(head), heads: [ head ] })
    }
  }
  return units
}

function centerX (blob) {
  return blob.box.x + blob.box.w / 2
}

export default groupChordsByHorizontalProximity
