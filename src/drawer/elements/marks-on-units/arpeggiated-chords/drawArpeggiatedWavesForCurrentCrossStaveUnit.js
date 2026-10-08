'use strict'

import sortNotesForSingleUnitConsideringStaves from '#msq/drawer/elements/grouping-notes/chords/sortNotesForSingleUnitConsideringStaves.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createWave from '#msq/drawer/elements/basic/createWave.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits, styles, leftOffset, topOffsetsForEachStave, numberOfStaveLines, containsDrawnCrossStaveElementsBesideCrossStaveUnits) {
  const { fontColor, intervalBetweenStaveLines, arpeggioWavePeriod, arpeggioWaveWithArrowPeriod, spaceAfterBreathMark, spaceAfterOnlyLettersForArpeggiatedWaves, graceElementsScaleFactor } = styles
  const waves = []
  let currentWaveParams
  const positionalPaddingForWave = 0.5
  const isGrace = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.some(singleUnit => singleUnit.isGrace)
  let spaceBeforeArpeggiatedWaves = spaceAfterBreathMark * (isGrace ? graceElementsScaleFactor : 1)
  if (onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits[onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits.length - 1].numberOfKeys !== 0) {
    spaceBeforeArpeggiatedWaves = spaceAfterOnlyLettersForArpeggiatedWaves * (isGrace ? graceElementsScaleFactor : 1)
  } else {
    spaceBeforeArpeggiatedWaves = 0
  }
  const startXPositionOfWaves = onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits[onlyNoteLettersBeforeArpeggiatedWavesForCrossStaveUnits.length - 1].right + spaceBeforeArpeggiatedWaves
  const connectedArpeggiatedSingleUnitsParams = []
  const wavePeriodStandAlone = createPath(
    arpeggioWavePeriod.points,
    null,
    fontColor,
    0,
    0
  )
  const waveWithArrowPeriodStandAlone = createPath(
    arpeggioWaveWithArrowPeriod.points,
    null,
    fontColor,
    0,
    0
  )
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
    scaleElementAroundPoint(
      waveWithArrowPeriodStandAlone,
      graceElementsScaleFactor,
      graceElementsScaleFactor,
      {
        x: waveWithArrowPeriodStandAlone.left,
        y: (waveWithArrowPeriodStandAlone.top + wavePeriodStandAlone.bottom) / 2
      }
    )
  }
  const waveAmplitude = wavePeriodStandAlone.bottom - wavePeriodStandAlone.top
  const waveWithArrowAmplitude = waveWithArrowPeriodStandAlone.bottom - waveWithArrowPeriodStandAlone.top
  for (let singleUnitParamIndex = 0; singleUnitParamIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex]
    const currentStaveIndex = currentSingleUnitParams.staveIndex
    if (currentSingleUnitParams.arpeggiated) {
      connectedArpeggiatedSingleUnitsParams.push(currentSingleUnitParams)
      const sortedNotes = sortNotesForSingleUnitConsideringStaves(currentSingleUnitParams.notes)
      if (!currentWaveParams) {
        let staveIndexForFirstNote = currentStaveIndex
        if (sortedNotes[0].stave === 'next') {
          staveIndexForFirstNote += 1
        } else if (sortedNotes[0].stave === 'prev') {
          staveIndexForFirstNote -= 1
        }
        currentWaveParams = {
          minY: (topOffsetsForEachStave[staveIndexForFirstNote] || topOffsetsForEachStave[currentStaveIndex]) + (sortedNotes[0].positionNumber - positionalPaddingForWave) * intervalBetweenStaveLines
        }
      }
      if (currentSingleUnitParams.arpeggiated.arrow) {
        currentWaveParams.arrow = currentSingleUnitParams.arpeggiated.arrow
      }
      if (!currentSingleUnitParams.arpeggiated.isConnectedWithNextChord || (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex + 1] && !selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex + 1].arpeggiated) || (singleUnitParamIndex === selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length - 1)) {
        let staveIndexForLastNote = currentStaveIndex
        if (sortedNotes[sortedNotes.length - 1].stave === 'next') {
          staveIndexForLastNote += 1
        } else if (sortedNotes[sortedNotes.length - 1].stave === 'prev') {
          staveIndexForLastNote -= 1
        }
        currentWaveParams.maxY = (topOffsetsForEachStave[staveIndexForLastNote] || topOffsetsForEachStave[currentStaveIndex]) + (sortedNotes[sortedNotes.length - 1].positionNumber + positionalPaddingForWave) * intervalBetweenStaveLines
        const amplitudeOffset = (currentWaveParams.arrow ? waveWithArrowAmplitude / 2 : waveAmplitude / 2)
        const wave = createWave(
          { x: startXPositionOfWaves, y: currentWaveParams.arrow === 'up' ? currentWaveParams.maxY : currentWaveParams.minY },
          { x: startXPositionOfWaves, y: currentWaveParams.arrow === 'up' ? currentWaveParams.minY : currentWaveParams.maxY },
          arpeggioWavePeriod,
          fontColor,
          graceElementsScaleFactor,
          isGrace,
          1,
          currentWaveParams.arrow ? arpeggioWaveWithArrowPeriod : null
        )
        wave.left = wave.left - amplitudeOffset
        wave.right = wave.right + amplitudeOffset
        connectedArpeggiatedSingleUnitsParams.forEach(singleUnitParams => {
          addPropertiesToElement(
            wave,
            {
              'ref-ids': `arpeggiated-wave-${singleUnitParams.measureIndexInGeneral + 1}-${singleUnitParams.staveIndex + 1}-${singleUnitParams.voiceIndex + 1}-${singleUnitParams.singleUnitIndex + 1}`
            }
          )
        })
        waves.push(wave)
        connectedArpeggiatedSingleUnitsParams.length = 0
        currentWaveParams = undefined
      }
    }
  }
  if (waves.length === 0) {
    return {
      isEmpty: true,
      name: 'g',
      properties: {
        'data-name': 'arpeggiatedWavesForCrossStaveUnit'
      },
      transformations: [],
      top: topOffsetsForEachStave[0],
      right: startXPositionOfWaves,
      bottom: topOffsetsForEachStave[topOffsetsForEachStave.length - 1],
      left: startXPositionOfWaves,
      numberOfWaves: 0
    }
  }
  containsDrawnCrossStaveElementsBesideCrossStaveUnits.value = true
  const groupedApregiatedWavesForCrossStaveUnit = createGroup(
    'arpeggiatedWavesForCrossStaveUnit',
    [...waves ]
  )
  return createElementWithAdditionalInformation(
    groupedApregiatedWavesForCrossStaveUnit,
    {
      numberOfWaves: waves.length
    }
  )
}
