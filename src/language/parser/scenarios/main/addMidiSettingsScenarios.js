'use strict'

import midiSettings from '#msq/language/parser/scenarios/static-objects/midiSettings.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['midi setting name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.midiSettingName.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const match = regexps.midiSettingName.match(tokenValues)
      const midiSettingName = match[0]
      parserState.lastMentionedMidiSettingKey = midiSettings[midiSettingName]
    },
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['midi setting name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'midi setting name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['midi setting value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'midi setting name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.midiSettingValue.test(tokenValues, parserState.lastMentionedMidiSettingKey) && currentToken.lastOnTheLine
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.midiSettings[parserState.lastMentionedMidiSettingKey] = regexps.midiSettingValue.match(tokenValues)[0]
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
