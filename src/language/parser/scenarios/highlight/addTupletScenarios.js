'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['tuplet'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithSplittedParts = joinedTokenValuesWithRealDelimiters.split(regexps.tupletHighlight)
      const joinedTokenValuesWithRealDelimitersFirstPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[0]
      const joinedTokenValuesWithRealDelimitersSecondPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[1]
      const joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPart}<span class="eh" ref-id="tuplet-${parserState.numberOfTuplets}">tuplet</span>`
      const joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement = joinedTokenValuesWithRealDelimitersSecondPart.replace(
        regexps.tupletValueHighlight, (match) => {
          return `<span class="cnh" ref-id="tuplet-value-${parserState.numberOfTuplets}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement}${joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement}`
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tuplet-${parserState.numberOfTuplets}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['tuplet starts before unit'] = {
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
  addUnitPositionScenarios(scenarios, 'tuplet starts before unit', 2, { measure: true })
  scenarios['tuplet finishes after unit'] = {
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
  addUnitPositionScenarios(scenarios, 'tuplet finishes after unit', 2, { measure: true })
  scenarios['tuplet starts at unit'] = {
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
  addUnitPositionScenarios(scenarios, 'tuplet starts at unit', 2, { measure: true })
  scenarios['tuplet finishes at unit'] = {
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
  addUnitPositionScenarios(scenarios, 'tuplet finishes at unit', 2, { measure: true })
  scenarios['tuplet with direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['tuplet above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['tuplet is above or below stave lines'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['tuplet with brackets'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.bracketsHighlight, (match) => {
          return `<span class="th" ref-id="tuplet-brackets-${parserState.numberOfTuplets}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tuplet-brackets-${parserState.numberOfTuplets}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['tuplet with vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="tuplet-${parserState.numberOfTuplets}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tuplet-${parserState.numberOfTuplets}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
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
