'use strict'

import createParserScenarios from '#msq/language/parser/scenarios/createParserScenarios.js'
import mapWithScenariosAndScenariosWhereItIsRequired from '#msq/language/parser/scenarios/mapWithScenariosAndScenariosWhereItIsRequired.js'
import adapters from '#msq/language/parser/scenarios/adapterDefinitions.js'
import removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem from '#msq/language/parser/scenarios/token/removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem.js'
import extractTokenValuesFromTokens from '#msq/language/parser/scenarios/token/extractTokenValuesFromTokens.js'
import joinTokensWithRealDelimiters from '#msq/language/parser/scenarios/token/joinTokensWithRealDelimiters.js'

// All scenarios, indexed by name; each one is a rule: a `condition` plus an
// `action` (and an `actionWhenProgressionOfCommandsChanges`).
const parserScenarios = createParserScenarios()
// scenarios by the progression they require, plus a `common` bucket: which
// scenarios are candidates to check next, given the progression in progress.
const scenariosByRequiredProgression = mapWithScenariosAndScenariosWhereItIsRequired(parserScenarios)

// Whitespace is tested once per character in the hot scan loop, so use plain
// comparisons instead of a regexp. `\s` also matches a few exotic characters
// (`\u00a0`, `\u1680`, `\u2000`-`\u200a`, `\u2028`, `\u2029`, `\u202f`, `\u205f`,
// `\u3000`, `\ufeff`) that never appear in MSQ text, so they are omitted here.
const isWhitespace = (char) => (
  char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '\f' || char === '\v'
)
const EMPTY_STRING = ''
const REGULAR = 'regular'
const ON_EMPTY_LINE = 'on empty line'
const LAST_CHAR = 'last char'
const LAST_LEVEL = 'last level'

// --- parser state -----------------------------------------------------------

// The one mutable object every scenario reads and writes (the page schema, the
// "last mentioned …" pointers, counters, etc.). Kept in one place so it's easy
// to see what the scenarios can touch.
const createParserState = (fonts) => ({
  pageSchema: {},
  fonts,
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
})

// --- deferred actions on a change of command progression ----------------------

// A scenario that changed the progression queues its "when the progression
// changes" action; it runs later, when a later command supersedes it. Main's
// action runs first, then each adapter's, with what main returned.
const runActionOnProgressionOfCommandsChange = (queuedAction, parserState, changedScenarioName, lineNumber) => {
  const fromMain = queuedAction.action
    ? queuedAction.action(parserState, changedScenarioName, lineNumber, queuedAction.argumentsFromMainAction)
    : undefined
  for (const { action, state } of queuedAction.adapterActions) {
    action({
      parserState,
      state,
      scenarioNameThatChangedCommandsProgression: changedScenarioName,
      lineNumber,
      argumentsFromMainAction: queuedAction.argumentsFromMainAction,
      fromMain
    })
  }
}

// --- scenario runner ---------------------------------------------------------

