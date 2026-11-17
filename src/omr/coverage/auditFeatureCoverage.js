'use strict'

function increment (counts, key) {
  counts[key] = (counts[key] || 0) + 1
}

export default function (registry, scenarioNames) {
  const errors = []
  const sortedScenarioNames = [ ...new Set(scenarioNames) ].sort()
  const scenarioNameSet = new Set(sortedScenarioNames)
  const featureIds = new Set()
  const compiledFeatures = registry.features.map((feature) => {
    if (featureIds.has(feature.id)) {
      errors.push(`duplicate feature id: ${feature.id}`)
    }
    featureIds.add(feature.id)
    if (!registry.observabilityValues.includes(feature.observability)) {
      errors.push(`${feature.id}: invalid observability '${feature.observability}'`)
    }
    if (feature.observability === 'nonvisual' && !registry.nonvisualCategories.includes(feature.nonvisualCategory)) {
      errors.push(`${feature.id}: nonvisual feature needs an explicit known nonvisualCategory`)
    }
    if (feature.observability !== 'nonvisual' && feature.nonvisualCategory !== undefined) {
      errors.push(`${feature.id}: nonvisualCategory is only valid for nonvisual features`)
    }
    if (!registry.implementationStatuses.includes(feature.implementation?.status)) {
      errors.push(`${feature.id}: invalid implementation status`)
    }
    for (const exactScenarioName of feature.scenarios.exact) {
      if (!scenarioNameSet.has(exactScenarioName)) {
        errors.push(`${feature.id}: unknown exact scenario '${exactScenarioName}'`)
      }
    }
    const patterns = feature.scenarios.patterns.map((pattern) => {
      try {
        return new RegExp(pattern)
      } catch (error) {
        errors.push(`${feature.id}: invalid scenario pattern '${pattern}': ${error.message}`)
        return null
      }
    }).filter(Boolean)
    return { feature, patterns }
  })

  const assignments = {}
  const matchedFeatureIds = new Set()
  const unassignedScenarios = []
  for (const scenarioName of sortedScenarioNames) {
    const matchedFeatures = compiledFeatures.filter(({ feature, patterns }) => {
      return feature.scenarios.exact.includes(scenarioName) || patterns.some((pattern) => pattern.test(scenarioName))
    })
    const matchedIds = matchedFeatures.map(({ feature }) => feature.id).sort()
    assignments[scenarioName] = matchedIds
    matchedIds.forEach((featureId) => matchedFeatureIds.add(featureId))
    if (matchedIds.length === 0) {
      unassignedScenarios.push(scenarioName)
    }
  }

  const unmatchedFeatures = registry.features.map((feature) => feature.id).filter((featureId) => !matchedFeatureIds.has(featureId)).sort()
  for (const featureId of unmatchedFeatures) {
    errors.push(`feature matches no parser scenario: ${featureId}`)
  }

  const featureObservabilityCounts = {}
  const nonvisualCategoryCounts = {}
  const implementationStatusCounts = {}
  for (const feature of registry.features) {
    increment(featureObservabilityCounts, feature.observability)
    increment(implementationStatusCounts, feature.implementation.status)
    if (feature.observability === 'nonvisual') {
      increment(nonvisualCategoryCounts, feature.nonvisualCategory)
    }
  }

  return {
    scenarioCount: sortedScenarioNames.length,
    featureCount: registry.features.length,
    assignedScenarioCount: sortedScenarioNames.length - unassignedScenarios.length,
    unassignedScenarios,
    unmatchedFeatures,
    assignments,
    featureObservabilityCounts,
    nonvisualCategoryCounts,
    implementationStatusCounts,
    errors: errors.sort()
  }
}
