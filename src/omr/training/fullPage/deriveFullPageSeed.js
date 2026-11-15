'use strict'

// Independent seeds let callers change mutation draws without moving composition splits
export function deriveFullPageSeed (seed = 1, ...parts) {
  if (!Number.isSafeInteger(seed)) {
    throw new Error('seed must be a safe integer')
  }
  let hash = (seed >>> 0) ^ 0x811C9DC5
  for (const part of parts) {
    const text = String(part)
    for (let index = 0; index < text.length; index++) {
      hash ^= text.charCodeAt(index)
      hash = Math.imul(hash, 0x01000193)
    }
    hash ^= 0xFF
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7FEB352D)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846CA68B)
  hash ^= hash >>> 16
  return hash >>> 0
}

export default deriveFullPageSeed
