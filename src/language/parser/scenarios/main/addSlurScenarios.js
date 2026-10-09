'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'
import isDirection from '#msq/language/parser/scenarios/token/isDirection.js'
import parseDirection from '#msq/language/parser/scenarios/token/parseDirection.js'
import isRoundness from '#msq/language/parser/scenarios/token/isRoundness.js'
import parseRoundness from '#msq/language/parser/scenarios/token/parseRoundness.js'
import isAboveBelowOverUnder from '#msq/language/parser/scenarios/token/isAboveBelowOverUnder.js'
import parseDirectionByAboveBelowOverUnder from '#msq/language/parser/scenarios/token/parseDirectionByAboveBelowOverUnder.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import findChordParamsByLastMentionedUnitPositions from '#msq/language/parser/scenarios/page-schema/findChordParamsByLastMentionedUnitPositions.js'
import removeSlurMarksThatFinishFromChordsParamsByKeyAndSlurMarksFromCurrentChordParamsThatDontFinishByKey from '#msq/language/parser/scenarios/page-schema/removeSlurMarksThatFinishFromChordsParamsByKeyAndSlurMarksFromCurrentChordParamsThatDontFinishByKey.js'
import addDirectionToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addDirectionToSlurMarkByKey.js'
import addRoundnessToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addRoundnessToSlurMarkByKey.js'
import addSShapeToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addSShapeToSlurMarkByKey.js'
import addLeftYCorrectionToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addLeftYCorrectionToSlurMarkByKey.js'
import addRightYCorrectionToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addRightYCorrectionToSlurMarkByKey.js'
import addRightPointPlacementToSlurMarkByKey from '#msq/language/parser/scenarios/page-schema/addRightPointPlacementToSlurMarkByKey.js'
import undefineAllMentionedPositions from '#msq/language/parser/scenarios/page-schema/undefineAllMentionedPositions.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/main/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/main/addLineMeasureStaveVoicePositionScenarios.js'

const addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions = (parserState, slurMarkKey) => {
  if (parserState.lastSlurDirection) {
    addDirectionToSlurMarkByKey(parserState, slurMarkKey, parserState.lastSlurDirection)
    parserState.lastSlurDirection = undefined
  }
  if (parserState.lastSlurRoundness) {
    addRoundnessToSlurMarkByKey(parserState, slurMarkKey, parserState.lastSlurRoundness)
    parserState.lastSlurRoundness = undefined
  }
  if (parserState.lastSlurLeftYCorrection) {
    addLeftYCorrectionToSlurMarkByKey(parserState, slurMarkKey, parserState.lastSlurLeftYCorrection)
    parserState.lastSlurLeftYCorrection = undefined
  }
  if (parserState.lastSlurRightYCorrection) {
    addRightYCorrectionToSlurMarkByKey(parserState, slurMarkKey, parserState.lastSlurRightYCorrection)
    parserState.lastSlurRightYCorrection = undefined
  }
  if (parserState.lastSlurRightPointPlacement) {
    addRightPointPlacementToSlurMarkByKey(parserState, slurMarkKey, parserState.lastSlurRightPointPlacement)
    parserState.lastSlurRightPointPlacement = undefined
  }
  if (parserState.lastSlurWithSShape) {
    addSShapeToSlurMarkByKey(parserState, slurMarkKey)
    parserState.lastSlurWithSShape = undefined
  }
}

