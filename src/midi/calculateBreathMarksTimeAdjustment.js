'use strict'

const BREATH_TIME_IN_SECONDS = 2

export default function (note, pointsOfTimeWhenBreathMarkIsApplied) {
  let timeAdjustment = 0
  for (let timeIndex = 0; timeIndex < pointsOfTimeWhenBreathMarkIsApplied.length; timeIndex++) {
    if (note.time >= pointsOfTimeWhenBreathMarkIsApplied[timeIndex]) {
      timeAdjustment += BREATH_TIME_IN_SECONDS
    }
  }
  return timeAdjustment
}
