'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll from '#msq/language/parser/scenarios/page-schema/initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import getLastStaveParams from '#msq/language/parser/scenarios/page-schema/getLastStaveParams.js'

export default function (scenarios) {
  scenarios['voice'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.firstOnTheLine &&
        regexps.voice.test(
          [ currentToken.value ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'stavesParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      initNewStaveParamsIfThereIsAlreadySuchStavePropertyOrNoStavesAtAll(lastMeasureParamsValue, 'voicesParams', parserState)
      const lastStaveParamsValue = getLastStaveParams(lastMeasureParamsValue)
      lastStaveParamsValue.voicesParams = lastStaveParamsValue.voicesParams || []
      lastStaveParamsValue.voicesParams.push([])
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      const numberOfStaves = lastMeasureParamsValue.stavesParams.length
      const numberOfVoices = lastStaveParamsValue.voicesParams.length
      return { numberOfMeasures, numberOfStaves, numberOfVoices }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
}
