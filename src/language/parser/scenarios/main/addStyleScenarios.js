'use strict'

import configurableStyles from '#msq/language/parser/scenarios/static-objects/configurableStyles.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

const styleNameAction = (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
  const match = regexps.styleName.match(tokenValues)
  const styleName = match[0]
  parserState.lastMentionedStyleKey = configurableStyles[styleName]
}

const styleNameIsAction = (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
}

const styleValueAction = (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
  parserState.customStyles[parserState.lastMentionedStyleKey] = regexps.styleValue.match(tokenValues)[0]
}

export default function (scenarios) {
  scenarios['color style name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleName.test(tokenValues) && regexps.color.test(tokenValues)
    },
    action: styleNameAction,
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['color style name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'color style name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    action: styleNameIsAction,
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['color style value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'color style name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleValue.test(tokenValues, parserState.lastMentionedStyleKey) && currentToken.lastOnTheLine
    },
    action: styleValueAction,
    itIsNewCommandProgressionFromLevel: 1
  }

  scenarios['music font style name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.musicFont.test(tokenValues)
    },
    action: styleNameAction,
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['music font style name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'music font style name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    action: styleNameIsAction,
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['music font style value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'music font style name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleValue.test(tokenValues, parserState.lastMentionedStyleKey, parserState.fonts['music']) && currentToken.lastOnTheLine
    },
    action: styleValueAction,
    itIsNewCommandProgressionFromLevel: 1
  }

  scenarios['text font style name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.textFont.test(tokenValues)
    },
    action: styleNameAction,
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['text font style name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'text font style name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    action: styleNameIsAction,
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['text font style value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'text font style name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleValue.test(tokenValues, parserState.lastMentionedStyleKey, parserState.fonts['text']) && currentToken.lastOnTheLine
    },
    action: styleValueAction,
    itIsNewCommandProgressionFromLevel: 1
  }

  scenarios['chord letters font style name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.chordLettersFont.test(tokenValues)
    },
    action: styleNameAction,
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['chord letters font style name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'chord letters font style name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    action: styleNameIsAction,
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['chord letters font style value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'chord letters font style name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleValue.test(tokenValues, parserState.lastMentionedStyleKey, parserState.fonts['chord-letters']) && currentToken.lastOnTheLine
    },
    action: styleValueAction,
    itIsNewCommandProgressionFromLevel: 1
  }

  scenarios['style name'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleName.test(tokenValues)
    },
    action: styleNameAction,
    itIsNewCommandProgressionFromLevel: 0
  }
  scenarios['style name is'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'style name',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.isIs.test(tokenValues)
    },
    action: styleNameIsAction,
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['style value'] = {
    onTheSameLineAsPrevScenario: true,
    requiredCommandProgression: 'style name is',
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.styleValue.test(tokenValues, parserState.lastMentionedStyleKey) && currentToken.lastOnTheLine
    },
    action: styleValueAction,
    itIsNewCommandProgressionFromLevel: 1
  }
}