export default function (scenarios) {
  scenarios['slur'] = {
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.slur.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      undefineAllMentionedPositions(parserState)
      parserState.lastSlurDirection = undefined
      parserState.lastSShapeSlurPartDirection = undefined
      parserState.lastSlurRoundness = undefined
      parserState.lastSlurLeftYCorrection = undefined
      parserState.lastSlurRightYCorrection = undefined
      parserState.lastSlurRightPointPlacement = undefined
      parserState.lastSlurWithSShape = undefined
      parserState.numberOfSlurs += 1
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['slur starts before unit'] = {
    requiredCommandProgression: 'slur',
    prohibitedCommandProgressions: [ 'slur finishes at unit', 'slur finishes after unit', 'slur starts at unit' ],
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
          chordParamsValue.slurMarks = chordParamsValue.slurMarks || []
          const slurMarkKey = `slur-${parserState.numberOfSlurs}`
          chordParamsValue.slurMarks.push({
            key: slurMarkKey,
            before: true
          })
          chordParamsValue.slurMarks.push({
            key: slurMarkKey,
            finish: true
          })
          parserState.slurMarkChords[slurMarkKey] = parserState.slurMarkChords[slurMarkKey] || []
          parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
          addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions(parserState, slurMarkKey)
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'slur starts before unit', 2, { measure: true, stave: true })
  scenarios['slur starts before above|below unit'] = {
    requiredCommandProgression: 'slur starts before unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastSlurDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
    }
  }
  scenarios['slur finishes after unit'] = {
    requiredCommandProgression: 'slur',
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
          chordParamsValue.slurMarks = chordParamsValue.slurMarks || []
          const slurMarkKey = `slur-${parserState.numberOfSlurs}`
          removeSlurMarksThatFinishFromChordsParamsByKeyAndSlurMarksFromCurrentChordParamsThatDontFinishByKey(parserState, slurMarkKey, chordParamsValue)
          parserState.slurMarkChords[slurMarkKey] = parserState.slurMarkChords[slurMarkKey] || []
          if (parserState.slurMarkChords[slurMarkKey].length === 0) {
            chordParamsValue.slurMarks.push({
              key: slurMarkKey
            })
            parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
          }
          const slurMark = {
            key: slurMarkKey,
            finish: true,
            after: true
          }
          if (parserState.lastSShapeSlurPartDirection) {
            slurMark.direction = parserState.lastSShapeSlurPartDirection
            parserState.lastSShapeSlurPartDirection = undefined
          }
          chordParamsValue.slurMarks.push(slurMark)
          parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
          addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions(parserState, slurMarkKey)
        }
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'slur finishes after unit', 2, { measure: true, stave: true })
  scenarios['slur finishes after above|below unit'] = {
    requiredCommandProgression: 'slur finishes after unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const slurDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
      addDirectionToSlurMarkByKey(parserState, slurMarkKey, slurDirection)
      parserState.lastSShapeSlurPartDirection = slurDirection
      parserState.lastSlurDirection = slurDirection
    }
  }
  scenarios['slur starts at unit'] = {
    requiredCommandProgression: 'slur',
    prohibitedCommandProgressions: [ 'slur finishes at unit', 'slur finishes after unit', 'slur starts after unit' ],
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
        const chordParamsValue = findChordParamsByLastMentionedUnitPositions(parserState)
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.slurMarks = chordParamsValue.slurMarks || []
          const slurMarkKey = `slur-${parserState.numberOfSlurs}`
          const slurMark = {
            key: slurMarkKey
          }
          chordParamsValue.slurMarks.push(slurMark)
          parserState.slurMarkChords[slurMarkKey] = parserState.slurMarkChords[slurMarkKey] || []
          parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
          addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions(parserState, slurMarkKey)
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'slur starts at unit', 2, { measure: true, stave: true })
  scenarios['slur starts above|below unit'] = {
    requiredCommandProgression: 'slur starts at unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastSlurDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
    }
  }
  scenarios['slur finishes at unit'] = {
    requiredCommandProgression: 'slur',
    prohibitedCommandProgressions: [ 'slur finishes at unit' ],
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
        if (!chordParamsValue) {
          parserState.errors.push(`unit after command '${argumentsFromMainAction.joinedTokenValuesWithRealDelimiters}' is not found on the line ${argumentsFromMainAction.lineNumber}`)
        } else {
          chordParamsValue.slurMarks = chordParamsValue.slurMarks || []
          const slurMarkKey = `slur-${parserState.numberOfSlurs}`
          removeSlurMarksThatFinishFromChordsParamsByKeyAndSlurMarksFromCurrentChordParamsThatDontFinishByKey(parserState, slurMarkKey, chordParamsValue)
          parserState.slurMarkChords[slurMarkKey] = parserState.slurMarkChords[slurMarkKey] || []
          if (parserState.slurMarkChords[slurMarkKey].length > 0) {
            const slurMark = {
              key: slurMarkKey,
              finish: true
            }
            if (parserState.lastSShapeSlurPartDirection) {
              slurMark.direction = parserState.lastSShapeSlurPartDirection
              parserState.lastSShapeSlurPartDirection = undefined
            }
            chordParamsValue.slurMarks.push(slurMark)
            parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
            addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions(parserState, slurMarkKey)
          }
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  addUnitPositionScenarios(scenarios, 'slur finishes at unit', 2, { measure: true, stave: true })
  scenarios['slur finishes above|below unit'] = {
    requiredCommandProgression: 'slur finishes at unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastSShapeSlurPartDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
      parserState.lastSlurDirection = parserState.lastSShapeSlurPartDirection
    }
  }
  scenarios['slur direction'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isDirection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const slurDirection = parseDirection(tokenValues)
      addDirectionToSlurMarkByKey(parserState, slurMarkKey, slurDirection)
      parserState.lastSlurDirection = slurDirection
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['slur above or below'] = {
    requiredCommandProgression: 'slur',
    prohibitedCommandProgressions: [
      'slur starts before unit',
      'slur finishes after unit',
      'slur starts at unit',
      'slur finishes at unit',
      'slur goes through unit'
    ],
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const slurDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
      addDirectionToSlurMarkByKey(parserState, slurMarkKey, slurDirection)
      parserState.lastSlurDirection = slurDirection
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['slur roundness'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isRoundness(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const roundnessValue = parseRoundness(tokenValues)
      addRoundnessToSlurMarkByKey(parserState, slurMarkKey, roundnessValue)
      parserState.lastSlurRoundness = roundnessValue
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['slur goes through unit'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.changesStaveOrGoesThrough.test(tokenValues)
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
          chordParamsValue.slurMarks = chordParamsValue.slurMarks || []
          const slurMarkKey = `slur-${parserState.numberOfSlurs}`
          parserState.slurMarkChords[slurMarkKey] = parserState.slurMarkChords[slurMarkKey] || []
          const slurMark = {
            key: slurMarkKey
          }
          if (parserState.lastSShapeSlurPartDirection) {
            slurMark.direction = parserState.lastSShapeSlurPartDirection
            parserState.lastSShapeSlurPartDirection = undefined
          }
          chordParamsValue.slurMarks.push(slurMark)
          parserState.slurMarkChords[slurMarkKey].push(chordParamsValue)
          addSlurFeaturesIfTheyAreSpecifiedBeforeItsUnitPositions(parserState, slurMarkKey)
        }
      }
      const mentionedPositions = getMentionedPositions(parserState)
      undefineOnlyLastMentionedUnitPosition(parserState)
      return { mentionedPositions }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['slur goes through above|below unit'] = {
    requiredCommandProgression: 'slur goes through unit',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isAboveBelowOverUnder(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.lastSShapeSlurPartDirection = parseDirectionByAboveBelowOverUnder(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  addUnitPositionScenarios(scenarios, 'slur goes through unit', 2, { measure: true, stave: true })
  scenarios['slur left point'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.leftPoint.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['slur left point vertical correction'] = {
    requiredCommandProgression: 'slur left point',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const verticalCorrectionValue = parseVerticalCorrection(tokenValues)
      addLeftYCorrectionToSlurMarkByKey(parserState, slurMarkKey, verticalCorrectionValue)
      parserState.lastSlurLeftYCorrection = verticalCorrectionValue
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['slur right point'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.rightPoint.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1,
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['slur right point vertical correction'] = {
    requiredCommandProgression: 'slur right point',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const verticalCorrectionValue = parseVerticalCorrection(tokenValues)
      addRightYCorrectionToSlurMarkByKey(parserState, slurMarkKey, verticalCorrectionValue)
      parserState.lastSlurRightYCorrection = verticalCorrectionValue
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['slur right point attached to middle of stem'] = {
    requiredCommandProgression: 'slur right point',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.attachedToMiddleOfStem.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const placementValue = 'middleStem'
      addRightPointPlacementToSlurMarkByKey(parserState, slurMarkKey, placementValue)
      parserState.lastSlurRightPointPlacement = placementValue
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['slur right point attached to note body'] = {
    requiredCommandProgression: 'slur right point',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.attachedToNoteBody.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      const placementValue = 'noteBody'
      addRightPointPlacementToSlurMarkByKey(parserState, slurMarkKey, placementValue)
      parserState.lastSlurRightPointPlacement = placementValue
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 2
  }
  scenarios['slur with s shape'] = {
    requiredCommandProgression: 'slur',
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.withSShape.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const slurMarkKey = `slur-${parserState.numberOfSlurs}`
      addSShapeToSlurMarkByKey(parserState, slurMarkKey)
      parserState.lastSlurWithSShape = true
      return { slurMarkKey }
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'slur',
    [
      'slur starts before unit',
      'slur finishes after unit',
      'slur starts at unit',
      'slur finishes at unit',
      'slur goes through unit',
      'slur left point',
      'slur right point'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
