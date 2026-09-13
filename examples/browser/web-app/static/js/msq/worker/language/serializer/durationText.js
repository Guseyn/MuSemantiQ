'use strict'

/**
 * Durations, written the way the language writes them.
 *
 * The schema keeps a unit's base duration as a number and counts its dots
 * separately, so the two are turned back into text independently: `1/4` and
 * `dotted` rather than one dotted-quarter value.
 */

const DURATIONS = [
  [ 4, '4' ],
  [ 2, '2' ],
  [ 1, '1' ],
  [ 0.5, '1/2' ],
  [ 0.25, '1/4' ],
  [ 0.125, '1/8' ],
  [ 0.0625, '1/16' ],
  [ 0.03125, '1/32' ],
  [ 0.015625, '1/64' ],
  [ 0.0078125, '1/128' ],
  [ 0.00390625, '1/256' ]
]

/**
 * The written form of a base duration, or null for one the language has no
 * word for — which should not happen, since the parser only ever produces these.
 */
export function durationText(unitDuration) {
  const found = DURATIONS.find(([ value ]) => Math.abs(value - unitDuration) < 1e-9)
  return found ? found[1] : null
}

/**
 * How a unit's dots are written: one is `dotted`, more are counted out.
 */
export function dotsText(numberOfDots) {
  if (!numberOfDots) {
    return null
  }
  if (numberOfDots === 1) {
    return 'dotted'
  }
  const counts = { 2: 'two', 3: 'three', 4: 'four' }
  return `with ${counts[numberOfDots] || numberOfDots} dots`
}

export default durationText
