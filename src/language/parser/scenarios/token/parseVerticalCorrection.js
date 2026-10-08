'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (tokenValues, joinedTokenValues) {
  const tokenValuesWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
  const match = regexps.verticalCorrection.match(tokenValuesWithNumbersInsteadOfWords)
  const verticalCorrectionValue = match[0]
  const directionOfVerticalCorrection = match[1]
  const directionSignOfVerticalCorrection = directionOfVerticalCorrection === 'up' ? -1 : 1
  return directionSignOfVerticalCorrection * verticalCorrectionValue
}
