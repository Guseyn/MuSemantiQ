'use strict'

import { extractTitleSubtitleTextTrainingTargets } from '#msq/omr/training/text/extractTitleSubtitleTextTrainingTargets.js'
import { extractDynamicAndChordLetterTextTrainingTargets } from '#msq/omr/training/text/extractDynamicAndChordLetterTextTrainingTargets.js'

export function extractTextTrainingTargets (pageSchema) {
  return [
    ...extractTitleSubtitleTextTrainingTargets(pageSchema),
    ...extractDynamicAndChordLetterTextTrainingTargets(pageSchema)
  ]
}

export default extractTextTrainingTargets
