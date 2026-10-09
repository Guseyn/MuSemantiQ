'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import isAboveBelowOverUnder from '#msq/language/parser/scenarios/token/isAboveBelowOverUnder.js'
import parseDirectionByAboveBelowOverUnder from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnder.js'
import isAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/isAboveBelowOverUnderStaveLines.js'
import parseDirectionByAboveBelowOverUnderStaveLines from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnderStaveLines.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import findChordParamsByLastMentionedUnitPositions from '#msq/language/parser/scenarios/page-schema/findChordParamsByLastMentionedUnitPositions.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/main/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['tuplet'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tupletWithValue.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      parserState.lastChordParamsWithFinishedTupletMarkThatStarted = undefined
      parserState.lastChordParamsWithStartedTupletMark = undefined
      parserState.lastTupletDirection = undefined
      parserState.lastTupletIsAboveOrBelowStaveLines = undefined
      parserState.lastTupletWithBrackets = undefined
      parserState.lastTupletVerticalCorrection = undefined
      parserState.numberOfTuplets += 1
      parserState.lastTupletValue = regexps.tupletWithValue.match(tokenValues)[0]
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['tuplet starts before unit'] = {
    requiredCommandProgression: 'tuplet',
    prohibitedCommandProgressions: [ 'tuplet starts before unit', 'tuplet starts at unit', 'tuplet finishes after unit', 'tuplet finishes at unit' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.startsBefore.test(tokenValues) ||
        regexps.before.test(tokenValues)
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
          chordParamsValue.tupletMarks = chordParamsValue.tupletMarks || []
          const firstChordParamsInCurrentVoiceOnCurrentStave = parserState.pageSchema.measuresParams[parserState.unitMeasureIndexByLastMentionedPositions].stavesParams[parserState.unitStaveIndexByLastMentionedPositions].voicesParams[parserState.unitVoiceIndexByLastMentionedPositions][0]
          firstChordParamsInCurrentVoiceOnCurrentStave.tupletMarks = firstChordParamsInCurrentVoiceOnCurrentStave.tupletMarks || []
          const tupletMarkKey = `tuplet-${parserState.numberOfTuplets}`
          const startTupletMark = {
            key: tupletMarkKey,
            value: parserState.lastTupletValue,
            before: true
          }
          if (parserState.lastTupletDirection) {
            startTupletMark.direction = parserState.lastTupletDirection
          }
          if (parserState.lastTupletIsAboveOrBelowStaveLines) {
            startTupletMark.direction = parserState.lastTupletDirection
            startTupletMark.aboveBelowOverUnderStaveLines = true
          }
          if (parserState.lastTupletWithBrackets) {
            startTupletMark.withBrackets = true
          }
          if (parserState.lastTupletVerticalCorrection !== undefined) {
            startTupletMark.yCorrection = parserState.lastTupletVerticalCorrection
          }
          firstChordParamsInCurrentVoiceOnCurrentStave.tupletMarks.push(startTupletMark)
          parserState.lastChordParamsWithStartedTupletMark = {
            chordParams: firstChordParamsInCurrentVoiceOnCurrentStave,
            tupletMarkIndex: firstChordParamsInCurrentVoiceOnCurrentStave.tupletMarks.length - 1
          }
          chordParamsValue.tupletMarks.push({
            key: tupletMarkKey,
            finish: true
          })
          parserState.lastChordParamsWithFinishedTupletMarkThatStarted = {
            chordParams: chordParamsValue,
            tupletMarkIndex: chordParamsValue.tupletMarks.length - 1
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'tuplet starts before unit', 2, { measure: true })
  scenarios['tuplet finishes after unit'] = {
    requiredCommandProgression: 'tuplet',
    prohibitedCommandProgressions: [ 'tuplet finishes after unit', 'tuplet finishes at unit' ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.finishesAfter.test(tokenValues) ||
        regexps.after.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line ${argumentsFromMainAction.lineNumber}`)
      } else {
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.tupletMarks = chordParamsValue.tupletMarks || []
          const tupletMarkKey = `tuplet-${parserState.numberOfTuplets}`
          if (parserState.lastChordParamsWithFinishedTupletMarkThatStarted !== undefined) {
            parserState.lastChordParamsWithFinishedTupletMarkThatStarted.chordParams.tupletMarks.splice(
              parserState.lastChordParamsWithFinishedTupletMarkThatStarted.tupletMarkIndex, 1
            )
            parserState.lastChordParamsWithFinishedTupletMarkThatStarted = undefined
          } else if (parserState.lastChordParamsWithStartedTupletMark === undefined) {
            const startTupletMark = {
              key: tupletMarkKey,
              value: parserState.lastTupletValue
            }
            if (parserState.lastTupletDirection) {
              startTupletMark.direction = parserState.lastTupletDirection
            }
            chordParamsValue.tupletMarks.push(startTupletMark)
            parserState.lastChordParamsWithStartedTupletMark = {
              chordParams: chordParamsValue,
              tupletMarkIndex: chordParamsValue.tupletMarks.length - 1
            }
          }
          const finishTupletMark = {
            value: parserState.lastTupletValue,
            key: tupletMarkKey,
            finish: true,
            after: true
          }
          chordParamsValue.tupletMarks.push(finishTupletMark)
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'tuplet finishes after unit', 2, { measure: true })
  scenarios['tuplet starts at unit'] = {
    requiredCommandProgression: 'tuplet',
    prohibitedCommandProgressions: [ 'tuplet starts at unit', 'tuplet starts before unit', 'tuplet finishes after unit', 'tuplet finishes at unit' ],
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
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const tupletMarkKey = `tuplet-${parserState.numberOfTuplets}`
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.tupletMarks = chordParamsValue.tupletMarks || []
          const startTupletMark = {
            key: tupletMarkKey,
            value: parserState.lastTupletValue
          }
          if (parserState.lastTupletDirection) {
            startTupletMark.direction = parserState.lastTupletDirection
          }
          if (parserState.lastTupletIsAboveOrBelowStaveLines) {
            startTupletMark.direction = parserState.lastTupletDirection
            startTupletMark.aboveBelowOverUnderStaveLines = true
          }
          if (parserState.lastTupletWithBrackets) {
            startTupletMark.withBrackets = true
          }
          if (parserState.lastTupletVerticalCorrection !== undefined) {
            startTupletMark.yCorrection = parserState.lastTupletVerticalCorrection
          }
          chordParamsValue.tupletMarks.push(startTupletMark)
          parserState.lastChordParamsWithStartedTupletMark = {
            chordParams: chordParamsValue,
            tupletMarkIndex: chordParamsValue.tupletMarks.length - 1
          }
          chordParamsValue.tupletMarks.push({
            key: tupletMarkKey,
            finish: true,
            after: true
          })
          parserState.lastChordParamsWithFinishedTupletMarkThatStarted = {
            chordParams: chordParamsValue,
            tupletMarkIndex: chordParamsValue.tupletMarks.length - 1
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'tuplet starts at unit', 2, { measure: true })
  scenarios['tuplet finishes at unit'] = {
    requiredCommandProgression: 'tuplet',
    prohibitedCommandProgressions: [ 'tuplet finishes at unit', 'tuplet finishes after unit' ],
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
      if (parserState.lastMentionedUnitPosition === undefined) {
        parserState.errors.push(`unit position after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not specified on the line number ${argumentsFromMainAction.lineNumber}`)
      } else {
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        const tupletMarkKey = `tuplet-${parserState.numberOfTuplets}`
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.tupletMarks = chordParamsValue.tupletMarks || []
          if (parserState.lastChordParamsWithFinishedTupletMarkThatStarted !== undefined) {
            parserState.lastChordParamsWithFinishedTupletMarkThatStarted.chordParams.tupletMarks.splice(
              parserState.lastChordParamsWithFinishedTupletMarkThatStarted.tupletMarkIndex, 1
            )
            parserState.lastChordParamsWithFinishedTupletMarkThatStarted = undefined
          }
          chordParamsValue.tupletMarks.push({
            key: tupletMarkKey,
            finish: true
          })
          parserState.lastChordParamsWithStartedTupletMark = undefined
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'tuplet finishes at unit', 2, { measure: true })
  scenarios['tuplet with direction'] = {
    requiredCommandProgression: 'tuplet',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastTupletDirection = parseDirection(tokenValues)
      if (parserState.lastChordParamsWithStartedTupletMark) {
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].direction = parserState.lastTupletDirection
      }
    }
  }
  scenarios['tuplet above or below'] = {
    requiredCommandProgression: 'tuplet',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues) &&
        !regexps.staveWithAndWithoutDelimeter.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastTupletDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
      if (parserState.lastChordParamsWithStartedTupletMark) {
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].direction = parserState.lastTupletDirection
      }
    }
  }
  scenarios['tuplet is above or below stave lines'] = {
    requiredCommandProgression: 'tuplet',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnderStaveLines(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastTupletDirection = parseDirectionByAboveBelowOverUnderStaveLines(tokenValues)
      parserState.lastTupletIsAboveOrBelowStaveLines = true
      if (parserState.lastChordParamsWithStartedTupletMark) {
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].direction = parserState.lastTupletDirection
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].aboveBelowOverUnderStaveLines = true
      }
      const currentNumberOfMeasures = parserState.pageSchema.measuresParams.length
      return { currentNumberOfMeasures }
    }
  }
  scenarios['tuplet with brackets'] = {
    requiredCommandProgression: 'tuplet',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withBrackets.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastTupletWithBrackets = true
      if (parserState.lastChordParamsWithStartedTupletMark) {
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].withBrackets = parserState.lastTupletWithBrackets
      }
    }
  }
  scenarios['tuplet with vertical correction'] = {
    requiredCommandProgression: 'tuplet',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastTupletVerticalCorrection = parseVerticalCorrection(tokenValues)
      if (parserState.lastChordParamsWithStartedTupletMark) {
        parserState.lastChordParamsWithStartedTupletMark.chordParams.tupletMarks[parserState.lastChordParamsWithStartedTupletMark.tupletMarkIndex].yCorrection = parserState.lastTupletVerticalCorrection
      }
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'tuplet',
    [
      'tuplet starts before unit',
      'tuplet finishes after unit',
      'tuplet starts at unit',
      'tuplet finishes at unit'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
