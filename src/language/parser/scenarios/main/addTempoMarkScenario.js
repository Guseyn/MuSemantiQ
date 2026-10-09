'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import parseTempoValueParts from '#msq/language/parser/scenarios/token/parseTempoValueParts.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'

export default function (scenarios) {
  scenarios['tempo mark'] = {
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        regexps.tempoOrMetronome.test(tokenValues) &&
        !regexps.markOrNote.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
      ) ||
      regexps.tempoMarkOrTempoNote.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'tempoMark', parserState)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['tempo mark text'] = {
    requiredCommandProgression: 'tempo mark',
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tempoMarkText.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const tempoValue = regexps.tempoMarkText.match(tokenValues)[0]
      lastMeasureParamsValue.tempoMark = {
        textValueParts: parseTempoValueParts(tempoValue)
      }
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['tempo mark vertical correction'] = {
    requiredCommandProgression: 'tempo mark',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.tempoMark.yCorrection = parseVerticalCorrection(tokenValues)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
