'use strict'

import isArticulationAttachedToUnit from '#msq/drawer/elements/marks-on-units/articulations/isArticulationAttachedToUnit.js'

export default function (singleUnit, slurDirection, slurSide, rightPointPlacement, styles) {
  let hasAttributesAbove = false
  let hasAttributesBelow = false
  if (singleUnit.articulationParams) {
    hasAttributesAbove = singleUnit.articulationParams.filter(articulationParam => (articulationParam.direction === 'up') && isArticulationAttachedToUnit(articulationParam)).length > 0
  }
  if (singleUnit.articulationParams) {
    hasAttributesBelow = singleUnit.articulationParams.filter(articulationParam => (articulationParam.direction === 'down') && isArticulationAttachedToUnit(articulationParam)).length > 0
  }
  if (singleUnit.stemDirection === 'up' && !singleUnit.hasConnectedTremolo && singleUnit.numberOfTremoloStrokes > 0 && singleUnit.withFlags) {
    hasAttributesAbove = true
  }
  if (singleUnit.stemDirection === 'down' && !singleUnit.hasConnectedTremolo && singleUnit.numberOfTremoloStrokes > 0 && singleUnit.withFlags) {
    hasAttributesBelow = true
  }
  const singleUnitsWithSlursComeFromTheirNoteBodies = (
    (slurDirection === 'up' && singleUnit.stemDirection === 'down') ||
    (slurDirection === 'down' && singleUnit.stemDirection === 'up') ||
    (singleUnit.stemless) ||
    (rightPointPlacement === 'noteBody')
  ) && (rightPointPlacement !== 'middleStem')
  const leftEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left
  const rightEdge = singleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right
  const singleUnitIsNotBeamedButWithStem = !singleUnit.beamed && !singleUnit.stemless
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  const slurSideSign = slurSide === 'left' ? +1 : -1
  const x = (
    singleUnitsWithSlursComeFromTheirNoteBodies
      ? (leftEdge + rightEdge) / 2
      : singleUnit.stemLeft
  ) + (
    ((singleUnitIsNotBeamedButWithStem && !singleUnitsWithSlursComeFromTheirNoteBodies) || slurSide === 'middle')
      ? slurSideSign * styles.slurJunctionPointForSingleUnitAtStemXOffset
      : 0
  )
  let slurJunctionPointYOffset = styles.slurJunctionPointForSingleUnitYOffset
  if (singleUnitIsNotBeamedButWithStem) {
    if (
      (hasAttributesAbove && slurDirection === 'up' && rightPointPlacement !== 'noteBody') ||
      (hasAttributesBelow && slurDirection === 'down' && rightPointPlacement !== 'noteBody')
    ) {
      slurJunctionPointYOffset = styles.slurJunctionPointForSingleUnitYOffsetWithAttributesAboveOrBelow
    } else if (!singleUnitsWithSlursComeFromTheirNoteBodies) {
      if (singleUnit.withFlags) {
        slurJunctionPointYOffset = styles.slurJunctionPointForSingleUnitAtStemWithFlagsYOffset
      } else {
        slurJunctionPointYOffset = styles.slurJunctionPointForSingleUnitAtStemYOffset
      }
    }
  }
  let slurTop = singleUnit.top
  let slurBottom = singleUnit.bottom
  if (rightPointPlacement === 'noteBody' && slurSide === 'right') {
    slurTop = singleUnit.bodyTop
    slurBottom = singleUnit.bodyBottom
  }
  const y = rightPointPlacement === 'middleStem'
    ? (singleUnit.stemTop + singleUnit.stemBottom) / 2
    : ((slurDirection === 'up' ? slurTop : slurBottom) + slurDirectionSign * slurJunctionPointYOffset)
  return { x, y }
}
