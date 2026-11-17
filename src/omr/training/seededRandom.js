'use strict'

/**
 * Randomness that repeats: one seed, one sequence, everywhere.
 *
 * Training, weight init and data generation all depend on their draws being
 * reproducible; a plain Math.random would break the determinism contract.
 */

export function createSeededRandom (seed) {
  let state = seed >>> 0
  return function next () {
    // mulberry32 — small, well distributed, and stable across machines
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default createSeededRandom
