'use strict'

import findFirstArticulationWithName from '#msq/midi/findFirstArticulationWithName.js'

export default function (note, notesSplittedInTimeFrames, orderedTimeFramesFromNotesSplittedInTimeFrames, timeIndex, noteTimeIndex) {
  note.shouldStartWithTrillPrincipalNote = true
  if (
    note.isGrace ||
    note.isRest ||
    note.isSimile ||
    note.isGhost ||
    note.visualDuration <= 1 / 8
  ) {
    return false
  }
  if (orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex - 1] !== undefined) {
    for (let noteTimeIndexInCurrentTimeFrame = 0; noteTimeIndexInCurrentTimeFrame < notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex - 1]].length; noteTimeIndexInCurrentTimeFrame++) {
      if (
        note.staveIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex - 1]][noteTimeIndexInCurrentTimeFrame].staveIndex &&
        note.voiceIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex - 1]][noteTimeIndexInCurrentTimeFrame].voiceIndex &&
        note.noteName === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex - 1]][noteTimeIndexInCurrentTimeFrame].noteName
      ) {
        note.shouldStartWithTrillPrincipalNote = false
        break
      }
    }
  }
  for (let noteTimeIndexInCurrentTimeFrame = noteTimeIndex + 1; noteTimeIndexInCurrentTimeFrame < orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex].length; noteTimeIndexInCurrentTimeFrame++) {
    if (
      note.staveIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex &&
      note.voiceIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex &&
      note.unitIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].unitIndex
    ) {
      continue
    }
    if (
      note.staveIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex &&
      note.voiceIndex === notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex &&
      notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[timeIndex]][noteTimeIndexInCurrentTimeFrame].isGrace
    ) {
      return false
    }
  }
  let timeFrameWhichContainsNotesOnTheSameStaveAndVoiceAsSpecifiedNoteIsFound = false
  for (let nextTimeIndex = timeIndex + 1; nextTimeIndex < orderedTimeFramesFromNotesSplittedInTimeFrames.length; nextTimeIndex++) {
    for (let noteTimeIndexInCurrentTimeFrame = 0; noteTimeIndexInCurrentTimeFrame < notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]].length; noteTimeIndexInCurrentTimeFrame++) {
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex
      ) {
        timeFrameWhichContainsNotesOnTheSameStaveAndVoiceAsSpecifiedNoteIsFound = true
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].isGrace
      ) {
        return false
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].isSimile
      ) {
        return false
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].isRest
      ) {
        return false
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].isGhost
      ) {
        return false
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].noteName === note.noteName
      ) {
        note.shouldEndWithJustTrillBottomAlternateNote = true
        return false
      }
      if (
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].staveIndex === note.staveIndex &&
        notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame].voiceIndex === note.voiceIndex &&
        findFirstArticulationWithName(
          notesSplittedInTimeFrames[orderedTimeFramesFromNotesSplittedInTimeFrames[nextTimeIndex]][noteTimeIndexInCurrentTimeFrame],
          'trill'
        )
      ) {
        note.shouldStartWithTrillPrincipalNote = false
        return false
      }
    }
    if (timeFrameWhichContainsNotesOnTheSameStaveAndVoiceAsSpecifiedNoteIsFound) {
      break
    }
  }
  return true
}
