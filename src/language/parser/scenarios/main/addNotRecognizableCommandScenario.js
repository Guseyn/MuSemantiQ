'use strict'

export default function (scenarios) {
  scenarios['command is not recognizable'] = {
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.lastOnTheLine && (tokenValues.length > 0)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      parserState.errors.push(`command '${joinedTokenValuesWithRealDelimiters}' is not recognizable or applicable on the line ${lineNumber}`)
    },
    itIsNewCommandProgressionFromLevel: 'last level'
  }
}
