'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded from '#msq/language/parser/scenarios/highlight/fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight/addLineMeasureStaveVoicePositionScenarios.js'

const updateNoteAndRestRefIdsInHighlightsHtmlBufferThatFollowAfterSimileUnit = (state, { measureIndex, staveIndex, voiceIndex, singleChordIndex, simileCount }) => {
  state.highlightsHtmlBuffer.forEach((html, index) => {
    state.highlightsHtmlBuffer[index] = html.replaceAll(
      /rest-(\d+)-(\d+)-(\d+)-(\d+)/g, (match, g1, g2, g3, g4) => {
        g1 *= 1
        g2 *= 1
        g3 *= 1
        g4 *= 1
        if (
          (g1 === measureIndex + 1) &&
          (g2 === staveIndex + 1) &&
          (g3 === voiceIndex + 1) &&
          g4 > singleChordIndex + 1
        ) {
          return `rest-${g1}-${g2}-${g3}-${g4 + simileCount}`
        }
        return match
      }
    ).replaceAll(
      /unit-(\d+)-(\d+)-(\d+)-(\d+)/g, (match, g1, g2, g3, g4) => {
        g1 *= 1
        g2 *= 1
        g3 *= 1
        g4 *= 1
        if (
          (g1 === measureIndex + 1) &&
          (g2 === staveIndex + 1) &&
          (g3 === voiceIndex + 1) &&
          g4 > singleChordIndex + 1
        ) {
          return `unit-${g1}-${g2}-${g3}-${g4 + simileCount}`
        }
        return match
      }
    ).replaceAll(
      /note-(\d+)-(\d+)-(\d+)-(\d+)-(\d+)/g, (match, g1, g2, g3, g4, g5) => {
        g1 *= 1
        g2 *= 1
        g3 *= 1
        g4 *= 1
        if (
          (g1 === measureIndex + 1) &&
          (g2 === staveIndex + 1) &&
          (g3 === voiceIndex + 1) &&
          g4 > singleChordIndex + 1
        ) {
          return `note-${g1}-${g2}-${g3}-${g4 + simileCount}-${g5}`
        }
        return match
      }
    )
  })
}

export default function (scenarios) {
  scenarios['repeat simile'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.repeatSimileHighlight, (match) => {
          return `<span class="eh" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { unitsAfterSimile, mentionedPositions } }) => {
      if (unitsAfterSimile) {
        updateNoteAndRestRefIdsInHighlightsHtmlBufferThatFollowAfterSimileUnit(state, unitsAfterSimile)
      }
      fillAllPlaceholdersInHighlightsHtmlBufferWithMentionedPositionsWhereItsNeeded(state, mentionedPositions, true)
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['repeat simile previous beat'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['repeat simile previous beats'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['repeat simile count'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileCountHighlight, (match) => {
          return `<span class="cnh" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['repeat simile starts'] = {
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
  addUnitPositionScenarios(scenarios, 'repeat simile starts', 2, {})
  scenarios['repeat simile finishes'] = {
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
  addUnitPositionScenarios(scenarios, 'repeat simile finishes', 2, {})
  scenarios['repeat simile vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="cnh" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'repeat simile',
    [
      'repeat simile starts',
      'repeat simile finishes'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
