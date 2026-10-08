'use strict'

export default function (unitext, startCharIndex, numberOfTokens) {
  const nextTokenChars = []
  const nextTokens = []
  if (startCharIndex !== undefined) {
    if (unitext[startCharIndex - 1] !== '\n') {
      const lastCharIndex = unitext.length - 1
      for (let charIndex = startCharIndex; charIndex < unitext.length; charIndex++) {
        const currentChar = unitext[charIndex]
        const itIsDelimeterBetweenTokens = /\s/.test(currentChar)
        if ((itIsDelimeterBetweenTokens || (charIndex === lastCharIndex)) && (nextTokenChars.length > 0)) {
          if (!itIsDelimeterBetweenTokens && (charIndex === lastCharIndex)) {
            nextTokenChars.push(currentChar)
          }
          nextTokens.push(
            nextTokenChars.join('')
          )
          nextTokenChars.length = 0
          if ((nextTokens.length === numberOfTokens) || (currentChar === '\n')) {
            break
          }
        } else {
          nextTokenChars.push(currentChar)
        }
      }
    }
  }
  return nextTokens
}
