'use strict'

import replaceWordsWithNumbers from '#msq/language/parser/scenarios/token/replaceWordsWithNumbers.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (tokenValues, startsFromZero) {
  const tokensWithNumbersInsteadOfWords = replaceWordsWithNumbers(tokenValues)
  const noteIndexMatches = regexps.noteIndex.match(tokensWithNumbersInsteadOfWords)
  if (noteIndexMatches && noteIndexMatches[0]) {
    const noteIndex = noteIndexMatches[0] * 1 - (startsFromZero ? 1 : 0)
    return noteIndex
  }
  const indexOfNoteMatches = regexps.indexOfNote.match(tokensWithNumbersInsteadOfWords)
  if (indexOfNoteMatches && indexOfNoteMatches[0]) {
    const noteIndex = indexOfNoteMatches[0] * 1 - (startsFromZero ? 1 : 0)
    return noteIndex
  }
  return 0
}
