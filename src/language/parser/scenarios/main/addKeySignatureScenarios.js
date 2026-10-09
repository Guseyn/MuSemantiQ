'use strict'

import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import findKeySignatureThatUserMeant from '#msq/language/parser/scenarios/page-schema/findKeySignatureThatUserMeant.js'

export default function (scenarios) {
  scenarios['key signature'] = {
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.keySignature.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'keySignatureName', parserState)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['key signature name'] = {
    requiredCommandProgression: 'key signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.keySignatureName.test(tokenValues) &&
      !regexps.to.test(
        [
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ]
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const keySignatureName = regexps.keySignatureName.match(tokenValues)[0]
      if (parserState.lastKeySignatureName) {
        lastMeasureParamsValue.keySignatureNameForEachLineId = undefined
        parserState.lastKeySignatureName = undefined
        parserState.lastKeySignatureNameForEachLineId += 1
      }
      lastMeasureParamsValue.keySignatureName = findKeySignatureThatUserMeant(keySignatureName)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['key signature for each line'] = {
    requiredCommandProgression: 'key signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forEachLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      parserState.lastKeySignatureName = lastMeasureParamsValue.keySignatureName
      lastMeasureParamsValue.keySignatureNameForEachLineId = parserState.lastKeySignatureNameForEachLineId
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['key signature for lines below'] = {
    requiredCommandProgression: 'key signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forLinesBelow.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      parserState.lastKeySignatureName = lastMeasureParamsValue.keySignatureName
      lastMeasureParamsValue.keySignatureNameForEachLineId = parserState.lastKeySignatureNameForEachLineId
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
