'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'

export default function (tokenValues, joinedTokenValues) {
  return regexps.withNumberOfStrokes.match(
    replaceWordsWithNumbers(tokenValues)
  )[0] * 1
}
