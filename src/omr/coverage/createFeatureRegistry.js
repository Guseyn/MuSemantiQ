'use strict'

export default function (featureDefinitions, implementationStatuses = {}) {
  return {
    name: 'msq-omr-feature-coverage',
    version: 1,
    defaultImplementationStatus: 'unsupported',
    implementationStatuses: [ 'unsupported', 'partial', 'supported' ],
    observabilityValues: [ 'visual', 'layout', 'ambiguous', 'nonvisual' ],
    nonvisualCategories: [ 'source-only', 'playback', 'rendering-configuration', 'parser-control', 'parser-diagnostic' ],
    features: featureDefinitions.map((feature) => ({
      ...feature,
      scenarios: {
        exact: [ ...(feature.scenarios.exact || []) ],
        patterns: [ ...(feature.scenarios.patterns || []) ]
      },
      schema: (feature.schema || []).map((schemaPath) => ({ ...schemaPath })),
      implementation: {
        ...(feature.implementation || {}),
        status: feature.implementation?.status || implementationStatuses[feature.id] || 'unsupported'
      }
    }))
  }
}
