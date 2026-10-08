'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (tokenValues, startsFromZero) {
  const tokenValuesWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
  if (regexps.staveIndex.test(tokenValuesWithNumbersInsteadOfWords)) {
    const staveIndexMatches = regexps.staveIndex.match(tokenValuesWithNumbersInsteadOfWords)
    if ((staveIndexMatches !== undefined) && (staveIndexMatches[0] !== undefined)) {
      const staveIndex = staveIndexMatches[0] * 1 - (startsFromZero ? 1 : 0)
      return staveIndex
    }
  }
  if (regexps.indexOfStave.test(tokenValuesWithNumbersInsteadOfWords)) {
    const indexOfStaveMatches = regexps.indexOfStave.match(tokenValuesWithNumbersInsteadOfWords)
    if ((indexOfStaveMatches !== undefined) && (indexOfStaveMatches[0] !== undefined)) {
      const staveIndex = indexOfStaveMatches[0] * 1 - (startsFromZero ? 1 : 0)
      return staveIndex
    }
  }
  return 0
}
