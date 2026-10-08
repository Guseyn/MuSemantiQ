'use strict'

export default function (lastChordParams) {
  return lastChordParams.articulationParams[lastChordParams.articulationParams.length - 1]
}
