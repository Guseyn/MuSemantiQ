'use strict'

export default function (numberOfUnits, numberOfBeats) {
  if (numberOfUnits === 1) {
    return 1
  }
  if (numberOfBeats === 1) {
    return 2
  }
  if (numberOfBeats > 1) {
    return 'mixed'
  }
  return 0
}
