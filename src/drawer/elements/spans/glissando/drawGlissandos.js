'use strict'

import drawGlissandoShape from '#msq/drawer/elements/spans/glissando/drawGlissandoShape.js'

export default function (voicesOnPageLine, voicesBodiesOnPageLine, measuresOnPageLine, styles) {
  const glissandos = []
  const glissandosStack = {}
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { measureIndexOnPageLine, singleUnitsInAllCrossStaveUnits, voicesBody, numberOfStaveLines, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let crossStaveUnitIndex = 0; crossStaveUnitIndex < singleUnitsInAllCrossStaveUnits.length; crossStaveUnitIndex++) {
          const currentCrossStaveUnit = singleUnitsInAllCrossStaveUnits[crossStaveUnitIndex]
          for (let crossVoiceUnitIndex = 0; crossVoiceUnitIndex < currentCrossStaveUnit.length; crossVoiceUnitIndex++) {
            const currentCrossVoiceUnitInCurrentCrossStaveUnit = currentCrossStaveUnit[crossVoiceUnitIndex]
            let currentCrossVoiceUnitIsLastInCurrentCrossStaveUnit = crossVoiceUnitIndex === currentCrossStaveUnit.length - 1
            if (!currentCrossVoiceUnitIsLastInCurrentCrossStaveUnit) {
              for (let crossVoiceUnitIndexAfter = crossVoiceUnitIndex + 1; crossVoiceUnitIndexAfter < currentCrossStaveUnit.length; crossVoiceUnitIndexAfter++) {
                if (crossVoiceUnitIndexAfter === currentCrossStaveUnit.length - 1) {
                  if (!currentCrossStaveUnit[crossVoiceUnitIndexAfter]) {
                    currentCrossVoiceUnitIsLastInCurrentCrossStaveUnit = true
                    break
                  }
                  if (currentCrossStaveUnit[crossVoiceUnitIndexAfter].length === 0) {
                    currentCrossVoiceUnitIsLastInCurrentCrossStaveUnit = true
                    break
                  }
                  break
                }
                if (!currentCrossStaveUnit[crossVoiceUnitIndexAfter]) {
                  continue
                }
                if (currentCrossStaveUnit[crossVoiceUnitIndexAfter].length === 0) {
                  continue
                }
                break
              }
            }
            for (let singleUnitIndex = 0; singleUnitIndex < currentCrossVoiceUnitInCurrentCrossStaveUnit.length; singleUnitIndex++) {
              const currentSingleUnit = currentCrossVoiceUnitInCurrentCrossStaveUnit[singleUnitIndex]
              if (currentSingleUnit.glissandoMarks) {
                for (let glissandoMarkIndex = 0; glissandoMarkIndex < currentSingleUnit.glissandoMarks.length; glissandoMarkIndex++) {
                  const currentGlissandoMark = currentSingleUnit.glissandoMarks[glissandoMarkIndex]
                  const currentGlissandoMarkKey = currentGlissandoMark.key
                  if (!glissandosStack[currentGlissandoMarkKey]) {
                    let glissandoStartsBeforeCertainMeasure
                    let glissandoFinishesAfterCertainMeasure
                    if (currentGlissandoMark.beforeMeasure) {
                      glissandoStartsBeforeCertainMeasure = (currentGlissandoMark.beforeMeasure - 1)
                      if (isNaN(glissandoStartsBeforeCertainMeasure)) {
                        glissandoStartsBeforeCertainMeasure = measureIndexOnPageLine
                      }
                    }
                    if (currentGlissandoMark.afterMeasure) {
                      glissandoFinishesAfterCertainMeasure = (currentGlissandoMark.afterMeasure - 1)
                      if (isNaN(glissandoFinishesAfterCertainMeasure)) {
                        glissandoFinishesAfterCertainMeasure = measureIndexOnPageLine
                      }
                    }
                    const glissandoStartsBefore = currentGlissandoMark.before
                    const glissandoFinishesAfter = currentGlissandoMark.after
                    let currentGlissandoDirection = 'up'
                    if (glissandoStartsBeforeCertainMeasure !== undefined || glissandoFinishesAfterCertainMeasure !== undefined || glissandoStartsBefore !== undefined || glissandoFinishesAfter !== undefined) {
                      currentGlissandoDirection = currentGlissandoMark.direction
                    }
                    glissandosStack[currentGlissandoMarkKey] = {
                      startsBeforeCertainMeasure: glissandoStartsBeforeCertainMeasure,
                      finishesAfterCertainMeasure: glissandoFinishesAfterCertainMeasure,
                      startsBefore: glissandoStartsBefore,
                      finishesAfter: glissandoFinishesAfter,
                      glissandoDirection: currentGlissandoDirection,
                      glissandoMarkKey: currentGlissandoMarkKey,
                      form: currentGlissandoMark.form || 'wave'
                    }
                    if (glissandoStartsBefore || glissandoStartsBeforeCertainMeasure !== undefined) {
                      glissandosStack[currentGlissandoMarkKey].rightSingleUnit = currentSingleUnit
                      glissandos.push(
                        drawGlissandoShape(glissandosStack[currentGlissandoMarkKey], currentGlissandoMarkKey, voicesBody, voicesBodiesOnPageLine, measuresOnPageLine, true, false, numberOfStaveLines, styles)
                      )
                      delete glissandosStack[currentGlissandoMarkKey]
                    } else if (glissandoFinishesAfter) {
                      glissandosStack[currentGlissandoMarkKey].leftSingleUnit = currentSingleUnit
                      glissandos.push(
                        drawGlissandoShape(glissandosStack[currentGlissandoMarkKey], currentGlissandoMarkKey, voicesBody, voicesBodiesOnPageLine, measuresOnPageLine, false, true, numberOfStaveLines, styles)
                      )
                      delete glissandosStack[currentGlissandoMarkKey]
                    } else {
                      glissandosStack[currentGlissandoMarkKey].leftSingleUnit = currentSingleUnit
                    }
                  } else {
                    glissandosStack[currentGlissandoMarkKey].rightSingleUnit = currentSingleUnit
                    glissandos.push(
                      drawGlissandoShape(glissandosStack[currentGlissandoMarkKey], currentGlissandoMarkKey, voicesBody, voicesBodiesOnPageLine, measuresOnPageLine, false, false, numberOfStaveLines, styles)
                    )
                    delete glissandosStack[currentGlissandoMarkKey]
                  }
                }
              }
              const currentSingleUnitIsLastInCurrentCrossStaveUnit = currentCrossVoiceUnitIsLastInCurrentCrossStaveUnit && (singleUnitIndex === currentCrossVoiceUnitInCurrentCrossStaveUnit.length - 1)
              if (currentSingleUnitIsLastInCurrentCrossStaveUnit) {
                for (const currentGlissandoMarkKey in glissandosStack) {
                  const currentMarkedGlissando = glissandosStack[currentGlissandoMarkKey]
                  if (currentMarkedGlissando.finishesAfterCertainMeasure === measureIndexOnPageLine || currentSingleUnit.isLastSingleUnitInVoiceOnPageLine) {
                    if (currentMarkedGlissando.leftSingleUnit) {
                      glissandos.push(
                        drawGlissandoShape(currentMarkedGlissando, currentGlissandoMarkKey, voicesBody, voicesBodiesOnPageLine, measuresOnPageLine, false, true, numberOfStaveLines, styles)
                      )
                    }
                    delete glissandosStack[currentGlissandoMarkKey]
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return glissandos
}
