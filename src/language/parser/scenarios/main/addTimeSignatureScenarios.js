'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'

export default function (scenarios) {
  scenarios['time signature'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.timeSignature.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'timeSignatureParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      if (parserState.lastTimeSignatureParams) {
        lastMeasureParamsValue.lastTimeSignatureParams = undefined
        parserState.lastTimeSignatureParams = undefined
      }
      lastMeasureParamsValue.timeSignatureParams = {}
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['time signature value'] = {
    requiredCommandProgression: 'time signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.timeSignatureValue.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const timeSignature = regexps.timeSignatureValue.match(tokenValues)
      if (timeSignature[0] === 'c') {
        lastMeasureParamsValue.timeSignatureParams.numerator = '4'
        lastMeasureParamsValue.timeSignatureParams.denominator = '4'
        lastMeasureParamsValue.timeSignatureParams.cMode = true
      } else if (timeSignature[0] === 'crossed c') {
        lastMeasureParamsValue.timeSignatureParams.numerator = '2'
        lastMeasureParamsValue.timeSignatureParams.denominator = '2'
        lastMeasureParamsValue.timeSignatureParams.cMode = true
      } else {
        const numerator = timeSignature[0]
        const denominator = timeSignature[1]
        lastMeasureParamsValue.timeSignatureParams.numerator = numerator
        lastMeasureParamsValue.timeSignatureParams.denominator = denominator
      }
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['time signature for each line'] = {
    requiredCommandProgression: 'time signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forEachLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastTimeSignatureParamsValue = getLastMeasureParams(parserState.pageSchema).timeSignatureParams
      lastTimeSignatureParamsValue.forEachLineId = parserState.lastTimeSignatureValueForEachLineId
      parserState.lastTimeSignatureParams = lastTimeSignatureParamsValue
      const lastTimeSignatureValueForEachLineId = parserState.lastTimeSignatureValueForEachLineId
      parserState.lastTimeSignatureValueForEachLineId += 1
      return { lastTimeSignatureValueForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['time signature for lines below'] = {
    requiredCommandProgression: 'time signature',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forLinesBelow.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastTimeSignatureParamsValue = getLastMeasureParams(parserState.pageSchema).timeSignatureParams
      lastTimeSignatureParamsValue.forEachLineId = parserState.lastTimeSignatureValueForEachLineId
      parserState.lastTimeSignatureParams = lastTimeSignatureParamsValue
      const lastTimeSignatureValueForEachLineId = parserState.lastTimeSignatureValueForEachLineId
      parserState.lastTimeSignatureValueForEachLineId += 1
      return { lastTimeSignatureValueForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
