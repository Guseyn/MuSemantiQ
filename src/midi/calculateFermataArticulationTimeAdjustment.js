'use strict'

const FERMATA_TIME_IN_SECONDS = 2

export default function (note, pointsOfTimeWhenFermataArticulationIsApplied, fermataDurationFromMidiSettings) {
  let timeAdjustment = 0
  for (let timeIndex = 0; timeIndex < pointsOfTimeWhenFermataArticulationIsApplied.length; timeIndex++) {
    if ((note.time - pointsOfTimeWhenFermataArticulationIsApplied[timeIndex]) > 0.00001) {
      timeAdjustment += fermataDurationFromMidiSettings !== undefined
        ? fermataDurationFromMidiSettings
        : FERMATA_TIME_IN_SECONDS
    }
  }
  return timeAdjustment
}
