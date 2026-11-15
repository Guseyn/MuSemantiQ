'use strict'

import { createSeededRandom } from '#msq/omr/training/seededRandom.js'
import deriveFullPageSeed from '#msq/omr/training/fullPage/deriveFullPageSeed.js'

const splitNames = [ 'train', 'validation', 'test' ]

// A composition has one split before any of its pages or variants are rendered
export function assignFullPageCompositionSplits ({
  sourceRecords,
  seed = 1,
  splitRatios = { train: 0.8, validation: 0.1, test: 0.1 },
  splitByCompositionId = {}
} = {}) {
  if (!Array.isArray(sourceRecords)) {
    throw new Error('sourceRecords must be an array')
  }
  const ratios = normalizedRatios(splitRatios)
  const overrides = splitOverrides(splitByCompositionId)
  const explicitSplits = new Map()
  const compositionIds = new Set()

  for (const [ sourceRecordIndex, record ] of sourceRecords.entries()) {
    if (!record || typeof record.compositionId !== 'string' || !record.compositionId.trim()) {
      throw new Error(`sourceRecords[${sourceRecordIndex}].compositionId must be a non-empty string`)
    }
    const compositionId = record.compositionId
    compositionIds.add(compositionId)
    if (record.split !== undefined) {
      assertSplit(record.split, `sourceRecords[${sourceRecordIndex}].split`)
      const previousSplit = explicitSplits.get(compositionId)
      if (previousSplit && previousSplit !== record.split) {
        throw new Error(`Composition ${compositionId} has conflicting source splits`)
      }
      explicitSplits.set(compositionId, record.split)
    }
  }

  for (const [ compositionId, split ] of overrides) {
    const sourceSplit = explicitSplits.get(compositionId)
    if (sourceSplit && sourceSplit !== split) {
      throw new Error(`Composition ${compositionId} has conflicting split assignments`)
    }
  }

  const assignments = new Map()
  for (const compositionId of [ ...compositionIds ].sort()) {
    const split = overrides.get(compositionId) || explicitSplits.get(compositionId) || drawSplit(compositionId, seed, ratios)
    assignments.set(compositionId, split)
  }
  return assignments
}

function normalizedRatios (splitRatios) {
  if (!splitRatios || typeof splitRatios !== 'object') {
    throw new Error('splitRatios must be an object')
  }
  const ratios = splitNames.map((name) => {
    const value = splitRatios[name] ?? 0
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`splitRatios.${name} must be a non-negative finite number`)
    }
    return value
  })
  const total = ratios.reduce((sum, value) => sum + value, 0)
  if (total <= 0) {
    throw new Error('At least one split ratio must be positive')
  }
  return ratios.map(value => value / total)
}

function splitOverrides (value) {
  const entries = value instanceof Map ? [ ...value ] : Object.entries(value || {})
  const overrides = new Map()
  for (const [ compositionId, split ] of entries) {
    assertSplit(split, `Split for ${compositionId}`)
    overrides.set(compositionId, split)
  }
  return overrides
}

function assertSplit (split, name) {
  if (!splitNames.includes(split)) {
    throw new Error(`${name} must be train, validation or test`)
  }
}

function drawSplit (compositionId, seed, ratios) {
  const splitSeed = deriveFullPageSeed(seed, 'composition-split', compositionId)
  const value = createSeededRandom(splitSeed)()
  if (value < ratios[0]) {
    return 'train'
  }
  if (value < ratios[0] + ratios[1]) {
    return 'validation'
  }
  return 'test'
}

export default assignFullPageCompositionSplits
