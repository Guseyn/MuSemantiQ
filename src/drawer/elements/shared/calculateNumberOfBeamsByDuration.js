'use strict'

const numberOfBeamsByUnitDurations = {
  '0.125': 1,
  '0.0625': 2,
  '0.03125': 3,
  '0.015625': 4,
  '0.0078125': 5,
  '0.00390625': 6
}

export default function (duration) {
  return numberOfBeamsByUnitDurations[duration + ''] || 0
}
