'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import getLastInstrumentTitleParam from '#msq/language/parser/scenarios/page-schema/getLastInstrumentTitleParam.js'
import parseStaveIndexByTokens from '#msq/language/parser/scenarios/token/parseStaveIndexByTokens.js'
import isStaveIndex from '#msq/language/parser/scenarios/token/isStaveIndex.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findNextTokenValuesOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValuesOnTheLine.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['instrument title'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.instrumentTitle.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'instrumentTitlesParams', parserState)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.instrumentTitlesParams = lastMeasureParamsValue.instrumentTitlesParams || []
      parserState.lastInstrumentTitlesParamsForEachLine = parserState.lastInstrumentTitlesParamsForEachLine || []
      const instrumentTitle = regexps.instrumentTitle.match(tokenValues)[0]
      lastMeasureParamsValue.instrumentTitlesParams.push(
        {
          value: instrumentTitle,
          staveNumber: 0,
          staveStartNumber: 0,
          staveEndNumber: 0
        }
      )
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      const numberOfInstrumentTitles = lastMeasureParamsValue.instrumentTitlesParams.length
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
          regexps.stringHighlight, (match) => {
            return `<span class="sth" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${match}</span>`
          }
        )
        const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = joinedTokenValuesWithRealDelimitersWithHighlightedString.replace(
          regexps.instrumentTitleHighlight, (match) => {
            return `<span class="eh" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="instrument-title-${numberOfMeasures}-${numberOfInstrumentTitles}">${joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = joinedTokenValuesWithRealDelimitersWithHighlightedString.replace(
        regexps.instrumentTitleHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement
      )
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
  scenarios['instrument title for'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    prohibitedCommandProgressions: [ 'instrument title for each line', 'instrument title for lines below' ],
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
      ) &&
      !regexps.forLinesBelow.test(
        [
          currentToken.value,
          findNextTokenValuesOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken,
            2
          )
        ]
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    prohibitedCommandProgressions: [ 'instrument title for each line', 'instrument title for lines below' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.between.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
        )
      }
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    },
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title for stave index'] = {
    requiredCommandProgression: 'instrument title for',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitleParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.instrumentTitlesParams.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.instrumentTitlesParams.length - 1))
      ) {
        lastMeasureParamsValue.instrumentTitlesParams.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex = parserState.lastInstrumentTitlesParamsForEachLine.findIndex(param => ((param.staveStartNumber === staveIndex) || (param.staveEndNumber === staveIndex)))
      if (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastInstrumentTitlesParamsForEachLine.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex, 1)
      }
      lastInstrumentTitleParamValue.staveNumber = staveIndex
      lastInstrumentTitleParamValue.staveStartNumber = staveIndex
      lastInstrumentTitleParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replace(
          'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
        )
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.staveIndexHighlight, (match) => {
            return `<span class="csph" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveIndexHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 2,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between stave index 1'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['instrument title for stave index'],
    'instrument title between'
  )
  scenarios['instrument title between stave index 1 followed by and'] = {
    requiredCommandProgression: 'instrument title between stave index 1',
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.and.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title between stave index 2'] = {
    requiredCommandProgression: 'instrument title between stave index 1 followed by and',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isStaveIndex(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const staveIndex = parseStaveIndexByTokens(tokenValues, true)
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitleParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex = lastMeasureParamsValue.instrumentTitlesParams.findIndex(param => (param.staveEndNumber === staveIndex))
      if (
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== -1) &&
        (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex !== (lastMeasureParamsValue.instrumentTitlesParams.length - 1))
      ) {
        lastMeasureParamsValue.instrumentTitlesParams.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastMeasureForThisStaveIndex, 1)
      }
      const indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex = parserState.lastInstrumentTitlesParamsForEachLine.findIndex(param => (param.staveEndNumber === staveIndex))
      if (indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex !== -1) {
        parserState.lastInstrumentTitlesParamsForEachLine.splice(indexOfIfThereIsAlreadyInstrumentTitlesParamValueInLastInstrumentTitlesParamsForEachLineForThisStaveIndex, 1)
      }
      lastInstrumentTitleParamValue.staveEndNumber = staveIndex
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 2] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 2].replace(
          'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
        )
        parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1] = parserState.highlightsHtmlBuffer[parserState.highlightsHtmlBuffer.length - 1].replace(
          'ref-id=""', `ref-id="stave-${numberOfMeasures}-${staveIndex + 1}"`
        )
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.staveIndexHighlight, (match) => {
            return `<span class="csph" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveIndexHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 2,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['instrument title for each line'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forEachLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitlesParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      lastInstrumentTitlesParamValue.forEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLine.push(lastInstrumentTitlesParamValue)
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.forEachLineHighlight, (match) => {
            return `<span class="clph" ref-id="instrument-title-for-each-line-${parserState.lastInstrumentTitlesParamsForEachLineId}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="instrument-title-for-each-line-${parserState.lastInstrumentTitlesParamsForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
        )
      }
      parserState.lastInstrumentTitlesParamsForEachLineId += 1
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.forEachLineHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['instrument title for lines below'] = {
    requiredCommandProgression: 'instrument title',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.forLinesBelow.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const lastInstrumentTitlesParamValue = getLastInstrumentTitleParam(lastMeasureParamsValue)
      lastInstrumentTitlesParamValue.forEachLineId = parserState.lastInstrumentTitlesParamsForEachLineId
      parserState.lastInstrumentTitlesParamsForEachLine.push(lastInstrumentTitlesParamValue)
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.linesHighlight, (match) => {
            return `<span class="clph" ref-id="instrument-title-for-each-line-${parserState.lastInstrumentTitlesParamsForEachLineId}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="instrument-title-for-each-line-${parserState.lastInstrumentTitlesParamsForEachLineId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
        )
      }
      parserState.lastInstrumentTitlesParamsForEachLineId += 1
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.linesHighlight, (match) => {
          return `<span class="clph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
