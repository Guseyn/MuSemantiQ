'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import moveElementAbovePointWithInterval from '#msq/drawer/elements/basic/moveElementAbovePointWithInterval.js'
import moveElementBelowPointWithInterval from '#msq/drawer/elements/basic/moveElementBelowPointWithInterval.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

const drawSharpKeyShape = () => {
  return (styles, leftOffset, topOffset) => {
    const { articulationSharpKey, fontColor } = styles
    return createGroup(
      'sharpKeyShape',
      [
        createPath(
          articulationSharpKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset
        )
      ]
    )
  }
}

const drawFlatKeyShape = () => {
  return (styles, leftOffset, topOffset) => {
    const { articulationFlatKey, fontColor } = styles
    return createGroup(
      'flatKeyShape',
      [
        createPath(
          articulationFlatKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset
        )
      ]
    )
  }
}

const drawNaturalKeyShape = () => {
  return (styles, leftOffset, topOffset) => {
    const { articulationNaturalKey, fontColor } = styles
    return createGroup(
      'naturalKeyShape',
      [
        createPath(
          articulationNaturalKey.points,
          null,
          fontColor,
          leftOffset,
          topOffset
        )
      ]
    )
  }
}

const keys = { 'sharp': drawSharpKeyShape, 'flat': drawFlatKeyShape, 'natural': drawNaturalKeyShape }

export default function (singleUnit, articulationIndex, keyName, articulation, position, styles) {
  const { yDistanceBetweenArticulationKeysInVerticalLine, scaleFactorForArticulationKeys } = styles
  const drawnKeys = []
  const key = keys[keyName]
  if (key) {
    const drawnKey = key()(styles, 0, 0)
    scaleElementAroundPoint(
      drawnKey,
      scaleFactorForArticulationKeys,
      scaleFactorForArticulationKeys,
      {
        x: (drawnKey.left + drawnKey.right) / 2,
        y: (drawnKey.top + drawnKey.bottom) / 2
      }
    )
    moveElementInTheCenterBetweenPoints(
      drawnKey,
      articulation.left,
      articulation.right
    )
    if (position === 'above') {
      moveElementAbovePointWithInterval(
        drawnKey,
        articulation.top,
        yDistanceBetweenArticulationKeysInVerticalLine
      )
    } else {
      moveElementBelowPointWithInterval(
        drawnKey,
        articulation.bottom,
        yDistanceBetweenArticulationKeysInVerticalLine
      )
    }
    addPropertiesToElement(
      drawnKey,
      {
        'ref-ids': `articulation-key-${position}-${singleUnit.measureIndexInGeneral + 1}-${singleUnit.staveIndex + 1}-${singleUnit.voiceIndex + 1}-${singleUnit.singleUnitIndex + 1}-${articulationIndex + 1}`
      }
    )
    drawnKeys.push(drawnKey)
  }
  return createGroup(
    'keysInVerticalLine',
    drawnKeys
  )
}