// Runs once per completed token (or empty line). Builds the candidate list from
// the current progression, checks each candidate's `condition` against the
// accumulated tokens, and runs the first one that matches.
const runParserScenarios = (createParserScenarios, typeOfScenarios, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, isLastChar, currentToken, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimitersAfterEachToken, parserState, progressionChangeQueue, run) => {
  const tokenValues = extractTokenValuesFromTokens(tokenAccumulator)
  // Computed lazily: only scenarios with
  // `considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem`
  // need it, and most tokens never match one of those.
  let tokenValuesWithoutCommandDelimiters
  const joinedTokenValuesWithRealDelimiters = joinTokensWithRealDelimiters(tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimitersAfterEachToken)

  // which scenarios could match next: those that require any progression now in
  // progress, followed by the ones that require nothing.
  let candidateScenarioNames = []
  if (progressionOfCommandsFromScenarios.length > 0) {
    for (let scenarioNameIndex = 0; scenarioNameIndex < progressionOfCommandsFromScenarios.length; scenarioNameIndex++) {
      const scenarioName = progressionOfCommandsFromScenarios[scenarioNameIndex]
      if (scenariosByRequiredProgression[scenarioName] && (scenariosByRequiredProgression[scenarioName].length > 0)) {
        candidateScenarioNames.push(...scenariosByRequiredProgression[scenarioName])
      }
    }
  }
  candidateScenarioNames.push(...scenariosByRequiredProgression.common)

  // Fast dispatch: a scenario may declare which first token can start it
  // (`leadingTokens`). Only those scenarios (plus every untagged one) then have
  // their `condition` evaluated, which is the dominant cost of parsing. Order is
  // preserved, and untagged scenarios are always checked, so tagging is safe to
  // roll out incrementally.
  if (scenariosByRequiredProgression.hasLeadingTokens) {
    // The key is the first token that is not a command delimiter (`and`, `,`,
    // `;`) with any trailing delimiter stripped off — the same value that a
    // scenario with `considerJoinedTokenAccumulatorWithoutCommandDelimiters…`
    // sees as its first token. A scenario whose leading token doesn't match can
    // never have its condition met, so it is skipped here.
    let firstTokenValue
    for (const tokenValue of tokenValues) {
      let value = tokenValue
      let end = value.length
      while (end > 0 && (value[end - 1] === ',' || value[end - 1] === ';')) {
        end -= 1
      }
      if (end !== value.length) {
        value = value.slice(0, end)
      }
      if (value !== '' && value !== 'and' && value !== ',' && value !== ';') {
        firstTokenValue = value
        break
      }
    }
    if (firstTokenValue !== undefined) {
      const filtered = []
      for (const scenarioName of candidateScenarioNames) {
        const scenario = createParserScenarios[scenarioName]
        if (!scenario.leadingTokens || scenario.leadingTokens.indexOf(firstTokenValue) !== -1) {
          filtered.push(scenarioName)
        }
      }
      candidateScenarioNames = filtered
    }
  }

  for (let scenarioNameIndex = 0; scenarioNameIndex < candidateScenarioNames.length; scenarioNameIndex++) {
    const scenarioName = candidateScenarioNames[scenarioNameIndex]
    const scenario = createParserScenarios[scenarioName]

    const onTheSameLine = scenario.onTheSameLineAsPrevScenario
      ? (lineNumber === lastScenarioLineNumber.value)
      : true
    if (!onTheSameLine) {
      continue
    }

    const startsOnNewLine = scenario.startsOnNewLine
      ? ((lineNumber > lastScenarioLineNumber.value) || (numberOfActivatedScenarios.value === 0))
      : true
    if (!startsOnNewLine) {
      continue
    }

    let hasProhibitedProgression = false
    if (scenario.prohibitedCommandProgressions) {
      for (let index = 0; index < scenario.prohibitedCommandProgressions.length; index++) {
        if (progressionOfCommandsFromScenarios.indexOf(scenario.prohibitedCommandProgressions[index]) !== -1) {
          hasProhibitedProgression = true
          break
        }
      }
    }
    if (hasProhibitedProgression) {
      continue
    }

    const finalTokenValues = scenario.considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem
      ? (tokenValuesWithoutCommandDelimiters ??= removeCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem(tokenAccumulator))
      : tokenValues
    scenario.type = scenario.type || REGULAR
    if (currentToken) {
      currentToken.isOnNewLine = (lineNumber > lastScenarioLineNumber.value || (numberOfActivatedScenarios.value === 0))
    }

    if (scenario.type !== typeOfScenarios) {
      continue
    }

    const conditionIsMet = scenario.condition(unitext, lineNumber, currentToken, finalTokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState)
    if (!conditionIsMet) {
      continue
    }

    // the command matched: record the new progression level
    if (scenario.itIsNewCommandProgressionFromLevel !== undefined) {
      if (scenario.itIsNewCommandProgressionFromLevel !== LAST_LEVEL) {
        progressionOfCommandsFromScenarios.splice(scenario.itIsNewCommandProgressionFromLevel)
      }
      progressionOfCommandsFromScenarios.push(scenarioName)
      if (run.runMain) {
        // run queued progression-change actions that are now superseded
        for (let actionIndex = 0; actionIndex < progressionChangeQueue.length; actionIndex++) {
          const currentAction = progressionChangeQueue[actionIndex]
          if (
            (progressionOfCommandsFromScenarios.indexOf(currentAction.scenarioName) === -1) ||
            (progressionOfCommandsFromScenarios.indexOf(currentAction.scenarioName) === (progressionOfCommandsFromScenarios.length - 1))
          ) {
            runActionOnProgressionOfCommandsChange(currentAction, parserState, scenarioName, lineNumber)
            progressionChangeQueue.splice(actionIndex, 1)
            actionIndex--
          }
        }
        // queue this scenario's own progression-change action (if any) for later
        const adapterActionsOnProgressionOfCommandsChange = run.adapters
          .filter(({ adapter }) => scenario.adapters[adapter.name] && scenario.adapters[adapter.name].actionWhenProgressionOfCommandsChanges)
          .map(({ adapter, state }) => ({ action: scenario.adapters[adapter.name].actionWhenProgressionOfCommandsChanges, state }))
        if (scenario.actionWhenProgressionOfCommandsChanges || adapterActionsOnProgressionOfCommandsChange.length > 0) {
          progressionChangeQueue.unshift({
            scenarioName,
            scenarioType: scenario.type,
            levelOfCommandProgression: scenario.itIsNewCommandProgressionFromLevel,
            action: scenario.actionWhenProgressionOfCommandsChanges,
            adapterActions: adapterActionsOnProgressionOfCommandsChange,
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

    // run the matched scenario's action: main first, then each adapter
    const fromMain = (run.runMain && scenario.action)
      ? scenario.action(unitext, lineNumber, currentToken, finalTokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState)
      : undefined
    for (const { adapter, state } of run.adapters) {
      const adapterScenario = scenario.adapters[adapter.name]
      if (adapterScenario && adapterScenario.action) {
        adapterScenario.action({
          unitext,
          lineNumber,
          currentToken,
          tokenValues: finalTokenValues,
          joinedTokenValuesWithRealDelimiters,
          progressionOfCommandsFromScenarios,
          parserState,
          state,
          fromMain
        })
      }
    }

    // the command is consumed
    tokenAccumulator.length = 0
    lastScenarioLineNumber.value = lineNumber
    numberOfActivatedScenarios.value += 1
    break
  }
}

// --- parseLanguage -----------------------------------------------------------

/*
runMain: whether the main scenarios run (they build the page schema, errors, comments,
styles and MIDI settings). adapterNames: the adapters that run as well, or instead when
runMain is false (see scenarios/adapterDefinitions.js and README.md).
*/
export default function (
  unitext,
  progressionOfCommandsFromScenarios = [],
  {
    runMain = true,
    adapterNames = [],
    mapCharIndexes = true,
    fonts = {
      'chord-letters': [ 'gentium plus', 'gothic a1' ],
      'music': [ 'bravura', 'leland' ],
      'text': [ 'noto-sans', 'noto-serif' ]
    }
  } = {}
) {
  const run = {
    runMain,
    adapters: adapterNames.map((adapterName) => {
      const adapter = adapters[adapterName]
      if (!adapter) {
        throw new Error(`there is no adapter '${adapterName}'`)
      }
      if (adapter.runsWithMain !== runMain) {
        throw new Error(`adapter '${adapterName}' runs ${adapter.runsWithMain ? 'with' : 'without'} the main scenarios`)
      }
      return { adapter, state: undefined }
    })
  }

  const progressionByCharIndex = {}
  const numberOfActivatedScenarios = {
    value: 0
  }
  const progressionChangeQueue = []
  const parserState = createParserState(fonts)
  for (const activeAdapter of run.adapters) {
    activeAdapter.state = activeAdapter.adapter.createState(parserState)
  }

  // scan buffers
  const currentTokenChars = []
  const currentLineChars = []
  const allPrevTokens = []
  const prevTokensOnTheLine = []
  const tokenAccumulator = []
  const delimitersBeforeFirstTokenOnTheLine = []
  const delimitersAfterEachToken = []

  let lineStarted = false
  let lineNumber = 1
  let tokenNumber = 0
  const lastScenarioLineNumber = {
    value: lineNumber
  }

  // scan the input character by character, building tokens and running scenarios
  for (let charIndex = 0; charIndex < unitext.length; charIndex++) {
    const currentChar = unitext[charIndex]
    const nextChar = unitext[charIndex + 1]
    const isLastChar = !nextChar
    const isNewLineChar = currentChar === '\n' || currentChar === '\r' || currentChar === '|'
    const isDelimiter = isWhitespace(currentChar)
    const nextIsDelimiter = nextChar !== undefined && isWhitespace(nextChar)

    if (!isDelimiter) {
      // a non-delimiter char belongs to the token being built
      lineStarted = true
      currentTokenChars.push(currentChar)
      currentLineChars.push(currentChar)
      if (!isLastChar) {
        if (mapCharIndexes) progressionByCharIndex[charIndex] = progressionOfCommandsFromScenarios.slice()
        continue
      }
    } else if (!lineStarted) {
      // leading whitespace before the first token on the line
      delimitersBeforeFirstTokenOnTheLine.push(currentChar)
    }

    if (currentTokenChars.length > 0) {
      // a token is complete: finalize it and run the scenarios against the accumulator
      const isFirstTokenOnLine = prevTokensOnTheLine.length === 0
      const isFirstTokenOverall = tokenNumber === 0
      const prevTokenOnTheLine = prevTokensOnTheLine[prevTokensOnTheLine.length - 1]
      const prevToken = allPrevTokens[allPrevTokens.length - 1]
      const currentToken = (
        prevTokenOnTheLine &&
        prevTokenOnTheLine.tokenNumber === tokenNumber
      )
        ? prevTokenOnTheLine
        : {
            value: currentTokenChars.join(EMPTY_STRING),
            tokenNumber
          }
      currentToken.firstOnTheLine = isFirstTokenOverall || (prevToken && prevToken.lastOnTheLine)
      currentToken.lastOnTheLine = isNewLineChar || isLastChar
      delimitersAfterEachToken[tokenNumber] = delimitersAfterEachToken[tokenNumber] || []
      if (isDelimiter) {
        delimitersAfterEachToken[tokenNumber].push(currentChar)
      }
      if (!nextIsDelimiter || currentToken.lastOnTheLine) {
        currentToken.firstCharIndexOfNextToken = charIndex + 1
        tokenAccumulator.push(currentToken)
        runParserScenarios(parserScenarios, REGULAR, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, isLastChar, currentToken, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimitersAfterEachToken, parserState, progressionChangeQueue, run)
        const tokenIsNew = isFirstTokenOnLine
          ? true
          : prevTokenOnTheLine.tokenNumber !== tokenNumber
        if (tokenIsNew) {
          prevTokensOnTheLine.push(currentToken)
          allPrevTokens.push(currentToken)
        }
        const tokenIsComplete = isNewLineChar || !nextIsDelimiter || isLastChar
        if (tokenIsComplete) {
          tokenNumber += 1
          currentTokenChars.length = 0
        }
        if (currentToken.lastOnTheLine) {
          lineStarted = false
          delimitersBeforeFirstTokenOnTheLine.length = 0
        }
      }
    } else if (isLastChar && isDelimiter) {
      // trailing whitespace at the very end of the input
      const trailingWhitespace = delimitersBeforeFirstTokenOnTheLine.join(EMPTY_STRING)
      for (const { adapter, state } of run.adapters) {
        if (adapter.addTrailingWhitespace) {
          adapter.addTrailingWhitespace(state, trailingWhitespace)
        }
      }
    }

    if (isNewLineChar) {
      if (currentLineChars.join(EMPTY_STRING).length === 0 && parserState.emptyLineNumbers !== undefined) {
        parserState.emptyLineNumbers.push(lineNumber)
        runParserScenarios(parserScenarios, ON_EMPTY_LINE, numberOfActivatedScenarios, progressionOfCommandsFromScenarios, lastScenarioLineNumber, unitext, lineNumber, isLastChar, undefined, tokenAccumulator, delimitersBeforeFirstTokenOnTheLine, delimitersAfterEachToken, parserState, progressionChangeQueue, run)
      }
      lineNumber += 1
      prevTokensOnTheLine.length = 0
      currentLineChars.length = 0
      tokenAccumulator.length = 0
    }

    if (mapCharIndexes) {
      progressionByCharIndex[charIndex] = progressionOfCommandsFromScenarios.slice()
    }
  }

  // run any progression-change actions still queued that want the last token
  if (runMain) {
    for (let actionIndex = 0; actionIndex < progressionChangeQueue.length; actionIndex++) {
      const currentAction = progressionChangeQueue[actionIndex]
      if (currentAction.activateOnLastToken) {
        runActionOnProgressionOfCommandsChange(currentAction, parserState, LAST_CHAR, lineNumber)
      }
    }
  }

  const resultsOfAdapters = Object.assign({}, ...run.adapters.map(({ adapter, state }) => adapter.finish(state, unitext)))
  return {
    pageSchema: parserState.pageSchema,
    // without an adapter that highlights, the text as it is
    highlightsHtmlBuffer: [ unitext ],
    customStyles: parserState.customStyles,
    errors: parserState.errors,
    comments: parserState.comments,
    midiSettings: parserState.midiSettings,
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios: progressionByCharIndex,
    ...resultsOfAdapters
  }
}
