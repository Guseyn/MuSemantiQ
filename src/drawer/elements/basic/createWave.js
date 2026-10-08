'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import rotateElementAroundPoint from '#msq/drawer/elements/basic/rotateElementAroundPoint.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'

export default function (startPoint, endPoint, wavePeriodSymbol, fontColor, graceElementsScaleFactor, isGrace, minNumberOfWavePeriods = 2, lastWavePeriodSymbol = null) {
  const waveXLength = endPoint.x - startPoint.x
  const waveYLength = endPoint.y - startPoint.y
  const waveLength = Math.sqrt(Math.pow(waveXLength, 2) + Math.pow(waveYLength, 2))
  const waveTan = waveYLength / waveXLength
  const waveAngle = Math.atan(waveTan) * (180 / Math.PI)
  const wavePeriods = []
  let numberOfWavePeriods = 1
  const wavePeriodStandAlone = createPath(
    wavePeriodSymbol.points,
    null,
    fontColor,
    0,
    0
  )
  let lastWavePeriodStandAlone
  let lastWavePeriodStandAloneLength
  if (lastWavePeriodSymbol !== null) {
    lastWavePeriodStandAlone = createPath(
      lastWavePeriodSymbol.points,
      null,
      fontColor,
      0,
      0
    )
    if (isGrace) {
      scaleElementAroundPoint(
        lastWavePeriodStandAlone,
        graceElementsScaleFactor,
        graceElementsScaleFactor,
        {
          x: lastWavePeriodStandAlone.left,
          y: (lastWavePeriodStandAlone.top + lastWavePeriodStandAlone.bottom) / 2
        }
      )
    }
    lastWavePeriodStandAloneLength = lastWavePeriodStandAlone.right - lastWavePeriodStandAlone.left
  }
  if (isGrace) {
    scaleElementAroundPoint(
      wavePeriodStandAlone,
      graceElementsScaleFactor,
      graceElementsScaleFactor,
      {
        x: wavePeriodStandAlone.left,
        y: (wavePeriodStandAlone.top + wavePeriodStandAlone.bottom) / 2
      }
    )
  }
  const wavePeriodStandAloneLength = wavePeriodStandAlone.right - wavePeriodStandAlone.left
  let lastWavePeriodSymbolIsDrawn = false
  while (
    (
      (wavePeriodStandAloneLength * numberOfWavePeriods - wavePeriodSymbol.intersectionLength * (numberOfWavePeriods - 1) <= (waveLength + wavePeriodStandAloneLength / 2)) ||
      (numberOfWavePeriods <= minNumberOfWavePeriods)
    ) && !lastWavePeriodSymbolIsDrawn
  ) {
    const leftOffsetOfWavePeriod = startPoint.x + (numberOfWavePeriods - 1) * wavePeriodStandAloneLength - wavePeriodSymbol.intersectionLength * (numberOfWavePeriods - 1)
    const currentLength = (wavePeriodStandAloneLength * numberOfWavePeriods - wavePeriodSymbol.intersectionLength * (numberOfWavePeriods - 1))
    if (
      (lastWavePeriodSymbol !== null) &&
      (currentLength + lastWavePeriodStandAloneLength - lastWavePeriodSymbol.intersectionLength > (waveLength + lastWavePeriodStandAloneLength / 2)) &&
      (numberOfWavePeriods >= minNumberOfWavePeriods)
    ) {
      const wavePeriod = createPath(
        lastWavePeriodSymbol.points,
        null,
        fontColor,
        leftOffsetOfWavePeriod + wavePeriodSymbol.intersectionLength - lastWavePeriodSymbol.intersectionLength,
        startPoint.y + lastWavePeriodSymbol.yCorrection
      )
      if (isGrace) {
        scaleElementAroundPoint(
          wavePeriod,
          graceElementsScaleFactor,
          graceElementsScaleFactor,
          {
            x: wavePeriod.left,
            y: (wavePeriod.top + wavePeriod.bottom) / 2
          }
        )
      }
      wavePeriods.push(
        wavePeriod
      )
      lastWavePeriodSymbolIsDrawn = true
    } else {
      const wavePeriod = createPath(
        wavePeriodSymbol.points,
        null,
        fontColor,
        leftOffsetOfWavePeriod,
        startPoint.y + wavePeriodSymbol.yCorrection
      )
      if (isGrace) {
        scaleElementAroundPoint(
          wavePeriod,
          graceElementsScaleFactor,
          graceElementsScaleFactor,
          {
            x: wavePeriod.left,
            y: (wavePeriod.top + wavePeriod.bottom) / 2
          }
        )
      }
      wavePeriods.push(
        wavePeriod
      )
    }
    numberOfWavePeriods += 1
  }
  return rotateElementAroundPoint(
    createGroup(
      'wave',
      wavePeriods
    ),
    {
      x: startPoint.x,
      y: startPoint.y
    },
    waveAngle,
    {
      top: Math.min(startPoint.y, endPoint.y),
      right: Math.max(startPoint.x, endPoint.x),
      bottom: Math.max(startPoint.y, endPoint.y),
      left: Math.min(startPoint.x, endPoint.x)
    }
  )
}
