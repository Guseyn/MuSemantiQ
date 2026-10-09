'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['punctuation'] = {
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return currentToken.lastOnTheLine && regexps.punctuation.test(tokenValues) && joinedTokenValuesWithRealDelimiters.length > 0
    }
  }
}
