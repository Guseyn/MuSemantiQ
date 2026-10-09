'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import addUnitPositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addUnitPositionScenarios.js'
import addLineMeasureStaveVoicePositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addLineMeasureStaveVoicePositionScenarios.js'

export default function (scenarios) {
  scenarios['glissando'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.glissandoHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['glissando starts before unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'glissando starts before unit', 2, { measure: true, stave: true })
  scenarios['glissando finishes after unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'glissando finishes after unit', 2, { measure: true, stave: true })
  scenarios['glissando starts at unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'glissando starts at unit', 2, { measure: true, stave: true })
  scenarios['glissando finishes at unit'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  addUnitPositionScenarios(scenarios, 'glissando finishes at unit', 2, { measure: true, stave: true })
  scenarios['glissando direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['glissando form'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.asWaveLineHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  addLineMeasureStaveVoicePositionScenarios(
    scenarios,
    'glissando',
    [
      'glissando starts before unit',
      'glissando finishes after unit',
      'glissando starts at unit',
      'glissando finishes at unit'
    ],
    1,
    true,
    { line: true, measure: true, stave: true, voice: true }
  )
}
