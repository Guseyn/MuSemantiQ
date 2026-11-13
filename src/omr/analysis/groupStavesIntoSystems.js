'use strict'

/**
 * Which staves play together.
 *
 * Staves that are close, and whose lines overlap horizontally, belong to one
 * system — one line of music on the page. When symbols can be classified, a
 * brace or bracket at the left edge will confirm this; until then spacing and
 * overlap say it.
 */

const MAX_GAP_IN_STAFF_SPACES = 2.5
const MIN_X_OVERLAP_FRACTION = 0.25

export function groupStavesIntoSystems (staves) {
  const systems = []
  for (const stave of [ ...staves ].sort((first, second) => first.topY - second.topY)) {
    const current = systems[systems.length - 1]
    if (current && belongsToSystem(stave, current)) {
      current.staves.push(stave)
      current.topY = Math.min(current.topY, stave.topY)
      current.bottomY = Math.max(current.bottomY, stave.bottomY)
      current.xStart = Math.min(current.xStart, stave.xStart)
      current.xEnd = Math.max(current.xEnd, stave.xEnd)
    } else {
      systems.push({
        staves: [ stave ],
        topY: stave.topY,
        bottomY: stave.bottomY,
        xStart: stave.xStart,
        xEnd: stave.xEnd
      })
    }
  }
  return systems.map((system, index) => ({
    index,
    staveIndexes: system.staves.map((stave) => staves.indexOf(stave)),
    topY: system.topY,
    bottomY: system.bottomY,
    xStart: system.xStart,
    xEnd: system.xEnd
  }))
}

function belongsToSystem (stave, system) {
  const lastStave = system.staves[system.staves.length - 1]
  const gap = stave.topY - lastStave.bottomY
  const staffSpace = (stave.staffSpaceHeightPx + lastStave.staffSpaceHeightPx) / 2
  const overlap = Math.min(stave.xEnd, system.xEnd) - Math.max(stave.xStart, system.xStart)
  const smallerWidth = Math.min(stave.xEnd - stave.xStart, system.xEnd - system.xStart)
  return gap <= MAX_GAP_IN_STAFF_SPACES * staffSpace &&
    overlap >= MIN_X_OVERLAP_FRACTION * smallerWidth
}

export default groupStavesIntoSystems
