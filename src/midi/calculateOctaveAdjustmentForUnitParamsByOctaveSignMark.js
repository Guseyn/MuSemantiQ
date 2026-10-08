'use strict'

export default function (octaveSignMark) {
  let octaveSignAdjustment = 0
  if (octaveSignMark.direction === 'up') {
    if (octaveSignMark.octaveNumber === '8') {
      octaveSignAdjustment = 1
    } else if (octaveSignMark.octaveNumber === '15') {
      octaveSignAdjustment = 2
    }
  } else if (octaveSignMark.direction === 'down') {
    if (octaveSignMark.octaveNumber === '8') {
      octaveSignAdjustment = -1
    } else if (octaveSignMark.octaveNumber === '15') {
      octaveSignAdjustment = -2
    }
  }
  return octaveSignAdjustment
}
