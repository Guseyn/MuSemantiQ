'use strict'

/**
  We are interested only in first chord(with index 0) by slurMarkKey,
  because only first chord contains slurMark that controls behaviour and features of slur
**/
export default function (parserState, slurMarkKey) {
  if (
    parserState.slurMarkChords[slurMarkKey] &&
    parserState.slurMarkChords[slurMarkKey][0] &&
    parserState.slurMarkChords[slurMarkKey][0].slurMarks
  ) {
    const slurMarkWithSpecifiedKey = parserState.slurMarkChords[slurMarkKey][0].slurMarks.find(slurMark => slurMark.key === slurMarkKey)
    if (slurMarkWithSpecifiedKey) {
      return slurMarkWithSpecifiedKey
    }
  }
  return undefined
}
