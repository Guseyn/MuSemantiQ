'use strict'

import calculateSlurPoints from '#msq/drawer/elements/spans/slurs/calculateSlurPoints.js'
import calculateSShapeSlurPoints from '#msq/drawer/elements/spans/slurs/calculateSShapeSlurPoints.js'
import calculateSlurJunctionPointForSingleUnit from '#msq/drawer/elements/spans/slurs/calculateSlurJunctionPointForSingleUnit.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (markedSlur, slurMarkKey, voicesBody, extendedFromLeftSide, extendedToRightSide, styles) {
  const defaultSlurDirection = markedSlur.defaultSlurDirection
  const customSlurDirection = markedSlur.customSlurDirection
  const slurDirection = customSlurDirection || defaultSlurDirection

  markedSlur.isGrace = markedSlur.allSingleUnitsOnTheWay.some(singleUnit => singleUnit.isGrace)
  const slurLeftPoint = calculateSlurJunctionPointForSingleUnit(markedSlur.allSingleUnitsOnTheWay[0], slurDirection, 'left', null, styles)
  const slurRightPoint = calculateSlurJunctionPointForSingleUnit(markedSlur.allSingleUnitsOnTheWay[markedSlur.allSingleUnitsOnTheWay.length - 1], slurDirection, 'right', markedSlur.rightPlacement, styles)

  if (!markedSlur.withSShape) {
    const slurPoints = calculateSlurPoints(
      markedSlur,
      slurLeftPoint,
      slurRightPoint,
      slurDirection,
      voicesBody,
      extendedFromLeftSide,
      extendedToRightSide,
      styles
    )
    const slur = createGroup(
      'slur',
      [
        createPath(
          slurPoints,
          styles.slurStrokeOptions,
          true,
          0,
          0
        )
      ]
    )
    addPropertiesToElement(
      slur,
      {
        'ref-ids': slurMarkKey
      }
    )
    return slur
  }

  const sShapeSlurPoins = calculateSShapeSlurPoints(
    markedSlur,
    slurLeftPoint,
    slurRightPoint,
    slurDirection,
    voicesBody,
    extendedFromLeftSide,
    extendedToRightSide,
    styles
  )

  const tunedSShapeSlurStrokeOptions = Object.assign({}, styles.sShapeSlurStrokeOptions)
  if (markedSlur.isGrace) {
    tunedSShapeSlurStrokeOptions.width *= styles.graceElementsScaleFactor
  }
  const slur = createGroup(
    'slur',
    [
      createPath(
        sShapeSlurPoins,
        tunedSShapeSlurStrokeOptions,
        false,
        0,
        0
      )
    ]
  )
  addPropertiesToElement(
    slur,
    {
      'ref-ids': slurMarkKey
    }
  )
  return slur
}
