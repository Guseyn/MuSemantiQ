'use strict'

import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'

export default function (scenarios) {
  scenarios['new'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.firstOnTheLine &&
        regexps.new.test(tokenValues) &&
        regexps.line.test([
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ])
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.newHighlight, (match) => {
            return `<span class="clph" ref-id="">${match}`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.newHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimitersWithHighlightedElement)
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['new line'] = {
    requiredCommandProgression: 'new',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.lastOnTheLine &&
        regexps.line.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.pageSchema.measuresParams = parserState.pageSchema.measuresParams || []
      parserState.numberOfPageLines += 1
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      if (lastMeasureParamsValue) {
        lastMeasureParamsValue.isLastMeasureOnPageLine = true
      }
      parserState.pageSchema.measuresParams.push({
        closingBarLineName: 'barLine',
        pageLineNumber: parserState.numberOfPageLines
      })
      parserState.newlineAlreadyIntroducedNewMeasure = true
      const updatedLastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      if (parserState.lastCrossStaveConnectionsParamsForEachLine) {
        updatedLastMeasureParamsValue.connectionsParams = JSON.parse(JSON.stringify(parserState.lastCrossStaveConnectionsParamsForEachLine))
      }
      if (parserState.lastInstrumentTitlesParamsForEachLine) {
        updatedLastMeasureParamsValue.instrumentTitlesParams = JSON.parse(JSON.stringify(parserState.lastInstrumentTitlesParamsForEachLine))
      }
      if (parserState.lastKeySignatureName) {
        updatedLastMeasureParamsValue.keySignatureName = parserState.lastKeySignatureName
        updatedLastMeasureParamsValue.keySignatureNameForEachLineId = parserState.lastKeySignatureNameForEachLineId
      }
      if (parserState.lastTimeSignatureParams) {
        updatedLastMeasureParamsValue.timeSignatureParams = parserState.lastTimeSignatureParams
      }
      parserState.lastBeamStatus = {}
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replaceAll('ref-id=""', `ref-id="line-${parserState.numberOfPageLines}"`)
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.lineHighlight, (match) => {
            return `${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lineHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimitersWithHighlightedElement)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
