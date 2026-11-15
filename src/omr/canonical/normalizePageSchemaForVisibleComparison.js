'use strict'

import pageSchemaDefinition from '#msq/language/schema/pageSchema.js'

const measureDefinition = pageSchemaDefinition.properties.measuresParams.items
const unitDefinition = measureDefinition.properties.stavesParams.items.properties.voicesParams.items.items
// These visible parser fields predate the declarative schema; naming them keeps the allowlist closed to renderer state
const additionalVisibleProperties = new Map([
  [ measureDefinition.properties.timeSignatureParams, [ 'crossed', 'forEachLineId' ] ],
  [ unitDefinition, [ 'simileCountDown', 'simileRefId', 'simileYCorrection' ] ],
  [ unitDefinition.properties.pedalMark, [ 'afterUnit', 'beforeUnit' ] ]
])

export function normalizePageSchemaForVisibleComparison (pageSchema) {
  return normalizeVisibleValue(pageSchema, pageSchemaDefinition)
}

function normalizeVisibleValue (value, definition) {
  if (value === undefined || value === null) {
    return value
  }
  if (Array.isArray(value)) {
    // Measures, staves, voices, units and marks are ordered notation, so only object keys are canonicalized
    return value.map(item => normalizeVisibleValue(item, definition.items || {}))
  }
  if (typeof value !== 'object') {
    return Object.is(value, -0) ? 0 : value
  }

  const declaredProperties = definition.properties || {}
  const propertyNames = [
    ...Object.keys(declaredProperties),
    ...(additionalVisibleProperties.get(definition) || [])
  ].sort()
  const normalized = {}

  for (const propertyName of propertyNames) {
    // Note, accidental and parentheses ids only name editor references; they do not change the engraved notation
    if (propertyName === 'id' || !Object.prototype.hasOwnProperty.call(value, propertyName)) {
      continue
    }
    const normalizedValue = normalizeVisibleValue(value[propertyName], declaredProperties[propertyName] || {})
    if (normalizedValue !== undefined) {
      normalized[propertyName] = normalizedValue
    }
  }
  return normalized
}

export default normalizePageSchemaForVisibleComparison
