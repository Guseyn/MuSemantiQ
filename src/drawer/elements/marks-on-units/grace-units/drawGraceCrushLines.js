'use strict'

import createLine from '#msq/drawer/elements/basic/createLine.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (voicesOnPageLine, styles) {
  const { crushGraceLineXPaddingForUnitwithFlagsAndStemUp, crushGraceLineXPaddingForUnitwithFlagsAndStemDown, crushGraceLineXPaddingForUnitWithoutFlags, crushGraceLineXPaddingForBeamedUnit, crushGraceLineStemUpHeightForUnitWithFlags, crushGraceLineStemUpHeightForUnitWithoutFlags, crushGraceLineStemUpHeightForBeamedUnit, crushGraceLineStemDownHeightForUnitWithFlags, crushGraceLineStemDownHeightForUnitWithoutFlags, crushGraceLineStemDownHeightForBeamedUnit, crushGraceYMarginForStemUp, crushGraceYMarginForStemUpWithoutFlags, crushGraceYMarginForStemDown, crushGraceYMarginForStemDownWithoutFlags, crushGraceYMarginForBeamedStemUp, crushGraceYMarginForBeamedStemDown, crushGraceLineStrokeOptions } = styles
  const graceCrashLines = []
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { singleUnitsInAllCrossStaveUnits, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < singleUnitsInAllCrossStaveUnits.length; crossStaveUnitIndex++) {
          const currentCrossStaveUnit = singleUnitsInAllCrossStaveUnits[crossStaveUnitIndex]
          for (let crossVoiceUnitIndex = 0; crossVoiceUnitIndex < currentCrossStaveUnit.length; crossVoiceUnitIndex++) {
            const currentCrossVoiceUnitInCurrentCrossStaveUnit = currentCrossStaveUnit[crossVoiceUnitIndex]
            for (let singleUnitIndex = 0; singleUnitIndex < currentCrossVoiceUnitInCurrentCrossStaveUnit.length; singleUnitIndex++) {
              const currentSingleUnit = currentCrossVoiceUnitInCurrentCrossStaveUnit[singleUnitIndex]
              const xCenterForCrashLine = currentSingleUnit.withFlags
                ? (currentSingleUnit.stemLeft + currentSingleUnit.flagsRight) / 2
                : (currentSingleUnit.stemLeft + currentSingleUnit.stemRight) / 2
              const crashLinePoints = []
              const crushGraceLineXPadding = currentSingleUnit.withFlags
                ? (currentSingleUnit.stemDirection === 'up')
                  ? crushGraceLineXPaddingForUnitwithFlagsAndStemUp
                  : crushGraceLineXPaddingForUnitwithFlagsAndStemDown
                : currentSingleUnit.beamed
                  ? crushGraceLineXPaddingForBeamedUnit
                  : crushGraceLineXPaddingForUnitWithoutFlags
              const crushGraceLineStemUpHeight = currentSingleUnit.withFlags
                ? crushGraceLineStemUpHeightForUnitWithFlags
                : currentSingleUnit.beamed
                  ? crushGraceLineStemUpHeightForBeamedUnit
                  : crushGraceLineStemUpHeightForUnitWithoutFlags
              const crushGraceLineStemDownHeight = currentSingleUnit.withFlags
                ? crushGraceLineStemDownHeightForUnitWithFlags
                : currentSingleUnit.beamed
                  ? crushGraceLineStemDownHeightForBeamedUnit
                  : crushGraceLineStemDownHeightForUnitWithoutFlags
              const crushGraceYMargin = currentSingleUnit.stemDirection === 'up'
                ? currentSingleUnit.beamed
                  ? crushGraceYMarginForBeamedStemUp
                  : currentSingleUnit.withFlags
                    ? crushGraceYMarginForStemUp
                    : crushGraceYMarginForStemUpWithoutFlags
                : currentSingleUnit.beamed
                  ? crushGraceYMarginForBeamedStemDown
                  : currentSingleUnit.withFlags
                    ? crushGraceYMarginForStemDown
                    : crushGraceYMarginForStemDownWithoutFlags
              if (currentSingleUnit.isGrace && !currentCrossStaveUnit.stemless && currentSingleUnit.hasGraceCrushLine) {
                if (currentSingleUnit.stemDirection === 'up') {
                  crashLinePoints.push(
                    xCenterForCrashLine - crushGraceLineXPadding,
                    currentSingleUnit.top + crushGraceYMargin + crushGraceLineStemUpHeight,
                    xCenterForCrashLine + crushGraceLineXPadding,
                    currentSingleUnit.top + crushGraceYMargin
                  )
                } else {
                  crashLinePoints.push(
                    xCenterForCrashLine - crushGraceLineXPadding,
                    currentSingleUnit.bottom - crushGraceYMargin - crushGraceLineStemDownHeight,
                    xCenterForCrashLine + crushGraceLineXPadding,
                    currentSingleUnit.bottom - crushGraceYMargin
                  )
                }
                const graceCrashLine = createLine(
                  ...crashLinePoints,
                  crushGraceLineStrokeOptions
                )
                addPropertiesToElement(
                  graceCrashLine,
                  {
                    'ref-ids': `grace-crush-line-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
                  }
                )
                graceCrashLines.push(graceCrashLine)
              }
            }
          }
        }
      }
    }
  }
  return graceCrashLines
}
