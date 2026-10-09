'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['volta'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.voltaBracketsHighlight, (match) => {
          return `<span class="eh" ref-id="volta-mark-${parserState.numberOfVoltaMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="volta-mark-${parserState.numberOfVoltaMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['volta with text'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="volta-mark-text-${parserState.numberOfVoltaMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="volta-mark-text-${parserState.numberOfVoltaMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['volta starts before'] = {
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
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta starts before', [], 2, false, { measure: true })
  scenarios['volta finishes after'] = {
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
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta finishes after', [], 2, false, { measure: true })
  scenarios['volta starts at'] = {
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
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta starts at', [], 2, false, { measure: true })
  scenarios['volta finishes at'] = {
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
  addLineMeasureStaveVoicePositionScenarios(scenarios, 'volta finishes at', [], 2, false, { measure: true })
  scenarios['volta vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="volta-mark-${parserState.numberOfVoltaMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="volta-mark-${parserState.numberOfVoltaMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
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
