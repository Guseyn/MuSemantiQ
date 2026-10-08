'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (joinedTokens, startsFromZero) {
  const strigifiedTokens = replaceWordsWithNumbers(joinedTokens)
  const staveIndexMatches = regexps.numbers.match(strigifiedTokens)
  if (staveIndexMatches && staveIndexMatches[0]) {
    const staveIndex = staveIndexMatches[0] * 1 - (startsFromZero ? 1 : 0)
    return staveIndex
  }
  return 0
}
