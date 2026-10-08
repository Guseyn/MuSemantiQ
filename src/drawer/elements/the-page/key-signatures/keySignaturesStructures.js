'use strict'

const noKeysSignatures = [
  'c major|a minor'
]

const sharpSignatureNames = [
  'g major|e minor',
  'd major|b minor',
  'a major|f sharp minor',
  'e major|c sharp minor',
  'b major|g sharp minor',
  'f sharp major|d sharp minor',
  'c sharp major|a sharp minor'
]

const flatSignatureNames = [
  'f major|d minor',
  'b flat major|g minor',
  'e flat major|c minor',
  'a flat major|f minor',
  'd flat major|b flat minor',
  'g flat major|e flat minor',
  'c flat major|a flat minor'
]

const naturalFromSharpSignatureNames = [
  'g major to c major|g major to a minor|e minor to c major|e minor to a minor',
  'd major to c major|d major to a minor|b minor to c major|b minor to a minor',
  'a major to c major|a major to a minor|f sharp minor to c major|f sharp minor to a minor',
  'e major to c major|e major to a minor|c sharp minor to c major|c sharp minor to a minor',
  'b major to c major|b major to a minor|g sharp minor to c major|g sharp minor to a minor',
  'f sharp major to c major|f sharp major to a minor|d sharp minor to c major|d sharp minor to a minor',
  'c sharp major to c major|c sharp major to a minor|a sharp minor to c major|a sharp minor to a minor'
]

const naturalFromFlatSignatureNames = [
  'f major to c major|f major to a minor|d minor to c major|d minor to a minor',
  'b flat major to c major|b flat major to a minor|g minor to c major|g minor to a minor',
  'e flat major to c major|e flat major to a minor|c minor to c major|c minor to a minor',
  'a flat major to c major|a flat major to a minor|f minor to c major|f minor to a minor',
  'd flat major to c major|d flat major to a minor|b flat minor to c major|b flat minor to a minor',
  'g flat major to c major|g flat major to a minor|e flat minor to c major|e flat minor to a minor',
  'c flat major to c major|c flat major to a minor|a flat minor to c major|a flat minor to a minor'
]

const clefs = [
  { name: 'treble', sharpKeyPositionNumbers: [ 0, 1.5, -0.5, 1, 2.5, 0.5, 2 ], flatKeyPositionNumbers: [ 2, 0.5, 2.5, 1, 3, 1.5, 3.5 ] },
  { name: 'bass', sharpKeyPositionNumbers: [ 1, 2.5, 0.5, 2, 0, 1.5, -0.5 ], flatKeyPositionNumbers: [ 3, 1.5, 3.5, 2, 4, 2.5, 4.5 ] },
  { name: 'alto', sharpKeyPositionNumbers: [ 0.5, 2, 0, 1.5, -0.5, 1, 2.5 ], flatKeyPositionNumbers: [ 2.5, 1, 3, 1.5, 3.5, 2, 4 ] },
  { name: 'baritone', sharpKeyPositionNumbers: [ 2, 3.5, 1.5, 3, 1, 2.5, 0.5 ], flatKeyPositionNumbers: [ 0.5, 2.5, 1, 3, 1.5, 3.5, 2 ] },
  { name: 'mezzoSoprano', sharpKeyPositionNumbers: [ 1.5, 3, 1, 2.5, 0.5, 2, 0 ], flatKeyPositionNumbers: [ 0, 2, 0.5, 2.5, 1, 3, 1.5 ] },
  { name: 'soprano', sharpKeyPositionNumbers: [ 2.5, 4, 2, 3.5, 1.5, 3, 1 ], flatKeyPositionNumbers: [ 1, 3, 1.5, 3.5, 2, 4, 2.5 ] },
  { name: 'tenor', sharpKeyPositionNumbers: [ 3, 1, 2.5, 0.5, 2, 0, 1.5 ], flatKeyPositionNumbers: [ 1.5, 0, 2, 0.5, 2.5, 1, 3 ] }
]

const constructKeySignaturesStructures = () => {
  const keySignaturesStructures = {}
  clefs.forEach(clef => {
    keySignaturesStructures[clef.name] = {}
    noKeysSignatures.forEach(keySignatureName => {
      keySignaturesStructures[clef.name][keySignatureName] = []
    })
    sharpSignatureNames.forEach((keySignatureName, keySignatureNameIndex) => {
      keySignaturesStructures[clef.name][keySignatureName] = keySignaturesStructures[clef.name][keySignatureName] || []
      clef.sharpKeyPositionNumbers.slice(0, keySignatureNameIndex + 1).forEach((positionNumber, positionNumberIndex) => {
        keySignaturesStructures[clef.name][keySignatureName].push({
          key: 'sharp',
          positionNumber
        })
      })
    })
    flatSignatureNames.forEach((keySignatureName, keySignatureNameIndex) => {
      keySignaturesStructures[clef.name][keySignatureName] = keySignaturesStructures[clef.name][keySignatureName] || []
      clef.flatKeyPositionNumbers.slice(0, keySignatureNameIndex + 1).forEach((positionNumber, positionNumberIndex) => {
        keySignaturesStructures[clef.name][keySignatureName].push({
          key: 'flat',
          positionNumber
        })
      })
    })
    naturalFromSharpSignatureNames.forEach((keySignatureName, keySignatureNameIndex) => {
      keySignaturesStructures[clef.name][keySignatureName] = keySignaturesStructures[clef.name][keySignatureName] || []
      clef.sharpKeyPositionNumbers.slice(0, keySignatureNameIndex + 1).forEach((positionNumber, positionNumberIndex) => {
        keySignaturesStructures[clef.name][keySignatureName].push({
          key: 'natural',
          positionNumber
        })
      })
    })
    naturalFromFlatSignatureNames.forEach((keySignatureName, keySignatureNameIndex) => {
      keySignaturesStructures[clef.name][keySignatureName] = keySignaturesStructures[clef.name][keySignatureName] || []
      clef.flatKeyPositionNumbers.slice(0, keySignatureNameIndex + 1).forEach((positionNumber, positionNumberIndex) => {
        keySignaturesStructures[clef.name][keySignatureName].push({
          key: 'natural',
          positionNumber
        })
      })
    })
  })
  return keySignaturesStructures
}

export default constructKeySignaturesStructures()
