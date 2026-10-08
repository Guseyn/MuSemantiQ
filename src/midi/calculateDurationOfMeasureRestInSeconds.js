'use strict'

const DEFAULT_DURATION_IN_QUARTERS_FOR_MEASURE_REST = 4

import calculateDurationInSeconds from '#msq/midi/calculateDurationInSeconds.js'

export default function (timeSignatureDurationInSeconds, tempoAura, fullDurationOfLastMeasure) {
  return timeSignatureDurationInSeconds
    ? calculateDurationInSeconds(timeSignatureDurationInSeconds, tempoAura.quartersPerMinute)
    : fullDurationOfLastMeasure
      ? fullDurationOfLastMeasure
      : calculateDurationInSeconds(DEFAULT_DURATION_IN_QUARTERS_FOR_MEASURE_REST, tempoAura.quartersPerMinute)
}
