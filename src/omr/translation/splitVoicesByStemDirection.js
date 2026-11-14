'use strict'

/**
 * Opposing stems suggest two voices only when their onsets coincide.
 *
 * Stem direction alone is engraving, not polyphony. Rests stay in the first
 * voice and never create a second one by themselves.
 */

export function splitVoicesByStemDirection (units, staffSpaceHeightPx = 12) {
  const notes = units.filter((unit) => !unit.isRest)
  const stemsUp = notes.filter((unit) => unit.stemDirection === 'up')
  const stemsDown = notes.filter((unit) => unit.stemDirection === 'down')
  const simultaneous = stemsUp.some((up) => stemsDown.some((down) =>
    Math.abs(up.x - down.x) <= 0.35 * staffSpaceHeightPx))
  if (!simultaneous) {
    return [ units ]
  }
  return [
    units.filter((unit) => unit.isRest || unit.stemDirection === 'up'),
    units.filter((unit) => !unit.isRest && unit.stemDirection === 'down')
  ]
}

export default splitVoicesByStemDirection
