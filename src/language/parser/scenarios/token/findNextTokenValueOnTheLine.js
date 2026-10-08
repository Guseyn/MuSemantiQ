'use strict'

export default function (unitext, startCharIndex) {
  const nextTokenChars = []
  if (startCharIndex !== undefined) {
    if (unitext[startCharIndex - 1] !== '\n') {
      for (let charIndex = startCharIndex; charIndex < unitext.length; charIndex++) {
        const currentChar = unitext[charIndex]
        const itIsDelimeterBetweenTokens = /\s/.test(currentChar)
        if (itIsDelimeterBetweenTokens) {
          break
        }
        nextTokenChars.push(currentChar)
      }
    }
  }
  return nextTokenChars.join('')
}
