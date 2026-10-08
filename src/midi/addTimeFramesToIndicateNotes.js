'use strict'

import splitNoteInTremoloNotes from '#msq/midi/splitNoteInTremoloNotes.js'

export default function (unitParams, notesSplittedInTimeFrames, unitActualDuration, unitDurationInSeconds, octaveAdjustmentForUnitParams, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, time, staveVoiceKey) {
  if (unitParams.notes) {
    for (let noteIndex = 0; noteIndex < unitParams.notes.length; noteIndex++) {
      const note = unitParams.notes[noteIndex]
      if (unitParams.isGrace) {
        note.graceCount = graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey]
      }

      note.time = time
      note.actualDuration = unitActualDuration
      note.durationInSeconds = unitDurationInSeconds
      note.octaveSignAdjustment = octaveAdjustmentForUnitParams
      note.unitIsLastSingleUnitInVoiceOnPageLine = unitParams.isLastSingleUnitInVoiceOnPageLine
      note.unitIsLastSingleUnitOnPageInVoice = unitParams.isLastSingleUnitOnPageInVoice
      splitNoteInTremoloNotes(note)
      notesSplittedInTimeFrames[note.time] = notesSplittedInTimeFrames[note.time] || []
      notesSplittedInTimeFrames[note.time].push(note)
    }
  }
}
