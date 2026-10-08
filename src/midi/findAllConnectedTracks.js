'use strict'

export default function (note, tracksForEachInstrumentOnEachStaveInEachVoice) {
  const connectedTracks = [ note.track ]
  const instrumentNumber = note.track.instrument.number
  for (let index = 0; index < note.staveIndexesUnitedByConnection.length; index++) {
    const allTrackKeysStartWithInstrumentAndStaveIndex = Object.keys(tracksForEachInstrumentOnEachStaveInEachVoice).filter(
      key => key.startsWith(`${instrumentNumber}-${note.staveIndexesUnitedByConnection[index]}-`)
    )
    for (let trackKeyIndex = 0; trackKeyIndex < allTrackKeysStartWithInstrumentAndStaveIndex.length; trackKeyIndex++) {
      if (note.track.name === `track-${allTrackKeysStartWithInstrumentAndStaveIndex[trackKeyIndex]}`) {
        continue
      }
      connectedTracks.push(
        tracksForEachInstrumentOnEachStaveInEachVoice[
          allTrackKeysStartWithInstrumentAndStaveIndex[
            trackKeyIndex
          ]
        ]
      )
    }
  }
  return connectedTracks
}
