'use strict'

export default function (scenario, requiredCommandProgression) {
  if (!scenario) {
    throw new Error('scenario does not exist')
  }
  const scenarioCopy = Object.assign({}, scenario)
  scenarioCopy.requiredCommandProgression = requiredCommandProgression
  return scenarioCopy
}
