'use strict'

export function extractDynamicAndChordLetterTextTrainingTargets (pageSchema) {
  const targets = []
  const measuresParams = pageSchema.measuresParams || []
  measuresParams.forEach((measureParams, measureIndex) => {
    const stavesParams = measureParams.stavesParams || []
    stavesParams.forEach((staveParams, staveIndex) => {
      const voicesParams = staveParams.voicesParams || []
      voicesParams.forEach((voiceParams, voiceIndex) => {
        voiceParams.forEach((unitParams, unitIndex) => {
          const articulationParams = unitParams.articulationParams || []
          articulationParams.forEach((articulation, articulationIndex) => {
            if (articulation.name === 'dynamicMark' && typeof articulation.textValue === 'string') {
              targets.push({
                targetType: 'dynamicMark',
                measureIndex,
                staveIndex,
                voiceIndex,
                unitIndex,
                articulationIndex,
                expectedText: articulation.textValue
              })
            }
          })
          if (unitParams.relatedChordLetter && typeof unitParams.relatedChordLetter.textValue === 'string') {
            targets.push({
              targetType: 'relatedChordLetter',
              measureIndex,
              staveIndex,
              voiceIndex,
              unitIndex,
              expectedText: unitParams.relatedChordLetter.textValue
            })
          }
        })
      })
    })
  })
  return targets
}

export default extractDynamicAndChordLetterTextTrainingTargets
