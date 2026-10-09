'use strict'

import pageMeta from '#msq/language/parser/scenarios/static-objects/pageMeta.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['page meta'] = {
    startsOnNewLine: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.pageMeta.test(tokenValues) && currentToken.lastOnTheLine
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const match = regexps.pageMeta.match(tokenValues)
      const pageMetaName = match[0]
      const pageMetaKey = pageMeta[pageMetaName]
      const pageMetaValue = match[1]
      parserState.pageSchema[pageMetaKey] = pageMetaValue
      return { pageMetaKey }
    },
    itIsNewCommandProgressionFromLevel: 0
  }
}
