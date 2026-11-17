'use strict'

import createParserScenarios from '#msq/language/parser/scenarios/createParserScenarios.js'
import registry from '../src/omr/coverage/index.js'
import auditFeatureCoverage from '../src/omr/coverage/auditFeatureCoverage.js'

const scenarioNames = Object.keys(createParserScenarios())
const report = auditFeatureCoverage(registry, scenarioNames)

console.log(`OMR coverage: ${report.assignedScenarioCount}/${report.scenarioCount} parser scenarios assigned to ${report.featureCount} features`)
console.log(`Feature observability: ${JSON.stringify(report.featureObservabilityCounts)}`)
console.log(`Nonvisual categories: ${JSON.stringify(report.nonvisualCategoryCounts)}`)
console.log(`Implementation status: ${JSON.stringify(report.implementationStatusCounts)}`)

if (report.unassignedScenarios.length > 0) {
  console.error('Unassigned parser scenarios:')
  report.unassignedScenarios.forEach((scenarioName) => console.error(`- ${scenarioName}`))
}
if (report.errors.length > 0) {
  console.error('Registry errors:')
  report.errors.forEach((error) => console.error(`- ${error}`))
}
if (report.unassignedScenarios.length > 0 || report.errors.length > 0) {
  process.exitCode = 1
}
