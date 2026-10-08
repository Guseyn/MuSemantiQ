'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import isAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/isAboveBelowOverUnderStaveLines.js'
import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import parseDirectionByAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnderStaveLines.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findChordParamsByLastMentionedUnitPositions from '#msq/language/parser/scenarios/page-schema/findChordParamsByLastMentionedUnitPositions.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlights-html-buffer/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['crescendo|diminuendo'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.crescendoOrDiminuendo.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      const match = regexps.crescendoOrDiminuendo.match(tokenValues)
      const crescendoOrDiminuendoValue = match[0]
      parserState.numberOfDynamicMarks += 1
      parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`] = {
        key: `crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}`,
        type: crescendoOrDiminuendoValue,
        direction: 'up',
        yCorrection: 0
      }
      parserState[`lastFinishDynamicChangeMark-${parserState.numberOfDynamicMarks}`] = {
        key: `crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}`,
        finish: true
      }
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.crescendoOrDiminuendoHighlight, (match) => {
            return `<span class="eh" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.crescendoOrDiminuendoHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(parserState, true)
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
      undefineOnlyLastMentionedUnitPosition(parserState)
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['crescendo|diminuendo starts'] = {
    requiredCommandProgression: 'crescendo|diminuendo',
    prohibitedCommandProgressions: [ 'crescendo|diminuendo starts' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const nextTokenIsNotFrom = !regexps.from.test(
        [
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ]
      )
      const nextTokenIsNotWith = !regexps.with.test(
        [
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ]
      )
      return (
        regexps.startsWithTextValue.test(tokenValues) &&
        nextTokenIsNotFrom
      ) ||
      regexps.startsWithTextValueFrom.test(tokenValues) ||
      (
        (
          (
            regexps.starts.test(tokenValues) &&
            nextTokenIsNotFrom
          ) ||
          regexps.from.test(tokenValues) ||
          regexps.startsFrom.test(tokenValues)
        ) &&
        nextTokenIsNotWith
      )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (regexps.startsWithTextValue.test(tokenValues)) {
        parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].valueBefore = regexps.startsWithTextValue.match(
          tokenValues
        )[0]
        if (parserState.applyHighlighting) {
          const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
            regexps.stringHighlight, (match) => {
              return `<span class="sth" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${match}</span>`
            }
          )
          parserState.highlightsHtmlBuffer.push(
            `<span class="th" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
          )
        }
      } else if (regexps.startsWithTextValueFrom.test(tokenValues)) {
        parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].valueBefore = regexps.startsWithTextValueFrom.match(
          tokenValues
        )[0]
        if (parserState.applyHighlighting) {
          const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
            regexps.stringHighlight, (match) => {
              return `<span class="sth" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${match}</span>`
            }
          )
          parserState.highlightsHtmlBuffer.push(
            `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedString}`
          )
          parserState.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            parserState.highlightsHtmlBuffer.length - 1
          )
        }
      } else {
        if (parserState.applyHighlighting) {
          parserState.highlightsHtmlBuffer.push(
            `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
          )
          parserState.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            parserState.highlightsHtmlBuffer.length - 1
          )
        }
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.dynamicChangeMark = parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`]
        }
      }
      if (parserState.applyHighlighting) {
        fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(parserState)
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
      undefineOnlyLastMentionedUnitPosition(parserState)
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo starts', 2, { measure: true })
  scenarios['crescendo|diminuendo finishes'] = {
    requiredCommandProgression: 'crescendo|diminuendo',
    prohibitedCommandProgressions: [ 'crescendo|diminuendo finishes' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.finishesWithTextValue.test(tokenValues) ||
        (
          regexps.finishes.test(tokenValues) &&
          !regexps.with.test(
            [
              findNextTokenValueOnTheLine(
                unitext, currentToken.firstCharIndexOfNextToken
              )
            ]
          )
        ) ||
        regexps.to.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      if (regexps.finishesWithTextValue.test(tokenValues)) {
        parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].valueAfter = regexps.finishesWithTextValue.match(
          tokenValues
        )[0]
        if (parserState.applyHighlighting) {
          const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
            regexps.stringHighlight, (match) => {
              return `<span class="sth" ref-id="crescendo-or-diminuendo-value-after-${parserState.numberOfDynamicMarks}">${match}</span>`
            }
          )
          parserState.highlightsHtmlBuffer.push(
            `<span class="th" ref-id="crescendo-or-diminuendo-value-after-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}`
          )
        }
      } else {
        if (parserState.applyHighlighting) {
          parserState.highlightsHtmlBuffer.push(
            `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
          )
          parserState.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
            parserState.highlightsHtmlBuffer.length - 1
          )
        }
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.dynamicChangeMark = parserState[`lastFinishDynamicChangeMark-${parserState.numberOfDynamicMarks}`]
        }
      }
      if (parserState.applyHighlighting) {
        fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(parserState)
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
      undefineOnlyLastMentionedUnitPosition(parserState)
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo finishes', 2, { measure: true })
  scenarios['crescendo|diminuendo direction'] = {
    requiredCommandProgression: 'crescendo|diminuendo',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].direction = parseDirection(tokenValues)
      if (parserState.applyHighlighting) {
        // no highlights needed
        parserState.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      parserState.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['crescendo|diminuendo above or below stave'] = {
    requiredCommandProgression: 'crescendo|diminuendo',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnderStaveLines(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].direction = parseDirectionByAboveBelowOverUnderStaveLines(tokenValues)
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.staveHighlight, (match) => {
            return `<span class="csph" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['crescendo|diminuendo vertical correction'] = {
    requiredCommandProgression: 'crescendo|diminuendo',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState[`lastStartDynamicChangeMark-${parserState.numberOfDynamicMarks}`].yCorrection = parseVerticalCorrection(tokenValues)
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.verticalCorrectionHighlight, (match) => {
            return `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'crescendo|diminuendo',
    [
      'crescendo|diminuendo starts',
      'crescendo|diminuendo finishes'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
