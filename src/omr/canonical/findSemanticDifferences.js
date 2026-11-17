'use strict'

export function findSemanticDifferences (expected, actual) {
  const differences = []
  collectDifferences(expected, actual, '$', differences)
  return differences
}

function collectDifferences (expected, actual, path, differences) {
  if (Object.is(expected, actual)) {
    return
  }
  if (!isObject(expected) || !isObject(actual) || Array.isArray(expected) !== Array.isArray(actual)) {
    differences.push({ path, expected, actual })
    return
  }
  if (Array.isArray(expected)) {
    const sharedLength = Math.min(expected.length, actual.length)
    for (let index = 0; index < sharedLength; index++) {
      collectDifferences(expected[index], actual[index], `${path}[${index}]`, differences)
    }
    for (let index = sharedLength; index < Math.max(expected.length, actual.length); index++) {
      differences.push({
        path: `${path}[${index}]`,
        expected: expected[index],
        actual: actual[index]
      })
    }
    return
  }

  const propertyNames = [ ...new Set([ ...Object.keys(expected), ...Object.keys(actual) ]) ].sort()
  for (const propertyName of propertyNames) {
    collectDifferences(
      expected[propertyName],
      actual[propertyName],
      appendProperty(path, propertyName),
      differences
    )
  }
}

function appendProperty (path, propertyName) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(propertyName)
    ? `${path}.${propertyName}`
    : `${path}[${JSON.stringify(propertyName)}]`
}

function isObject (value) {
  return value !== null && typeof value === 'object'
}

export default findSemanticDifferences
