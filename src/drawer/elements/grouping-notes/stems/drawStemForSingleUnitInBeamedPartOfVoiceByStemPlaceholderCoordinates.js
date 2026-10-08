'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

export default function (styles, stemPlaceholderLeft, stemPlaceholderYStart, stemPlaceholderYEnd, isGrace) {
  const { noteSquareStemStrokeOptions, graceElementsScaleFactor } = styles
  const tunedNoteSquareStemStrokeOptions = Object.assign({}, noteSquareStemStrokeOptions)
  if (isGrace) {
    tunedNoteSquareStemStrokeOptions.width *= graceElementsScaleFactor
  }
  return createElementWithAdditionalInformation(
    createLine(
      stemPlaceholderLeft,
      stemPlaceholderYStart,
      stemPlaceholderLeft,
      stemPlaceholderYEnd,
      tunedNoteSquareStemStrokeOptions,
      0, 0, 'stemForBeamedSingleUnit'
    ),
    {
      isGrace
    }
  )
}
