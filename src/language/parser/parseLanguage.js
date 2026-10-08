'use strict'

import createParserScenarios from '#msq/language/parser/scenarios/createParserScenarios.js'
import mapWithScenariosAndScenariosWhereItIsRequired from '#msq/language/parser/scenarios/mapWithScenariosAndScenariosWhereItIsRequired.js'
const parserScenarios = createParserScenarios()
const constructedMapWithScenariosAndScenariosWhereItIsRequired = mapWithScenariosAndScenariosWhereItIsRequired(parserScenarios)

import removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem from '#msq/language/parser/scenarios/token/removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem.js'
import extractTokenValuesFromTokens from '#msq/language/parser/scenarios/token/extractTokenValuesFromTokens.js'
import joinTokensWithRealDelimiters from '#msq/language/parser/scenarios/token/joinTokensWithRealDelimiters.js'

const NEW_LINE_REGEXP = /[\r\n|\r|\n]/
const SPACE_REGEXP = /[\s]/
const EMPTY_STRING = ''
const REGULAR = 'regular'
const ON_EMPTY_LINE = 'on empty line'
const LAST_CHAR = 'last char'
const LAST_LEVEL = 'last level'

const runParserScenarios = (createParserScenarios, typeOfScenarios, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, itIsLastChar, currentToken, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimetersAfterEachToken, parserState, queueOfActionsOnProgressionOfCommandsChange) => {
  const tokenValues = extractTokenValuesFromTokens(tokenAccumulator)
  const tokenValuesWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem = removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem(tokenAccumulator)
  const joinedTokenValuesWithRealDelimiters = joinTokensWithRealDelimiters(tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimetersAfterEachToken)
  const scenarioNamesThatFollowProgressionOfCommand = []
  if (progressionOfCommandsFromScenarios.length > 0) {
    for (let scenarioNameIndex = 0; scenarioNameIndex < progressionOfCommandsFromScenarios.length; scenarioNameIndex++) {
      const scenarioName = progressionOfCommandsFromScenarios[scenarioNameIndex]
      if (constructedMapWithScenariosAndScenariosWhereItIsRequired[scenarioName] && (constructedMapWithScenariosAndScenariosWhereItIsRequired[scenarioName].length > 0)) {
        scenarioNamesThatFollowProgressionOfCommand.push(...constructedMapWithScenariosAndScenariosWhereItIsRequired[scenarioName])
      }
    }
  }
  scenarioNamesThatFollowProgressionOfCommand.push(...constructedMapWithScenariosAndScenariosWhereItIsRequired.common)
  for (let scenarioNameIndex = 0; scenarioNameIndex < scenarioNamesThatFollowProgressionOfCommand.length; scenarioNameIndex++) {
    const scenarioName = scenarioNamesThatFollowProgressionOfCommand[scenarioNameIndex]
    const scenario = createParserScenarios[scenarioName]
    const isScenarioOnTheSameLineAsPreviousScenarioOrItDoesnMatter = scenario.onTheSameLineAsPrevScenario
      ? (lineNumber === lastScenarioLineNumber.value)
      : true
    if (!isScenarioOnTheSameLineAsPreviousScenarioOrItDoesnMatter) {
      continue
    }
    const isScenarioStartsOnNewLineOrItDoesntMatter = scenario.startsOnNewLine
      ? ((lineNumber > lastScenarioLineNumber.value) || (numberOfActivatedScenarios.value === 0))
      : true
    if (!isScenarioStartsOnNewLineOrItDoesntMatter) {
      continue
    }
    let areThereAnyProhibitedScenariosThatAreInProgressOrItDoesntMatter = false
    if (scenario.prohibitedCommandProgressions) {
      for (let index = 0; index < scenario.prohibitedCommandProgressions.length; index++) {
        if (progressionOfCommandsFromScenarios.indexOf(scenario.prohibitedCommandProgressions[index]) !== -1) {
          areThereAnyProhibitedScenariosThatAreInProgressOrItDoesntMatter = true
          break
        }
      }
    }
    if (areThereAnyProhibitedScenariosThatAreInProgressOrItDoesntMatter) {
      continue
    }
    const finalTokenValues = scenario.considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem
      ? tokenValuesWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem
      : tokenValues
    scenario.type = scenario.type || REGULAR
    if (currentToken) {
      currentToken.isOnNewLine = (lineNumber > lastScenarioLineNumber.value || (numberOfActivatedScenarios.value === 0))
    }
    if (scenario.type === typeOfScenarios) {
      const scenarioConditionIsMet = scenario.condition(unitext, lineNumber, currentToken, finalTokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState)
      if (scenarioConditionIsMet) {
        if (scenario.itIsNewCommandProgressionFromLevel !== undefined) {
          if (scenario.itIsNewCommandProgressionFromLevel !== LAST_LEVEL) {
            progressionOfCommandsFromScenarios.splice(scenario.itIsNewCommandProgressionFromLevel)
          }
          progressionOfCommandsFromScenarios.push(scenarioName)
          if (!parserState.applyOnlyHighlightingWithoutRefIds || !parserState.applyHighlighting) {
            for (let actionIndex = 0; actionIndex < queueOfActionsOnProgressionOfCommandsChange.length; actionIndex++) {
              const currentActionOnProgressionOfCommandsChange = queueOfActionsOnProgressionOfCommandsChange[actionIndex]
              if (
                (progressionOfCommandsFromScenarios.indexOf(currentActionOnProgressionOfCommandsChange.scenarioName) === -1) ||
                (progressionOfCommandsFromScenarios.indexOf(currentActionOnProgressionOfCommandsChange.scenarioName) === (progressionOfCommandsFromScenarios.length - 1))
              ) {
                const scenarioNameThatChangedCommandsProgression = scenarioName
                currentActionOnProgressionOfCommandsChange.action(parserState, scenarioNameThatChangedCommandsProgression, lineNumber, currentActionOnProgressionOfCommandsChange.argumentsFromMainAction)
                queueOfActionsOnProgressionOfCommandsChange.splice(actionIndex, 1)
                actionIndex--
              }
            }
            if (scenario.actionWhenProgressionOfCommandsChanges) {
              queueOfActionsOnProgressionOfCommandsChange.unshift({
                scenarioName,
                scenarioType: scenario.type,
                levelOfCommandProgression: scenario.itIsNewCommandProgressionFromLevel,
                action: scenario.actionWhenProgressionOfCommandsChanges,
                activateOnLastToken: scenario.activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore,
                argumentsFromMainAction: {
                  unitext,
                  lineNumber,
                  currentToken,
                  tokenValues: finalTokenValues,
                  joinedTokenValuesWithRealDelimiters,
                  progressionOfCommandsFromScenarios
                }
              })
            }
          }
        }
        if (parserState.applyHighlighting && parserState.applyOnlyHighlightingWithoutRefIds) {
          scenario.actionOnlyForHighlightingWithoutRefIds(parserState, joinedTokenValuesWithRealDelimiters, finalTokenValues)
        } else {
          scenario.action(unitext, lineNumber, currentToken, finalTokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState)
        }
        tokenAccumulator.length = 0
        lastScenarioLineNumber.value = lineNumber
        numberOfActivatedScenarios.value += 1
        break
      }
    }
  }
}

