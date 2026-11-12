'use strict'

/**
 * What the measure does not fill, becomes rests.
 *
 * Durations add up to the measure; whatever is missing at the end is silence,
 * written as the fewest rests that fit (a half, then a quarter, and so on).
 * A voice with nothing at all gets one rest for the whole measure. Rests that
 * were drawn in the score arrive already classified — this only fills the
 * gaps nobody drew.
 */

const REST_DURATIONS = [ 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625 ]

export function fillRestsInMeasures (voices, measureDuration) {
  return voices.map((voice) => {
    const filled = [ ...voice ]
    const total = filled.reduce((sum, unit) => sum + soundingDuration(unit), 0)
    let missing = measureDuration - total
    while (missing > 1e-9) {
      const duration = REST_DURATIONS.find((candidate) => candidate <= missing + 1e-9) || 0.015625
      filled.push({
        x: Infinity,
        notes: [],
        isRest: true,
        restPosition: 2,
        unitDuration: duration,
        numberOfDots: 0,
        stemDirection: 'up',
        beamedWithNext: false
      })
      missing -= duration
    }
    return filled
  })
}

function soundingDuration (unit) {
  const dotFactor = 2 - 1 / 2 ** (unit.numberOfDots || 0)
  return unit.unitDuration * dotFactor
}

export default fillRestsInMeasures
