'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'

export default function (tokenValues, joinedTokenValues) {
  const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
  let match
  if (regexps.measureNumber.test(tokensWithNumbersInsteadOfWords)) {
    match = regexps.measureNumber.match(tokensWithNumbersInsteadOfWords)
  } else {
    match = regexps.numberOfMeasure.match(tokensWithNumbersInsteadOfWords)
  }
  const measureNumber = match[0] * 1
  return measureNumber
}
