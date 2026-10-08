'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'

export default function (styles, stem, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection) {
  const { noteStemStrokeOptions, noteBeamedStemExtensionStrokeOptions, graceElementsScaleFactor } = styles
  const tunedNoteStemStrokeOptions = Object.assign({}, noteStemStrokeOptions)
  const tunedNoteBeamedStemExtensionStrokeOptions = Object.assign({}, noteBeamedStemExtensionStrokeOptions)
  if (stem.isGrace) {
    tunedNoteBeamedStemExtensionStrokeOptions.width *= graceElementsScaleFactor
    tunedNoteStemStrokeOptions.width *= graceElementsScaleFactor
  }
  const stemWidth = noteStemStrokeOptions.width
  const stemStart = stem.direction === 'up' ? stem.top : stem.bottom
  const stemEnd = stem.isRest
    ? stemStart
    : stem.direction === 'up'
      ? stemStart - allBeamsHeightNormalWhereAllStemsWithSameDirection + beamLineHeightNormal - stemWidth
      : stemStart + allBeamsHeightNormalWhereAllStemsWithSameDirection - beamLineHeightNormal + stemWidth
  return createLine(
    stem.left, stemStart,
    stem.left, stemEnd,
    tunedNoteBeamedStemExtensionStrokeOptions,
    0,
    0,
    'beamedStemExtension'
  )
}
