'use strict'

import getMentionedPositions from '#msq/language/parser/scenarios/page-schema/getMentionedPositions.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import undefineOnlyLastMentionedUnitPosition from '#msq/language/parser/scenarios/page-schema/undefineOnlyLastMentionedUnitPosition.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['slur'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.slurHighlight, (match) => {
          return `<span class="eh" ref-id="slur-${parserState.numberOfSlurs}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="eh" ref-id="slur-${parserState.numberOfSlurs}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { mentionedPositions } }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['slur starts before unit'] = {
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
  addUnitPositionScenarios(scenarios, 'slur starts before unit', 2, { measure: true, stave: true })
  scenarios['slur starts before above|below unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['slur finishes after unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimiters}`
      )
      state.indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders.push(
        state.highlightsHtmlBuffer.length - 1
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ parserState, state }) => {
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, getMentionedPositions(parserState))
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
      undefineOnlyLastMentionedUnitPosition(parserState)
    }
  }
  addUnitPositionScenarios(scenarios, 'slur finishes after unit', 2, { measure: true, stave: true })
  scenarios['slur finishes after above|below unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['slur starts at unit'] = {
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
  addUnitPositionScenarios(scenarios, 'slur starts at unit', 2, { measure: true, stave: true })
  scenarios['slur starts above|below unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['slur finishes at unit'] = {
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
  addUnitPositionScenarios(scenarios, 'slur finishes at unit', 2, { measure: true, stave: true })
  scenarios['slur finishes above|below unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['slur direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['slur above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['slur roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th" ref-id="${slurMarkKey}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['slur goes through unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th">${joinedTokenValuesWithRealDelimiters}`
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
  scenarios['slur goes through above|below unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  addUnitPositionScenarios(scenarios, 'slur goes through unit', 2, { measure: true, stave: true })
  scenarios['slur left point'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['slur left point vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="${slurMarkKey}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['slur right point'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['slur right point vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="${slurMarkKey}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['slur right point attached to middle of stem'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['slur right point attached to note body'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['slur with s shape'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { slurMarkKey } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="${slurMarkKey}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
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
