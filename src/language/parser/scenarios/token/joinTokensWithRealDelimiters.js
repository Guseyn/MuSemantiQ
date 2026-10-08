'use strict'

export default function (tokens, delimitersBeforeFirstTokenOnTheLine, delimetersAfterEachToken) {
  const resultBuffer = []
  if (tokens && tokens[0] && tokens[0].firstOnTheLine) {
    resultBuffer.push(...delimitersBeforeFirstTokenOnTheLine)
  }
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    resultBuffer.push(tokens[tokenIndex].value)
    resultBuffer.push(...delimetersAfterEachToken[tokens[tokenIndex].tokenNumber])
  }
  return resultBuffer.join('')
}
