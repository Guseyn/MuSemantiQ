'use strict'

export default function (lastChordParams) {
  return lastChordParams.relatedLyrics[lastChordParams.relatedLyrics.length - 1]
}
