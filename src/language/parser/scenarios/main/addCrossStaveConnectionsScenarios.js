'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import getLastCrossStaveConnectionParam from '#msq/language/parser/scenarios/page-schema/getLastCrossStaveConnectionParam.js'
import parseStaveIndexByTokens from '#msq/language/parser/scenarios/token/parseStaveIndexByTokens.js'
import isStaveIndex from '#msq/language/parser/scenarios/token/isStaveIndex.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['bracket or brace'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.firstOnTheLine &&
        regexps.crossStaveConnection.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'connectionsParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.connectionsParams = lastMeasureParamsValue.connectionsParams || []
      parserState.lastCrossStaveConnectionsParamsForEachLine = parserState.lastCrossStaveConnectionsParamsForEachLine || []
      const connectionName = currentToken.value
      lastMeasureParamsValue.connectionsParams.push(
        {
          name: connectionName,
          staveStartNumber: 0,
          staveEndNumber: 0
        }
      )
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      const numberOfConnections = lastMeasureParamsValue.connectionsParams.length
      return { numberOfMeasures, numberOfConnections }
    },
    itIsNewCommandProgressionFromLevel: 0,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection for'] = {
    requiredCommandProgression: 'bracket or brace',
    prohibitedCommandProgressions: [ 'connection for each line', 'connection for lines below' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.for.test(tokenValues) &&
        !regexps.forEach.test(
          [
            currentToken.value,
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        ) &&
        !regexps.forLines.test(
          [
            currentToken.value,
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection from'] = {
    requiredCommandProgression: 'bracket or brace',
    prohibitedCommandProgressions: [ 'connection for each line', 'connection for lines below' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.from.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection for stave index'] = {
    requiredCommandProgression: 'connection for',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastCrossStaveConnectionParamValue = getLastCrossStaveConnectionParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.connectionsParams.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (
        (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.connectionsParams.length - 1))
      ) {
        lastMeasureParamsValue.connectionsParams.splice(indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex = parserState.lastCrossStaveConnectionsParamsForEachLine.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastCrossStaveConnectionsParamsForEachLine.splice(indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex, 1)
      }
      lastCrossStaveConnectionParamValue.staveStartNumber = staveIndex
      lastCrossStaveConnectionParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures, staveIndex }
    },
    itIsNewCommandProgressionFromLevel: 2,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection from stave index'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['connection for stave index'],
    'connection from'
  )
  scenarios['connection to'] = {
    requiredCommandProgression: 'bracket or brace',
    prohibitedCommandProgressions: [ 'connection for each line', 'connection for lines below' ],
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.to.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection to stave index'] = {
    requiredCommandProgression: 'connection to',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastCrossStaveConnectionParamValue = getLastCrossStaveConnectionParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.connectionsParams.findIndex(param => (param.staveEndNumber === staveIndex))
      if (
        (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.connectionsParams.length - 1))
      ) {
        lastMeasureParamsValue.connectionsParams.splice(indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex = parserState.lastCrossStaveConnectionsParamsForEachLine.findIndex(param => (param.staveEndNumber === staveIndex))
      if (indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastCrossStaveConnectionsParamsForEachLine.splice(indexOfIfThereIsAlreadyCrossStaveConnectionParamValueInLastCrossStaveConnectionsParamsForEachLineForThisStaveIndex, 1)
      }
      lastCrossStaveConnectionParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      return { numberOfMeasures, staveIndex }
    },
    itIsNewCommandProgressionFromLevel: 2,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['connection for each line'] = {
    requiredCommandProgression: 'bracket or brace',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forEachLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastCrossStaveConnectionsParamValue = getLastCrossStaveConnectionParam(lastMeasureParamsValue)
      lastCrossStaveConnectionsParamValue.forEachLineId = parserState.lastCrossStaveConnectionsParamsForEachLineId
      parserState.lastCrossStaveConnectionsParamsForEachLine.push(lastCrossStaveConnectionsParamValue)
      const lastCrossStaveConnectionsParamsForEachLineId = parserState.lastCrossStaveConnectionsParamsForEachLineId
      parserState.lastCrossStaveConnectionsParamsForEachLineId += 1
      return { lastCrossStaveConnectionsParamsForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['connection for lines below'] = {
    requiredCommandProgression: 'bracket or brace',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forLinesBelow.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastCrossStaveConnectionsParamValue = getLastCrossStaveConnectionParam(lastMeasureParamsValue)
      lastCrossStaveConnectionsParamValue.forEachLineId = parserState.lastCrossStaveConnectionsParamsForEachLineId
      parserState.lastCrossStaveConnectionsParamsForEachLine.push(lastCrossStaveConnectionsParamValue)
      const lastCrossStaveConnectionsParamsForEachLineId = parserState.lastCrossStaveConnectionsParamsForEachLineId
      parserState.lastCrossStaveConnectionsParamsForEachLineId += 1
      return { lastCrossStaveConnectionsParamsForEachLineId }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
