'use strict'

import drawStaccato from '#msq/drawer/elements/marks-on-units/articulations/drawStaccato.js'
import drawSpiccato from '#msq/drawer/elements/marks-on-units/articulations/drawSpiccato.js'
import drawAccent from '#msq/drawer/elements/marks-on-units/articulations/drawAccent.js'
import drawTenuto from '#msq/drawer/elements/marks-on-units/articulations/drawTenuto.js'
import drawMarcato from '#msq/drawer/elements/marks-on-units/articulations/drawMarcato.js'
import drawFermata from '#msq/drawer/elements/marks-on-units/articulations/drawFermata.js'
import drawLeftHandPizzicato from '#msq/drawer/elements/marks-on-units/articulations/drawLeftHandPizzicato.js'
import drawSnapPizzicato from '#msq/drawer/elements/marks-on-units/articulations/drawSnapPizzicato.js'
import drawNaturalHarmonic from '#msq/drawer/elements/marks-on-units/articulations/drawNaturalHarmonic.js'
import drawUpBow from '#msq/drawer/elements/marks-on-units/articulations/drawUpBow.js'
import drawDownBow from '#msq/drawer/elements/marks-on-units/articulations/drawDownBow.js'
import drawTurn from '#msq/drawer/elements/marks-on-units/ornaments/drawTurn.js'
import drawTrill from '#msq/drawer/elements/marks-on-units/ornaments/drawTrill.js'
import drawMordent from '#msq/drawer/elements/marks-on-units/ornaments/drawMordent.js'
import drawNoteLetter from '#msq/drawer/elements/marks-on-units/text-labels/drawNoteLetter.js'
import drawDynamicMark from '#msq/drawer/elements/marks-on-units/dynamics/drawDynamicMark.js'
import drawOctaveSign from '#msq/drawer/elements/spans/octave-signs/drawOctaveSign.js'

const articulations = {
  staccato: drawStaccato,
  spiccato: drawSpiccato,
  accent: drawAccent,
  tenuto: drawTenuto,
  marcato: drawMarcato,
  fermata: drawFermata,
  leftHandPizzicato: drawLeftHandPizzicato,
  snapPizzicato: drawSnapPizzicato,
  naturalHarmonic: drawNaturalHarmonic,
  upBow: drawUpBow,
  downBow: drawDownBow,
  turn: drawTurn,
  trill: drawTrill,
  mordent: drawMordent,
  noteLetter: drawNoteLetter,
  dynamicMark: drawDynamicMark,
  octaveSign: drawOctaveSign
}

const articulationsThatNeedOutline = [ 'staccato', 'tenuto', 'naturalHarmonic', 'snapPizzicato', 'leftHandPizzicato', 'spiccato' ]

import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import calculateTopOfStaveForFirstNoteInCurrentSingleUnit from '#msq/drawer/elements/shared/calculateTopOfStaveForFirstNoteInCurrentSingleUnit.js'
import calculateTopOfStaveForLastNoteInCurrentSingleUnit from '#msq/drawer/elements/shared/calculateTopOfStaveForLastNoteInCurrentSingleUnit.js'
import isArticulationAttachedToUnit from '#msq/drawer/elements/marks-on-units/articulations/isArticulationAttachedToUnit.js'
import drawOutlineForArticulation from '#msq/drawer/elements/marks-on-units/articulations/drawOutlineForArticulation.js'

