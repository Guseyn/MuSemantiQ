'use strict'

const noteNames = [
  'c', 'd', 'e', 'f', 'g', 'a', 'b'
]
const noteNameWithOctaveNumberForZeroPositionNumberByClefs = {
  'treble': {
    noteName: 'f',
    octaveNumber: '5'
  },
  'bass': {
    noteName: 'a',
    octaveNumber: '3'
  },
  'alto': {
    noteName: 'g',
    octaveNumber: '4'
  },
  'baritone': {
    noteName: 'c',
    octaveNumber: '4'
  },
  'mezzoSoprano': {
    noteName: 'b',
    octaveNumber: '4'
  },
  'soprano': {
    noteName: 'd',
    octaveNumber: '5'
  },
  'tenor': {
    noteName: 'e',
    octaveNumber: '4'
  },
  'octaveEightUp': {
    noteName: 'f',
    octaveNumber: '6'
  },
  'octaveEightDown': {
    noteName: 'f',
    octaveNumber: '4'
  },
  'octaveFifteenUp': {
    noteName: 'f',
    octaveNumber: '7'
  },
  'octaveFifteenDown': {
    noteName: 'f',
    octaveNumber: '3'
  }
}

export default function (noteParams, clefNamesAuraByStaveIndexes) {
  if (noteParams.positionNumber) {
    return noteParams.positionNumber
  }
  if (noteParams.noteName) {
    const noteName = noteParams.noteName
    let octaveNumber = noteParams.octaveNumber
    let clefIndex = noteParams.staveIndex
    if (noteParams.stave === 'prev') {
      clefIndex -= 1
    } else if (noteParams.stave === 'next') {
      clefIndex += 1
    }
    const clefName = clefNamesAuraByStaveIndexes[clefIndex]
    const noteNameWithOctaveNumberForZeroPositionNumber = noteNameWithOctaveNumberForZeroPositionNumberByClefs[clefName]
    octaveNumber = octaveNumber || noteNameWithOctaveNumberForZeroPositionNumber.octaveNumber * 1 - 1
    const noteNameIndex = noteNames.indexOf(noteName)
    const zeroNoteNameIndex = noteNames.indexOf(noteNameWithOctaveNumberForZeroPositionNumber.noteName)
    const lastNoteNameIndex = noteNames.length - 1
    if (octaveNumber === noteNameWithOctaveNumberForZeroPositionNumber.octaveNumber) {
      return (zeroNoteNameIndex - noteNameIndex) / 2
    }
    const diffInOctaves = (noteNameWithOctaveNumberForZeroPositionNumber.octaveNumber * 1 - octaveNumber * 1 - 1) * noteNames.length / 2
    return diffInOctaves + (zeroNoteNameIndex + 1) / 2 + (lastNoteNameIndex - noteNameIndex) / 2
  }
  return 0
}
