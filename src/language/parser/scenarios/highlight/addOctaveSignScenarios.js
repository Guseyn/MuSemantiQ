'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['octave sign'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.isOctaveOrTwoOctavesHigherOrLowerHighlight, (match) => {
          return `<span class="eh" ref-id="octave-sign-${parserState.numberOfOctaveSignMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="octave-sign-${parserState.numberOfOctaveSignMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['octave sign from unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
      state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
        state.highlightsHtmlBuffer.length - 1
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'octave sign from unit', 2, { measure: true })
  scenarios['octave sign to unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
      state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
        state.highlightsHtmlBuffer.length - 1
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'octave sign to unit', 2, { measure: true })
  scenarios['octave sign vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="octave-sign-${parserState.numberOfOctaveSignMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tuplet-${parserState.numberOfOctaveSignMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
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
