'use strict'

import normalizePageSchemaForVisibleComparison from '#msq/omr/canonical/normalizePageSchemaForVisibleComparison.js'
import findSemanticDifferences from '#msq/omr/canonical/findSemanticDifferences.js'

export function compareVisiblePageSchemas (expectedPageSchema, actualPageSchema) {
  const differences = findSemanticDifferences(
    normalizePageSchemaForVisibleComparison(expectedPageSchema),
    normalizePageSchemaForVisibleComparison(actualPageSchema)
  )
  return {
    equal: differences.length === 0,
    differences
  }
}

export default compareVisiblePageSchemas
