'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findChordParamsByLastMentionedUnitPositions from '#msq/language/parser/scenarios/page-schema/findChordParamsByLastMentionedUnitPositions.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/main/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['glissando'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.glissando.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      parserState.numberOfGlissandos += 1
      parserState.lastDeclaredGlissando = undefined
      parserState.lastGlissandoDirection = undefined
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['glissando starts before unit'] = {
    requiredCommandProgression: 'glissando',
    prohibitedCommandProgressions: [ 'glissando starts before unit', 'glissando starts at unit', 'glissando finishes at unit', 'glissando finishes after unit' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.startsBefore.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${scenarios['glissando starts before unit'].lineNumber}`)
      } else {
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${scenarios['glissando starts before unit'].lineNumber}`)
        } else {
          if (parserState.lastDeclaredGlissando !== undefined) {
            parserState.numberOfGlissandos += 1
            parserState.lastDeclaredGlissando = undefined
            parserState.lastGlissandoDirection = undefined
            parserState.lastGlissandoForm = undefined
          }
          const glissandoMarkKey = `glissando-${parserState.numberOfGlissandos}`
          chordParamsValue.glissandoMarks = chordParamsValue.glissandoMarks || []
          const glissandoMark = {
            key: glissandoMarkKey,
            before: true
          }
          if (parserState.lastGlissandoDirection) {
            glissandoMark.direction = parserState.lastGlissandoDirection
          }
          if (parserState.lastGlissandoForm) {
            glissandoMark.form = parserState.lastGlissandoForm
          }
          chordParamsValue.glissandoMarks.push(glissandoMark)
          parserState.lastDeclaredGlissando = glissandoMark
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'glissando starts before unit', 2, { measure: true, stave: true })
  scenarios['glissando finishes after unit'] = {
    requiredCommandProgression: 'glissando',
    prohibitedCommandProgressions: [ 'glissando finishes after unit', 'glissando finishes at unit', 'glissando starts at unit', 'glissando starts before unit' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.finishesAfter.test(tokenValues)
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
          chordParamsValue.glissandoMarks = chordParamsValue.glissandoMarks || []
          const glissandoMarkKey = `glissando-${parserState.numberOfGlissandos}`
          const glissandoMark = {
            key: glissandoMarkKey,
            after: true
          }
          if (parserState.lastGlissandoDirection) {
            glissandoMark.direction = parserState.lastGlissandoDirection
          }
          if (parserState.lastGlissandoForm) {
            glissandoMark.form = parserState.lastGlissandoForm
          }
          chordParamsValue.glissandoMarks.push(glissandoMark)
          parserState.lastDeclaredGlissando = glissandoMark
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'glissando finishes after unit', 2, { measure: true, stave: true })
  scenarios['glissando starts at unit'] = {
    requiredCommandProgression: 'glissando',
    prohibitedCommandProgressions: [ 'glissando starts at unit', 'glissando before at unit', 'glissando finishes at unit', 'glissando finishes after unit' ],
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
      !regexps.startsBefore.test(tokenValues) &&
      !regexps.before.test(
        [
          findNextTokenValueOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken
          )
        ]
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
          chordParamsValue.glissandoMarks = chordParamsValue.glissandoMarks || []
          const glissandoMarkKey = `glissando-${parserState.numberOfGlissandos}`
          const glissandoMark = {
            key: glissandoMarkKey
          }
          if (parserState.lastGlissandoDirection) {
            glissandoMark.direction = parserState.lastGlissandoDirection
          }
          if (parserState.lastGlissandoForm) {
            glissandoMark.form = parserState.lastGlissandoForm
          }
          chordParamsValue.glissandoMarks.push(glissandoMark)
          parserState.lastDeclaredGlissando = glissandoMark
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'glissando starts at unit', 2, { measure: true, stave: true })
  scenarios['glissando finishes at unit'] = {
    requiredCommandProgression: 'glissando starts at unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        regexps.finishes.test(tokenValues) ||
        regexps.to.test(tokenValues)
      ) &&
      !regexps.finishesAfter.test(tokenValues) &&
      !regexps.after.test(
        [
          findNextTokenValueOnTheLine(
            unitext,
            currentToken.firstCharIndexOfNextToken
          )
        ]
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
          chordParamsValue.glissandoMarks = chordParamsValue.glissandoMarks || []
          const glissandoMarkKey = `glissando-${parserState.numberOfGlissandos}`
          const glissandoMark = {
            key: glissandoMarkKey
          }
          if (parserState.lastGlissandoDirection) {
            glissandoMark.direction = parserState.lastGlissandoDirection
          }
          if (parserState.lastGlissandoForm) {
            glissandoMark.form = parserState.lastGlissandoForm
          }
          chordParamsValue.glissandoMarks.push(glissandoMark)
          parserState.lastDeclaredGlissando = glissandoMark
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'glissando finishes at unit', 2, { measure: true, stave: true })
  scenarios['glissando direction'] = {
    requiredCommandProgression: 'glissando',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const glissandoDirection = parseDirection(tokenValues)
      if (parserState.lastDeclaredGlissando) {
        parserState.lastDeclaredGlissando.direction = glissandoDirection
      }
      parserState.lastGlissandoDirection = glissandoDirection
    }
  }
  scenarios['glissando form'] = {
    requiredCommandProgression: 'glissando',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.asWaveLine.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const glissandoForm = regexps.asWaveLine.match(tokenValues)[0]
      if (parserState.lastDeclaredGlissando) {
        parserState.lastDeclaredGlissando.form = glissandoForm
      }
      parserState.lastGlissandoForm = glissandoForm
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'glissando',
    [
      'glissando starts before unit',
      'glissando finishes after unit',
      'glissando starts at unit',
      'glissando finishes at unit'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
