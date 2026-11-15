'use strict'

export function extractTitleSubtitleTextTrainingTargets (pageSchema) {
  const targets = []
  for (const targetType of [ 'title', 'subtitle' ]) {
    if (typeof pageSchema[targetType] === 'string') {
      targets.push({
        targetType,
        expectedText: pageSchema[targetType]
      })
    }
  }
  return targets
}

export default extractTitleSubtitleTextTrainingTargets
