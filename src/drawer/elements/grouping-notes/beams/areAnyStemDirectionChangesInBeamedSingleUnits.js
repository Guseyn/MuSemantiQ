'use strict'

export default function (singleUnits) {
  for (let index = 0; index < singleUnits.length; index++) {
    if (index > 0) {
      if (singleUnits[index].stemDirection !== singleUnits[index - 1].stemDirection) {
        return true
      }
    }
  }
  return false
}
