'use strict'

const MIDI_CC_FACTOR = 127
const DEFAULT_MIDI_VOLUME = 100

const articulationAdjustments = {
  accent: (midiNote, trackForNote) => {
    midiNote.velocity = Math.min(1, midiNote.velocity + 40 / MIDI_CC_FACTOR)
  },
  staccato: (midiNote, trackForNote) => {
    midiNote.duration -= midiNote.duration * 1 / 2
  },
  spiccato: (midiNote, trackForNote) => {
    midiNote.duration -= midiNote.duration * 1 / 2
    const ccEndTime = midiNote.time + midiNote.duration * 1 / 3
    trackForNote.addCC({
      number: 7,
      value: 127 / MIDI_CC_FACTOR,
      time: midiNote.time
    }).addCC({
      number: 7,
      value: DEFAULT_MIDI_VOLUME / MIDI_CC_FACTOR,
      time: ccEndTime
    })
  },
  tenuto: (midiNote, trackForNote) => {
    const ccEndTime = midiNote.time + midiNote.duration
    trackForNote.addCC({
      number: 65,
      value: 127 / MIDI_CC_FACTOR,
      time: midiNote.time
    }).addCC({
      number: 65,
      value: 0 / MIDI_CC_FACTOR,
      time: ccEndTime
    })
  },
  marcato: (midiNote, trackForNote) => {
    midiNote.velocity = Math.min(1, midiNote.velocity + 60 / MIDI_CC_FACTOR)
  },
  leftHandPizzicato: (midiNote, trackForNote) => {
    // it's adjusted by temporary instrument change
  },
  snapPizzicato: (midiNote, trackForNote) => {
    // it's adjusted by temporary instrument change
  },
  naturalHarmonic: () => {
    // it's adjusted by temporary instrument change
  },
  downBow: (midiNote, trackForNote) => {
    const ccEndTime = midiNote.time + midiNote.duration
    trackForNote.addCC({
      number: 7,
      value: (DEFAULT_MIDI_VOLUME + 20) / MIDI_CC_FACTOR,
      time: midiNote.time
    }).addCC({
      number: 7,
      value: DEFAULT_MIDI_VOLUME / MIDI_CC_FACTOR,
      time: ccEndTime
    })
  },
  upBow: (midiNote, trackForNote) => {
    const ccEndTime = midiNote.time + midiNote.duration
    trackForNote.addCC({
      number: 7,
      value: (DEFAULT_MIDI_VOLUME - 20) / MIDI_CC_FACTOR,
      time: midiNote.time
    }).addCC({
      number: 7,
      value: DEFAULT_MIDI_VOLUME / MIDI_CC_FACTOR,
      time: ccEndTime
    })
  }
}

export default function (repertoireNote, midiNote, trackForNote) {
  const isThisFirstNoteInUnitSinceWeNeedToApplyAnyArticulationOnclyOncePerUnit = repertoireNote.noteIndex === 0
  if (repertoireNote.articulationParams && isThisFirstNoteInUnitSinceWeNeedToApplyAnyArticulationOnclyOncePerUnit) {
    for (let articulationIndex = 0; articulationIndex < repertoireNote.articulationParams.length; articulationIndex++) {
      const adjustment = articulationAdjustments[repertoireNote.articulationParams[articulationIndex].name]
      if (adjustment) {
        adjustment(midiNote, trackForNote)
      }
    }
  }
}
