'use strict'

import midiSettings from '#msq/language/parser/scenarios/static-objects/midiSettings.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

const NEW_LINE = '\n'

export default function (scenarios) {
  scenarios['midi setting name'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, tokenValues, state }) => {
      const match = regexps.midiSettingName.match(tokenValues)
      const midiSettingName = match[0]
      parserState.lastMentionedMidiSettingKey = midiSettings[midiSettingName]
      const lastNewLineIndex = joinedTokenValuesWithRealDelimiters.lastIndexOf(NEW_LINE)
      if (lastNewLineIndex === -1) {
        state.highlightsHtmlBuffer.push(
          `<span class="msh">${joinedTokenValuesWithRealDelimiters}</span>`
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `${joinedTokenValuesWithRealDelimiters.slice(0, lastNewLineIndex + 1)}<span class="msh">${joinedTokenValuesWithRealDelimiters.slice(lastNewLineIndex + 1)}</span>`
        )
      }
    }
  }
  scenarios['midi setting name is'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['midi setting value'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const firstNewLineIndex = joinedTokenValuesWithRealDelimiters.indexOf(NEW_LINE)
      if (firstNewLineIndex === -1) {
        state.highlightsHtmlBuffer.push(
          `<span class="msvh">${joinedTokenValuesWithRealDelimiters}</span>`
        )
      } else {
        state.highlightsHtmlBuffer.push(
          `<span class="msvh">${joinedTokenValuesWithRealDelimiters.slice(0, firstNewLineIndex)}</span>${joinedTokenValuesWithRealDelimiters.slice(firstNewLineIndex)}`
        )
      }
    }
  }
}
