'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'

export default function (styles, stem) {
  const { noteBeamedStemExtensionStrokeOptions, graceElementsScaleFactor } = styles
  const tunedNoteBeamedStemExtensionStrokeOptions = Object.assign({}, noteBeamedStemExtensionStrokeOptions)
  if (stem.isGrace) {
    tunedNoteBeamedStemExtensionStrokeOptions.width *= graceElementsScaleFactor
  }
  const stemStart = stem.direction === 'up' ? stem.top : stem.bottom
  const stemEnd = stem.direction === 'up'
    ? stem.topCorrectedByBeams
    : stem.bottomCorrectedByBeams
  return createLine(
    stem.left, stemStart,
    stem.left, stemEnd,
    noteBeamedStemExtensionStrokeOptions,
    0,
    0,
    'beamedStemExtensionWithDifferentDirection'
  )
}
