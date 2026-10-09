'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findNextTokenValuesOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValuesOnTheLine.js'
import findChordParamsByLastMentionedUnitPositions from '#msq/language/parser/scenarios/page-schema/findChordParamsByLastMentionedUnitPositions.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/main/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['octave sign'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const nextTwoTokens = findNextTokenValuesOnTheLine(
        unitext, currentToken.firstCharIndexOfNextToken, 2
      )
      return regexps.octaveOrTwoOctavesHigherOrLower.test(tokenValues) &&
        nextTwoTokens.indexOf('clef') === -1
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      const match = regexps.octaveOrTwoOctavesHigherOrLower.match(tokenValues)
      const isTwoOctaves = match[0]
      const octaveSignMainValue = isTwoOctaves ? '15' : '8'
      const octaveSignUpperValue = isTwoOctaves ? 'ma' : 'va'
      const octaveSignDirection = (match[1] === 'up' || match[1] === 'higher') ? 'up' : 'down'
      parserState.numberOfOctaveSignMarks += 1
      parserState[`lastStartOctaveSignMark-${parserState.numberOfOctaveSignMarks}`] = {
        key: `octave-sign-${parserState.numberOfOctaveSignMarks}`,
        octaveNumber: octaveSignMainValue,
        octavePostfix: octaveSignUpperValue,
        yCorrection: 0,
        direction: octaveSignDirection
      }
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['octave sign from unit'] = {
    requiredCommandProgression: 'octave sign',
    prohibitedCommandProgressions: [ 'octave sign from unit', 'octave sign to unit' ],
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
          chordParamsValue.octaveSignMark = parserState[`lastStartOctaveSignMark-${parserState.numberOfOctaveSignMarks}`]
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'octave sign from unit', 2, { measure: true })
  scenarios['octave sign to unit'] = {
    requiredCommandProgression: 'octave sign',
    prohibitedCommandProgressions: [ 'octave sign to unit' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.finishes.test(tokenValues) ||
        regexps.to.test(tokenValues)
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
          chordParamsValue.octaveSignMark = {
            key: `octave-sign-${parserState.numberOfOctaveSignMarks}`,
            finish: true
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'octave sign to unit', 2, { measure: true })
  scenarios['octave sign vertical correction'] = {
    requiredCommandProgression: 'octave sign',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState[`lastStartOctaveSignMark-${parserState.numberOfOctaveSignMarks}`].yCorrection = parseVerticalCorrection(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'octave sign',
    [
      'octave sign from unit',
      'octave sign to unit'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
