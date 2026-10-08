'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createWave from '#msq/drawer/elements/basic/createWave.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import shouldArticulationBeAboveOrUnderStemLine from '#msq/drawer/elements/shared/shouldArticulationBeAboveOrUnderStemLine.js'
import drawArticulationKeysInVerticalLine from '#msq/drawer/elements/marks-on-units/ornaments/drawArticulationKeysInVerticalLine.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (singleUnit, articulationIndex, nextDrawnSingleUnit, currentArticulationParams, topOfCurrentStave, bottomOfCurrentStave, styles) {
  const components = []
  const { fontColor, trill, trillWavePeriod, trillWaveOffsetFromText, trillMinWaveLength, trillWaveOffsetFromNextSingleUnit } = styles
  const { direction, keyAbove, keyBelow, withWave } = currentArticulationParams
  const shouldBeAboveOrUnderStemLine = shouldArticulationBeAboveOrUnderStemLine(singleUnit, direction)
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const startYPosition = direction === 'up'
    ? Math.min(singleUnit.top, topOfCurrentStave)
    : Math.max(singleUnit.bottom, bottomOfCurrentStave)
  const trillText = createPath(
    trill.points,
    null,
    fontColor,
    0,
    startYPosition
  )
  components.push(
    trillText
  )
  if (keyAbove) {
    components.push(
      drawArticulationKeysInVerticalLine(singleUnit, articulationIndex, keyAbove, trillText, 'above', styles)
    )
  }
  if (keyBelow) {
    components.push(
      drawArticulationKeysInVerticalLine(singleUnit, articulationIndex, keyBelow, trillText, 'below', styles)
    )
  }
  if (withWave) {
    const trillYCenter = (trillText.top + trillText.bottom) / 2
    const waveStartX = trillText.right + trillWaveOffsetFromText
    const waveEndX = waveStartX + (
      nextDrawnSingleUnit
        ? (nextDrawnSingleUnit.left - singleUnit.right - trillWaveOffsetFromNextSingleUnit)
        : trillMinWaveLength
    )
    const wave = createWave(
      { x: waveStartX, y: trillYCenter },
      { x: waveEndX, y: trillYCenter },
      trillWavePeriod,
      fontColor
    )
    addPropertiesToElement(
      wave,
      {
        'ref-ids': `articulation-wave-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${articulationIndex + 1}`
      }
    )
    components.push(
      wave
    )
  }
  let groupedTrill = createGroup(
    'trill',
    components
  )
  const trillXCenter = (trillText.right + trillText.left) / 2
  const xCoordinateWhereTrillBelongs = shouldBeAboveOrUnderStemLine
    ? singleUnit.stemLeft - trillXCenter
    : (leftEdge + rightEdge) / 2 - trillXCenter
  moveElement(
    groupedTrill,
    xCoordinateWhereTrillBelongs,
    direction === 'up'
      ? (startYPosition - groupedTrill.bottom - trill.yOffset)
      : (startYPosition - groupedTrill.top + trill.yOffset)
  )
  return groupedTrill
}
