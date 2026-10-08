'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (tokenValues, joinedTokenValues) {
  const tokenValuesWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
  const match = regexps.horizontalCorrection.match(tokenValuesWithNumbersInsteadOfWords)
  const horizontalCorrectionValue = match[0]
  const directionOfHorizontalCorrection = match[1]
  const directionSignOfHorizontalCorrection = directionOfHorizontalCorrection === 'left' ? -1 : 1
  return directionSignOfHorizontalCorrection * horizontalCorrectionValue
}