export default function (voicesOnPageLine, drawOnlyArticulationsAttachedToUnit, onlyArticulationsBelowOrAboveStave, dontDrawDynamics, drawOnlyDynamics, styles) {
  const { intervalBetweenStaveLines, graceElementsScaleFactor } = styles
  const drawnArticulations = []
  for (let measureIndex = 0; measureIndex < voicesOnPageLine.length; measureIndex++) {
    if (voicesOnPageLine[measureIndex]) {
      const { singleUnitsInVoices, topOffsetsForEachStave, numberOfStaveLines, withoutVoices } = voicesOnPageLine[measureIndex]
      if (!withoutVoices) {
        for (let staveIndex = 0; staveIndex < singleUnitsInVoices.length; staveIndex++) {
          if (singleUnitsInVoices[staveIndex]) {
            for (let voiceIndex = 0; voiceIndex < singleUnitsInVoices[staveIndex].length; voiceIndex++) {
              if (singleUnitsInVoices[staveIndex][voiceIndex]) {
                for (let singleUnitIndex = 0; singleUnitIndex < singleUnitsInVoices[staveIndex][voiceIndex].length; singleUnitIndex++) {
                  const currentSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex]
                  const nextSingleUnit = singleUnitsInVoices[staveIndex][voiceIndex][singleUnitIndex + 1]
                  for (let articulationIndex = 0; articulationIndex < currentSingleUnit.articulationParams.length; articulationIndex++) {
                    const currentArticulationParams = currentSingleUnit.articulationParams[articulationIndex]
                    const currentArticulationIsAttachedToUnit = isArticulationAttachedToUnit(currentArticulationParams)
                    if (
                      (drawOnlyArticulationsAttachedToUnit && currentArticulationIsAttachedToUnit) ||
                      (onlyArticulationsBelowOrAboveStave && !currentArticulationIsAttachedToUnit)
                    ) {
                      if (!currentArticulationParams.direction) {
                        currentArticulationParams.direction = 'up'
                      }
                      if (articulations[currentArticulationParams.name] && ((dontDrawDynamics && (currentArticulationParams.name !== 'dynamicMark')) || (drawOnlyDynamics && (currentArticulationParams.name === 'dynamicMark')))) {
                        const topOfStaveForFirstNoteInCurrentSingleUnit = calculateTopOfStaveForFirstNoteInCurrentSingleUnit(staveIndex, currentSingleUnit, topOffsetsForEachStave)
                        const topOfStaveForLastNoteInCurrentSingleUnit = calculateTopOfStaveForLastNoteInCurrentSingleUnit(staveIndex, currentSingleUnit, topOffsetsForEachStave)
                        const bottomOfStaveForLastNoteInCurrentSingleUnit = topOfStaveForLastNoteInCurrentSingleUnit + (numberOfStaveLines - 1) * (intervalBetweenStaveLines)
                        const articulation = currentArticulationParams.name === 'trill'
                          ? articulations[currentArticulationParams.name](currentSingleUnit, articulationIndex, nextSingleUnit, currentArticulationParams, topOfStaveForFirstNoteInCurrentSingleUnit, bottomOfStaveForLastNoteInCurrentSingleUnit, styles)
                          : articulations[currentArticulationParams.name](currentSingleUnit, articulationIndex, currentArticulationParams, topOfStaveForFirstNoteInCurrentSingleUnit, bottomOfStaveForLastNoteInCurrentSingleUnit, styles)
                        addPropertiesToElement(
                          articulation,
                          {
                            'ref-ids': `articulation-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}-${articulationIndex + 1}`
                          }
                        )
                        moveElement(
                          articulation,
                          0, (currentArticulationParams.yCorrection || 0) * intervalBetweenStaveLines
                        )
                        if (currentArticulationParams.isGrace) {
                          scaleElementAroundPoint(
                            articulation,
                            graceElementsScaleFactor,
                            graceElementsScaleFactor,
                            {
                              x: (articulation.left + articulation.right) / 2,
                              y: (currentArticulationParams.direction === 'up' || !currentArticulationParams.direction)
                                ? articulation.bottom
                                : articulation.top
                            }
                          )
                        }
                        const articulationComponents = []
                        if (articulationsThatNeedOutline.indexOf(currentArticulationParams.name) !== -1) {
                          articulationComponents.push(
                            drawOutlineForArticulation(articulation, styles)
                          )
                        }
                        articulationComponents.push(articulation)
                        const articulationWithOutline = createGroup(
                          currentArticulationParams.name,
                          articulationComponents
                        )
                        drawnArticulations.push(
                          articulationWithOutline
                        )
                        if (currentArticulationParams.direction === 'up' || !currentArticulationParams.direction) {
                          currentSingleUnit.top = Math.min(currentSingleUnit.top - styles.articulationYAdditionalOffset * (currentArticulationParams.isGrace ? graceElementsScaleFactor : 1), articulation.top - styles.articulationYAdditionalOffset * (currentArticulationParams.isGrace ? graceElementsScaleFactor : 1))
                        } else if (currentArticulationParams.direction === 'down') {
                          currentSingleUnit.bottom = Math.max(currentSingleUnit.bottom + styles.articulationYAdditionalOffset * (currentArticulationParams.isGrace ? graceElementsScaleFactor : 1), articulation.bottom + styles.articulationYAdditionalOffset * (currentArticulationParams.isGrace ? graceElementsScaleFactor : 1))
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return drawnArticulations
}
