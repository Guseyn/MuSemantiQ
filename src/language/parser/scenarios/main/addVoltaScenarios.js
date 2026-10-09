'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findMeasureParamsByLastMentionedMeasurePosition from '#msq/language/parser/scenarios/page-schema/findMeasureParamsByLastMentionedMeasurePosition.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedMeasurePosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedMeasurePosition.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['volta'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        regexps.volta.test(tokenValues) &&
        !regexps.brackets.test(
          [
            findNextTokenValueOnTheLine(
              unitext, currentToken.firstCharIndexOfNextToken
            )
          ]
        )
      ) ||
      regexps.voltaBrackets.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      parserState.numberOfVoltaMarks += 1
      parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`] = {
        key: `volta-mark-${parserState.numberOfVoltaMarks}`
      }
      parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`] = {
        key: `volta-mark-${parserState.numberOfVoltaMarks}`
      }
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedMeasurePosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['volta with text'] = {
    requiredCommandProgression: 'volta',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withText.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const voltaText = regexps.withText.match(tokenValues)[0]
      parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].value = voltaText
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['volta starts before'] = {
    requiredCommandProgression: 'volta',
    prohibitedCommandProgressions: [ 'volta finishes at', 'volta finishes after', 'volta starts at' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.startsBefore.test(tokenValues) ||
        regexps.before.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedMeasurePosition === undefined) {
        parserState.errors.push(`measure position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const measureParamsValue = findMeasureParamsByLastMentionedMeasurePosition(parserState)
        if (!measureParamsValue) {
          parserState.errors.push(`measure after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].startsHere = false
          parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].startsBefore = true
          if (!parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`].finishesHere && !parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`].finishesAfter) {
            parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].finishesHere = true
          }
          measureParamsValue.voltaMark = parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`]
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedMeasurePosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta starts before', [], 2, false, { measure: true })
  scenarios['volta finishes after'] = {
    requiredCommandProgression: 'volta',
    prohibitedCommandProgressions: [ 'volta finishes at' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.finishesAfter.test(tokenValues) ||
        regexps.after.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedMeasurePosition === undefined) {
        parserState.errors.push(`measure position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const measureParamsValue = findMeasureParamsByLastMentionedMeasurePosition(parserState)
        if (!measureParamsValue) {
          parserState.errors.push(`measure after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          if (measureParamsValue.voltaMark) {
            measureParamsValue.voltaMark.finishesHere = false
            measureParamsValue.voltaMark.finishesAfter = true
          } else {
            parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].finishesHere = false
            parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`].finishesAfter = true
            if (!parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].startsHere) {
              parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`].startsHere = true
            }
            measureParamsValue.voltaMark = parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`]
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedMeasurePosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta finishes after', [], 2, false, { measure: true })
  scenarios['volta starts at'] = {
    requiredCommandProgression: 'volta',
    prohibitedCommandProgressions: [ 'volta finishes at', 'volta finishes after', 'volta starts after' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        (
          regexps.starts.test(tokenValues) &&
          !regexps.from.test(
            [
              findNextTokenValueOnTheLine(
                unitext, currentToken.firstCharIndexOfNextToken
              )
            ]
          )
        ) ||
        regexps.from.test(tokenValues) ||
        regexps.startsFrom.test(tokenValues)
      ) &&
      !regexps.before.test(
        [
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ]
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedMeasurePosition === undefined) {
        parserState.errors.push(`measure position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const measureParamsValue = findMeasureParamsByLastMentionedMeasurePosition(parserState)
        if (!measureParamsValue) {
          parserState.errors.push(`measure after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].startsHere = true
          measureParamsValue.voltaMark = parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`]
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedMeasurePosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta starts at', [], 2, false, { measure: true })
  scenarios['volta finishes at'] = {
    requiredCommandProgression: 'volta',
    prohibitedCommandProgressions: [ 'volta finishes at' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        regexps.finishes.test(tokenValues) ||
        regexps.to.test(tokenValues)
      ) &&
      !regexps.after.test(
        [
          findNextTokenValueOnTheLine(
            unitext, currentToken.firstCharIndexOfNextToken
          )
        ]
      )
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedMeasurePosition === undefined) {
        parserState.errors.push(`measure position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const measureParamsValue = findMeasureParamsByLastMentionedMeasurePosition(parserState)
        if (!measureParamsValue) {
          parserState.errors.push(`measure after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          if (measureParamsValue.voltaMark) {
            measureParamsValue.voltaMark.finishesHere = true
          } else {
            parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].finishesHere = false
            parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`].finishesHere = true
            measureParamsValue.voltaMark = parserState[`lastFinishVoltaMark-${parserState.numberOfVoltaMarks}`]
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedMeasurePosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta finishes at', [], 2, false, { measure: true })
  scenarios['volta vertical correction'] = {
    requiredCommandProgression: 'volta',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState[`lastStartVoltaMark-${parserState.numberOfVoltaMarks}`].yCorrection = parseVerticalCorrection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'volta',
    [
      'volta with text',
      'volta starts before',
      'volta starts before',
      'volta finishes after',
      'volta starts at',
      'volta finishes at',
      'volta vertical correction'
    ],
    1,
    true,
    { line: true }
  )
}