export default function (
  unitext,
  progressionOfCommandsFromScenarios = [],
  applyHighlighting = true,
  applyOnlyHighlightingWithoutRefIds = true,
  fonts = {
    'chord-letters': ['gentium plus', 'gothic a1'],
    'music': ['bravura', 'leland'],
    'text': ['noto-sans', 'noto-serif']
  }
) {
  const mapOfCharIndexesWithProgressionOfCommandsFromScenarios = {}
  const numberOfActivatedScenarios = {
    value: 0
  }
  const queueOfActionsOnProgressionOfCommandsChange = []
  const parserState = {
    pageSchema: {},
    fonts,
    highlightsHtmlBuffer: [],
    applyHighlighting,
    applyOnlyHighlightingWithoutRefIds,
    indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders: [],
    indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection: [],
    indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord: [],
    lastMentionedStyleKey: undefined,
    lastMentionedMidiSettingKey: undefined,
    lastMentionedUnitPosition: undefined,
    lastMentionedPageLinePosition: undefined,
    lastMentionedMeasurePosition: undefined,
    lastMentionedStavePosition: undefined,
    lastMentionedVoicePosition: undefined,
    unitPageLineIndexByLastMentionedPositions: undefined,
    unitMeasureIndexByLastMentionedPositions: undefined,
    unitStaveIndexByLastMentionedPositions: undefined,
    unitVoiceIndexByLastMentionedPositions: undefined,
    unitIndexByLastMentionedPositions: undefined,
    lastMentionedConnectionPageLinePosition: undefined,
    lastMentionedConnectionMeasurePosition: undefined,
    lastMentionedConnectionStavePosition: undefined,
    lastMentionedConnectionVoicePosition: undefined,
    lastMentionedNoteIndex: undefined,
    lastMentionedUnitsCompression: undefined,
    lastMentionedUnitsCompressionWasForSpecificLine: false,
    lastMentionedUnitsStretching: undefined,
    lastMentionedUnitsStretchingWasForAllLines: false,
    numberOfChordsBeforeFinishingDeclaringNewOne: 0,
    newlineAlreadyIntroducedNewMeasure: false,
    customStyles: { },
    midiSettings: { },
    errors: [],
    comments: [],
    emptyLineNumbers: [],
    numberOfPageLines: 0,
    lastClef: {},
    lastChordDuration: {},
    lastStemDirection: {},
    lastStavePosition: {},
    lastBeamStatus: {},
    keysOfLastNote: [],
    lastNoteTextValue: undefined,
    lastNoteTextPositionApplicationToNote: undefined,
    lastGhostStatus: {},
    chordIsActivatedInPreviousCommand: false,
    chordScopeIsActive: false,
    lastCrossStaveConnectionsParamsForEachLine: undefined,
    lastCrossStaveConnectionsParamsForEachLineId: 1,
    lastInstrumentTitlesParams: undefined,
    lastInstrumentTitlesParamsForEachLineId: 1,
    lastKeySignatureName: undefined,
    lastKeySignatureNameForEachLineId: 0,
    lastClefNames: [],
    lastTimeSignatureParams: undefined,
    lastTimeSignatureValueForEachLineId: 1,
    numberOfGlissandos: 0,
    numberOfSlurs: 0,
    slurMarkChords: {},
    lastSlurDirection: undefined,
    lastSShapeSlurPartDirection: undefined,
    lastSlurRoundness: undefined,
    lastSlurLeftYCorrection: undefined,
    lastSlurRightYCorrection: undefined,
    lastSlurWithSShape: undefined,
    lastSlurRightPointPlacement: undefined,
    lastGlissandoDirection: undefined,
    lastGlissandoForm: undefined,
    lastDeclaredGlissando: undefined,
    lastGlissandoBeforeMeasure: undefined,
    lastGlissandoAfterMeasure: undefined,
    numberOfTuplets: 0,
    lastTupletValue: undefined,
    lastChordParamsWithFinishedTupletMarkThatStartedBefore: undefined,
    lastChordParamsWithStartedTupletMark: undefined,
    lastTupletDirection: undefined,
    lastTupletIsAboveOrBelowStaveLines: undefined,
    lastTupletWithBrackets: undefined,
    lastTupletVerticalCorrection: undefined,
    lastChordLetterDirection: undefined,
    numberOfOctaveSignMarks: 0,
    numberOfDynamicMarks: 0,
    numberOfSimileMarks: 0,
    numberOfVoltaMarks: 0,
    numberOfPedalMarks: 0
  }
  const currentTokenChars = []
  const currentLineChars = []
  const allPrevTokens = []
  const prevTokensOnTheLine = []
  const tokenAccumulator = []
  const delimitersBeforeFirstTokenOnTheLine = []
  const delimetersAfterEachToken = []
  let firstTokenIsBehindOnTheLine = false
  let lineNumber = 1
  let tokenNumber = 0
  const lastScenarioLineNumber = {
    value: lineNumber
  }
  for (let charIndex = 0; charIndex < unitext.length; charIndex++) {
    const currentChar = unitext[charIndex]
    const nextChar = unitext[charIndex + 1]
    const itIsLastChar = !nextChar
    const itIsNewLineChar = NEW_LINE_REGEXP.test(currentChar)
    const itIsDelimeterBetweenTokens = SPACE_REGEXP.test(currentChar)
    const nextIsDelimeterBetweenTokens = nextChar && SPACE_REGEXP.test(nextChar)
    if (!itIsDelimeterBetweenTokens) {
      const sinceItIsNonDelimeterCharWeCanAssumeThatWeDontNeedToCollectDelimeterCharsBeforeForstToken = true
      firstTokenIsBehindOnTheLine = sinceItIsNonDelimeterCharWeCanAssumeThatWeDontNeedToCollectDelimeterCharsBeforeForstToken
      currentTokenChars.push(currentChar)
      currentLineChars.push(currentChar)
      if (!itIsLastChar) {
        mapOfCharIndexesWithProgressionOfCommandsFromScenarios[charIndex] = progressionOfCommandsFromScenarios.slice()
        continue
      }
    } else {
      if (!firstTokenIsBehindOnTheLine) {
        delimitersBeforeFirstTokenOnTheLine.push(currentChar)
      }
    }
    if (currentTokenChars.length > 0) {
      const noProcessedTokensOnTheLine = prevTokensOnTheLine.length === 0
      const firstTokenInProcessing = tokenNumber === 0
      const prevTokenOnTheLine = prevTokensOnTheLine[prevTokensOnTheLine.length - 1]
      const prevToken = allPrevTokens[allPrevTokens.length - 1]
      const currentToken = (
        prevTokenOnTheLine &&
        prevTokenOnTheLine.tokenNumber === tokenNumber
      ) ? prevTokenOnTheLine
        : {
          value: currentTokenChars.join(EMPTY_STRING),
          tokenNumber
        }
      currentToken.firstOnTheLine = firstTokenInProcessing || (prevToken && prevToken.lastOnTheLine)
      currentToken.lastOnTheLine = itIsNewLineChar || itIsLastChar
      delimetersAfterEachToken[tokenNumber] = delimetersAfterEachToken[tokenNumber] || []
      if (itIsDelimeterBetweenTokens) {
        delimetersAfterEachToken[tokenNumber].push(currentChar)
      }
      if (!nextIsDelimeterBetweenTokens || currentToken.lastOnTheLine) {
        currentToken.firstCharIndexOfNextToken = charIndex + 1
        tokenAccumulator.push(currentToken)
        runParserScenarios(parserScenarios, REGULAR, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, itIsLastChar, currentToken, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimetersAfterEachToken, parserState, queueOfActionsOnProgressionOfCommandsChange)
        const tokenIsNew = noProcessedTokensOnTheLine
          ? true
          : prevTokenOnTheLine.tokenNumber !== tokenNumber
        if (tokenIsNew) {
          prevTokensOnTheLine.push(currentToken)
          allPrevTokens.push(currentToken)
        }
        const nextTokenToBeConsideredOnNextIteration = itIsNewLineChar || !nextIsDelimeterBetweenTokens || itIsLastChar
        if (nextTokenToBeConsideredOnNextIteration) {
          tokenNumber += 1
          currentTokenChars.length = 0
        }
        const currentTokenIsLastOnTheLineThereforeWeNeedToStartCollectingDelimeterCharsBeforeNextFirstTokenOnTheLine = currentToken.lastOnTheLine
        if (currentTokenIsLastOnTheLineThereforeWeNeedToStartCollectingDelimeterCharsBeforeNextFirstTokenOnTheLine) {
          firstTokenIsBehindOnTheLine = false
          delimitersBeforeFirstTokenOnTheLine.length = 0
        }
      }
    } else {
      if (parserState.applyHighlighting && itIsLastChar && itIsDelimeterBetweenTokens && (parserState.highlightsHtmlBuffer !== undefined)) {
        parserState.highlightsHtmlBuffer.push(delimitersBeforeFirstTokenOnTheLine.join(EMPTY_STRING))
      }
    }
    if (itIsNewLineChar) {
      if (currentLineChars.join(EMPTY_STRING).length === 0 && parserState.emptyLineNumbers !== undefined) {
        parserState.emptyLineNumbers.push(lineNumber)
        runParserScenarios(parserScenarios, ON_EMPTY_LINE, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, itIsLastChar, undefined, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimetersAfterEachToken, parserState, queueOfActionsOnProgressionOfCommandsChange)
      }
      lineNumber += 1
      prevTokensOnTheLine.length = 0
      currentLineChars.length = 0
      tokenAccumulator.length = 0
    }
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios[charIndex] = progressionOfCommandsFromScenarios.slice()
  }
  if (!applyOnlyHighlightingWithoutRefIds || !applyHighlighting) {
    for (let actionIndex = 0; actionIndex < queueOfActionsOnProgressionOfCommandsChange.length; actionIndex++) {
      const currentActionOnProgressionOfCommandsChange = queueOfActionsOnProgressionOfCommandsChange[actionIndex]
      if (currentActionOnProgressionOfCommandsChange.activateOnLastToken) {
        const scenarioNameThatChangedCommandsProgression = LAST_CHAR
        currentActionOnProgressionOfCommandsChange.action(parserState, scenarioNameThatChangedCommandsProgression, lineNumber, currentActionOnProgressionOfCommandsChange.argumentsFromMainAction)
      }
    }
  }
  if (!parserState.applyHighlighting) {
    if (parserState.highlightsHtmlBuffer.length !== 0) {
      throw new Error('parserState.highlightsHtmlBuffer.length is 0, although !parserState.applyHighlighting')
    }
    parserState.highlightsHtmlBuffer = [ unitext ]
  }
  const object = {
    pageSchema: parserState.pageSchema,
    highlightsHtmlBuffer: parserState.highlightsHtmlBuffer,
    customStyles: parserState.customStyles,
    errors: parserState.errors,
    comments: parserState.comments,
    midiSettings: parserState.midiSettings,
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios
  }
  return object
}
