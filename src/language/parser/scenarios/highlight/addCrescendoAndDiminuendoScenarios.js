'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['crescendo|diminuendo'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.crescendoOrDiminuendoHighlight, (match) => {
          return `<span class="eh" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['crescendo|diminuendo starts'] = {
    // the value before, if there is one, has its own ref-id; otherwise the span waits for the unit's position
    action: ({ tokenValues, joinedTokenValuesWithRealDelimiters, parserState, state }) => {
      if (regexps.startsWithTextValue.test(tokenValues)) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
          regexps.stringHighlight, (match) => {
            return `<span class="sth" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${match}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
        )
      } else if (regexps.startsWithTextValueFrom.test(tokenValues)) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
          regexps.stringHighlight, (match) => {
            return `<span class="sth" ref-id="crescendo-or-diminuendo-value-before-${parserState.numberOfDynamicMarks}">${match}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedString}`
        )
        state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
          state.highlightsHtmlBuffer.length - 1
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
        )
        state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
          state.highlightsHtmlBuffer.length - 1
        )
      }
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo starts', 2, { measure: true })
  scenarios['crescendo|diminuendo finishes'] = {
    // the value after, if there is one, has its own ref-id; otherwise the span waits for the unit's position
    action: ({ tokenValues, joinedTokenValuesWithRealDelimiters, parserState, state }) => {
      if (regexps.finishesWithTextValue.test(tokenValues)) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
          regexps.stringHighlight, (match) => {
            return `<span class="sth" ref-id="crescendo-or-diminuendo-value-after-${parserState.numberOfDynamicMarks}">${match}</span>`
          }
        )
        state.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="crescendo-or-diminuendo-value-after-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}`
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
        )
        state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
          state.highlightsHtmlBuffer.length - 1
        )
      }
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'crescendo|diminuendo finishes', 2, { measure: true })
  scenarios['crescendo|diminuendo direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['crescendo|diminuendo above or below stave'] = {
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
  scenarios['crescendo|diminuendo vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="crescendo-or-diminuendo-${parserState.numberOfDynamicMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'crescendo|diminuendo',
    [
      'crescendo|diminuendo starts',
      'crescendo|diminuendo finishes'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
