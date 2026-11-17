'use strict'

import findSemanticDifferences from '#msq/omr/canonical/findSemanticDifferences.js'

const excluded = new Set([ 'defaultInstrument', 'defaultTempo', 'fermataDuration' ])

export function compareVisibleCustomStyles (expected = {}, actual = {}, { numericTolerance = 0 } = {}) {
  const expectedVisible = visible(expected)
  const actualVisible = visible(actual)
  const differences = findSemanticDifferences(expectedVisible, actualVisible)
  return {
    equal: differences.every((difference) => withinNumericTolerance(difference, expectedVisible, actualVisible, numericTolerance)),
    differences: differences.filter((difference) => !withinNumericTolerance(difference, expectedVisible, actualVisible, numericTolerance))
  }
}

function visible (styles) {
  return Object.fromEntries(Object.entries(styles || {})
    .filter(([ key, value ]) => !excluded.has(key) && value !== null && value !== undefined && typeof value !== 'object')
    .sort(([ first ], [ second ]) => first.localeCompare(second)))
}

function withinNumericTolerance (difference, expected, actual, tolerance) {
  if (!tolerance || typeof difference.expected !== 'number' || typeof difference.actual !== 'number') {
    return false
  }
  const path = difference.path.slice(2)
  return Object.hasOwn(expected, path) && Object.hasOwn(actual, path) && Math.abs(difference.expected - difference.actual) <= tolerance
}

export default compareVisibleCustomStyles
