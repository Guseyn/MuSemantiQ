'use strict'

import calculateNumberOfBeamsByDuration from '#msq/drawer/elements/shared/calculateNumberOfBeamsByDuration.js'
import drawStemForSingleUnitInBeamedPartOfVoiceByStemPlaceholderCoordinates from '#msq/drawer/elements/grouping-notes/stems/drawStemForSingleUnitInBeamedPartOfVoiceByStemPlaceholderCoordinates.js'
import drawBeamsForStems from '#msq/drawer/elements/grouping-notes/beams/drawBeamsForStems.js'
import calculateBeamLineCoefficients from '#msq/drawer/elements/grouping-notes/beams/calculateBeamLineCoefficients.js'
import calculateStemExtremePositionForDrawnBeamedSingleUnit from '#msq/drawer/elements/grouping-notes/beams/calculateStemExtremePositionForDrawnBeamedSingleUnit.js'
import areAnyStemDirectionChangesInBeamedSingleUnits from '#msq/drawer/elements/grouping-notes/beams/areAnyStemDirectionChangesInBeamedSingleUnits.js'
import calculateFirstAndLastBeamedSingleUnitStemsEnds from '#msq/drawer/elements/grouping-notes/beams/calculateFirstAndLastBeamedSingleUnitStemsEnds.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (singleUnitsInVoice, styles) {
  const beamsWithStems = []
  const { beamBackgroundStrokeOptions, noteSquareStemStrokeOptions, beamWidth, heightOfBeamedStemExtension, noteBeamStrokeOptions, graceElementsScaleFactor } = styles
  const stemWidth = noteSquareStemStrokeOptions.width

  let currentBeamedSingleUnits = []
  let minTopInCurrentBeamedSingleUnits
  let maxBottomInCurrentBeamedSingleUnits
  let lastBeamedSingleUnit
  singleUnitsInVoice.forEach((singleUnit, index) => {
    const isGrace = singleUnit.isGrace
    let tunedStemWidth = stemWidth
    let tunedBeamWidth = beamWidth
    let tunedHeightOfBeamedStemExtension = heightOfBeamedStemExtension
    const tunedNoteBeamStrokeOptions = Object.assign({}, noteBeamStrokeOptions)
    if (isGrace) {
      tunedStemWidth *= graceElementsScaleFactor
      tunedBeamWidth *= graceElementsScaleFactor
      tunedHeightOfBeamedStemExtension *= graceElementsScaleFactor
      tunedNoteBeamStrokeOptions.width *= graceElementsScaleFactor
    }

    if ((currentBeamedSingleUnits.length === 0) && lastBeamedSingleUnit) {
      addPropertiesToElement(
        singleUnit,
        {
          'ref-ids': `next-to-unit-not-connected-with-beam-${lastBeamedSingleUnit.measureIndexInGeneral + 1}-${lastBeamedSingleUnit.staveIndex + 1}-${lastBeamedSingleUnit.voiceIndex + 1}-${lastBeamedSingleUnit.singleUnitIndex + 1}`
        }
      )
    }

    const isDrawnSingleUnitBeamed = singleUnit.beamed && !singleUnit.stemless

    if (isDrawnSingleUnitBeamed) {
      if (minTopInCurrentBeamedSingleUnits === undefined || minTopInCurrentBeamedSingleUnits > singleUnit.stemTop) {
        minTopInCurrentBeamedSingleUnits = singleUnit.stemTop
      }
      if (maxBottomInCurrentBeamedSingleUnits === undefined || maxBottomInCurrentBeamedSingleUnits < singleUnit.stemBottom) {
        maxBottomInCurrentBeamedSingleUnits = singleUnit.stemBottom
      }
      currentBeamedSingleUnits.push(singleUnit)
    }

    const weAreReadyToDrawnNextBeamsOnPageLine = (currentBeamedSingleUnits.length > 1) &&
      (
        !singleUnit.beamedWithNext ||
        singleUnit.withFlags ||
        singleUnit.isGraceUnitAndNextUnitIsNotGrace ||
        (index === singleUnitsInVoice.length - 1)
      )
    if (weAreReadyToDrawnNextBeamsOnPageLine) {
      const firstDrawnBeamedSingleUnit = currentBeamedSingleUnits[0]
      const lastDrawnBeamedSingleUnit = currentBeamedSingleUnits[currentBeamedSingleUnits.length - 1]
      lastDrawnBeamedSingleUnit.beamedWithNext = false
      lastBeamedSingleUnit = lastDrawnBeamedSingleUnit
      const anyStemDirectionChangesInBeamedSingleUnits = areAnyStemDirectionChangesInBeamedSingleUnits(currentBeamedSingleUnits)

      const durationsOfCurrentBeamedSingleUnits = currentBeamedSingleUnits.map(chord => chord.unitDuration)
      const minDurationAmongCurrentBeamedSingleUnits = Math.min(...durationsOfCurrentBeamedSingleUnits)
      const maxDurationAmongCurrentBeamedSingleUnits = Math.max(...durationsOfCurrentBeamedSingleUnits)
      const maxNumberOfBeamsForCurrentBeamedSingleUnits = calculateNumberOfBeamsByDuration(minDurationAmongCurrentBeamedSingleUnits)
      const minNumberOfBeamsForCurrentBeamedSingleUnits = calculateNumberOfBeamsByDuration(maxDurationAmongCurrentBeamedSingleUnits)
      const beamLineHeightNormal = Math.sqrt(Math.pow(tunedBeamWidth, 2) - Math.pow(tunedStemWidth, 2))
      const numberOfBeamsThatCanBeIntersectedInStemVertical = 1
      const numberOfCommonBeams = (
        maxNumberOfBeamsForCurrentBeamedSingleUnits === numberOfBeamsThatCanBeIntersectedInStemVertical
          ? maxNumberOfBeamsForCurrentBeamedSingleUnits - (numberOfBeamsThatCanBeIntersectedInStemVertical - 1)
          : (
            maxNumberOfBeamsForCurrentBeamedSingleUnits > numberOfBeamsThatCanBeIntersectedInStemVertical
              ? maxNumberOfBeamsForCurrentBeamedSingleUnits - numberOfBeamsThatCanBeIntersectedInStemVertical
              : maxNumberOfBeamsForCurrentBeamedSingleUnits
          )
      )
      const allBeamsHeightNormalWhereAllStemsWithSameDirection = (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) * numberOfCommonBeams

      const { firstDrawnBeamedSingleUnitStemEnd, lastDrawnBeamedSingleUnitStemEnd } = calculateFirstAndLastBeamedSingleUnitStemsEnds(currentBeamedSingleUnits, anyStemDirectionChangesInBeamedSingleUnits, minTopInCurrentBeamedSingleUnits, maxBottomInCurrentBeamedSingleUnits, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, styles)

      const stems = []

      const stemForFirstDrawnSingleUnit = createElementWithAdditionalInformation(
        drawStemForSingleUnitInBeamedPartOfVoiceByStemPlaceholderCoordinates(
          styles,
          firstDrawnBeamedSingleUnit.stemLeft,
          firstDrawnBeamedSingleUnitStemEnd,
          firstDrawnBeamedSingleUnit.stemDirection === 'up'
            ? firstDrawnBeamedSingleUnit.stemTop
            : firstDrawnBeamedSingleUnit.stemBottom,
          firstDrawnBeamedSingleUnit.isGrace
        ),
        {
          measureIndexInGeneral: firstDrawnBeamedSingleUnit.measureIndexInGeneral,
          staveIndex: firstDrawnBeamedSingleUnit.staveIndex,
          voiceIndex: firstDrawnBeamedSingleUnit.voiceIndex,
          singleUnitIndex: firstDrawnBeamedSingleUnit.singleUnitIndex,
          direction: firstDrawnBeamedSingleUnit.stemDirection,
          unitDuration: firstDrawnBeamedSingleUnit.unitDuration,
          beamedWithNext: firstDrawnBeamedSingleUnit.beamedWithNext,
          beamedWithNextWithJustOneBeam: firstDrawnBeamedSingleUnit.beamedWithNextWithJustOneBeam,
          numberOfTremoloStrokesInUnit: firstDrawnBeamedSingleUnit.numberOfTremoloStrokes,
          hasConnectedTremolo: firstDrawnBeamedSingleUnit.hasConnectedTremolo,
          nonDisplacedPartOfUnitWidth: firstDrawnBeamedSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right - firstDrawnBeamedSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left,
          isGrace: firstDrawnBeamedSingleUnit.isGrace,
          isRest: firstDrawnBeamedSingleUnit.isRest
        }
      )
      const stemForLastDrawnSingleUnit = createElementWithAdditionalInformation(
        drawStemForSingleUnitInBeamedPartOfVoiceByStemPlaceholderCoordinates(
          styles,
          lastDrawnBeamedSingleUnit.stemLeft,
          lastDrawnBeamedSingleUnitStemEnd,
          lastDrawnBeamedSingleUnit.stemDirection === 'up'
            ? lastDrawnBeamedSingleUnit.stemTop
            : lastDrawnBeamedSingleUnit.stemBottom,
          lastDrawnBeamedSingleUnit.isGrace
        ),
        {
          measureIndexInGeneral: lastDrawnBeamedSingleUnit.measureIndexInGeneral,
          staveIndex: lastDrawnBeamedSingleUnit.staveIndex,
          voiceIndex: lastDrawnBeamedSingleUnit.voiceIndex,
          singleUnitIndex: lastDrawnBeamedSingleUnit.singleUnitIndex,
          direction: lastDrawnBeamedSingleUnit.stemDirection,
          unitDuration: lastDrawnBeamedSingleUnit.unitDuration,
          beamedWithNext: lastDrawnBeamedSingleUnit.beamedWithNext,
          beamedWithNextWithJustOneBeam: lastDrawnBeamedSingleUnit.beamedWithNextWithJustOneBeam,
          numberOfTremoloStrokesInUnit: lastDrawnBeamedSingleUnit.numberOfTremoloStrokes,
          hasConnectedTremolo: lastDrawnBeamedSingleUnit.hasConnectedTremolo,
          nonDisplacedPartOfUnitWidth: lastDrawnBeamedSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.right - lastDrawnBeamedSingleUnit.nonDisplacedPartOfSingleUnitWithCoordinates.left,
          isGrace: lastDrawnBeamedSingleUnit.isGrace,
          isRest: lastDrawnBeamedSingleUnit.isRest
        }
      )

      const beamLineCoefficients = calculateBeamLineCoefficients(
        stemForFirstDrawnSingleUnit.left,
        firstDrawnBeamedSingleUnit.stemDirection === 'up'
          ? stemForFirstDrawnSingleUnit.top
          : stemForFirstDrawnSingleUnit.bottom,
        stemForLastDrawnSingleUnit.left,
        lastDrawnBeamedSingleUnit.stemDirection === 'up'
          ? stemForLastDrawnSingleUnit.top
          : stemForLastDrawnSingleUnit.bottom
      )

      stems.push(
        stemForFirstDrawnSingleUnit
      )

      for (let index = 1; index < currentBeamedSingleUnits.length - 1; index++) {
        stems.push(
          createElementWithAdditionalInformation(
            drawStemForSingleUnitInBeamedPartOfVoiceByStemPlaceholderCoordinates(
              styles,
              currentBeamedSingleUnits[index].stemLeft,
              calculateStemExtremePositionForDrawnBeamedSingleUnit(
                currentBeamedSingleUnits[index],
                beamLineCoefficients
              ),
              currentBeamedSingleUnits[index].stemDirection === 'up'
                ? currentBeamedSingleUnits[index].stemTop
                : currentBeamedSingleUnits[index].stemBottom,
              currentBeamedSingleUnits[index].isGrace
            ),
            {
              measureIndexInGeneral: currentBeamedSingleUnits[index].measureIndexInGeneral,
              staveIndex: currentBeamedSingleUnits[index].staveIndex,
              voiceIndex: currentBeamedSingleUnits[index].voiceIndex,
              singleUnitIndex: currentBeamedSingleUnits[index].singleUnitIndex,
              direction: currentBeamedSingleUnits[index].stemDirection,
              unitDuration: currentBeamedSingleUnits[index].unitDuration,
              beamedWithNext: currentBeamedSingleUnits[index].beamedWithNext,
              beamedWithNextWithJustOneBeam: currentBeamedSingleUnits[index].beamedWithNextWithJustOneBeam,
              numberOfTremoloStrokesInUnit: currentBeamedSingleUnits[index].numberOfTremoloStrokes,
              hasConnectedTremolo: currentBeamedSingleUnits[index].hasConnectedTremolo,
              nonDisplacedPartOfUnitWidth: currentBeamedSingleUnits[index].nonDisplacedPartOfSingleUnitWithCoordinates.right - currentBeamedSingleUnits[index].nonDisplacedPartOfSingleUnitWithCoordinates.left,
              isGrace: currentBeamedSingleUnits[index].isGrace,
              isRest: currentBeamedSingleUnits[index].isRest
            }
          )
        )
      }

      stems.push(
        stemForLastDrawnSingleUnit
      )

      const { beamedStemExtensions, beamsPieces } = drawBeamsForStems(styles, stems, minNumberOfBeamsForCurrentBeamedSingleUnits, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, beamLineCoefficients, anyStemDirectionChangesInBeamedSingleUnits)
      for (let index = 0; index < currentBeamedSingleUnits.length; index++) {
        const currentBeamedSingleUnit = currentBeamedSingleUnits[index]
        if (index > 0) {
          addPropertiesToElement(
            currentBeamedSingleUnit,
            {
              'ref-ids': `next-to-unit-connected-with-beam-${currentBeamedSingleUnits[index - 1].measureIndexInGeneral + 1}-${currentBeamedSingleUnits[index - 1].staveIndex + 1}-${currentBeamedSingleUnits[index - 1].voiceIndex + 1}-${currentBeamedSingleUnits[index - 1].singleUnitIndex + 1}`
            }
          )
        }
        if (currentBeamedSingleUnit.stemDirection === 'up') {
          const minTopForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension = Math.min(currentBeamedSingleUnit.top, currentBeamedSingleUnit.stemTop, stems[index].top, beamedStemExtensions[index].top - tunedNoteBeamStrokeOptions.width * 2)
          currentBeamedSingleUnit.top = minTopForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension
          currentBeamedSingleUnit.stemTop = minTopForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension
        } else if (currentBeamedSingleUnit.stemDirection === 'down') {
          const maxBottomForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension = Math.max(currentBeamedSingleUnit.bottom, currentBeamedSingleUnit.stemBottom, stems[index].bottom, beamedStemExtensions[index].bottom + tunedNoteBeamStrokeOptions.width * 2)
          currentBeamedSingleUnit.bottom = maxBottomForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension
          currentBeamedSingleUnit.stemBottom = maxBottomForBeamedSingleUnitConsideringCorrectedStemAndBeamedStemExtension
        }
      }
      const onlyStemsForNonRestUnits = stems.filter(stem => !stem.isRest)
      onlyStemsForNonRestUnits.forEach(stem => {
        addPropertiesToElement(
          stem,
          {
            'ref-ids': `stem-${stem.measureIndexInGeneral + 1}-${stem.staveIndex + 1}-${stem.voiceIndex + 1}-${stem.singleUnitIndex + 1}`
          }
        )
      })

      const backgroundForBeamsPieces = []
      for (let index = 0; index < beamsPieces.length; index++) {
        const beamsPiece = beamsPieces[index]
        if (
          (beamsPiece.perimeterCoordinates[0] && beamsPiece.perimeterCoordinates[0].x) &&
          (beamsPiece.perimeterCoordinates[0] && beamsPiece.perimeterCoordinates[0].y) &&
          (beamsPiece.perimeterCoordinates[1] && beamsPiece.perimeterCoordinates[1].x) &&
          (beamsPiece.perimeterCoordinates[1] && beamsPiece.perimeterCoordinates[1].y) &&
          (beamsPiece.perimeterCoordinates[2] && beamsPiece.perimeterCoordinates[2].x) &&
          (beamsPiece.perimeterCoordinates[2] && beamsPiece.perimeterCoordinates[2].y) &&
          (beamsPiece.perimeterCoordinates[3] && beamsPiece.perimeterCoordinates[3].x) &&
          (beamsPiece.perimeterCoordinates[3] && beamsPiece.perimeterCoordinates[3].y)
        ) {
          backgroundForBeamsPieces.push(
            createPath(
              [
                'M',
                beamsPiece.perimeterCoordinates[0].x, beamsPiece.perimeterCoordinates[0].y,
                'L',
                beamsPiece.perimeterCoordinates[1].x, beamsPiece.perimeterCoordinates[1].y,
                'L',
                beamsPiece.perimeterCoordinates[2].x, beamsPiece.perimeterCoordinates[2].y,
                'L',
                beamsPiece.perimeterCoordinates[3].x, beamsPiece.perimeterCoordinates[3].y,
                'Z'
              ],
              beamBackgroundStrokeOptions,
              true
            )
          )
        }
      }

      beamsWithStems.push(
        ...backgroundForBeamsPieces,
        ...onlyStemsForNonRestUnits,
        ...beamedStemExtensions,
        ...beamsPieces
      )

      currentBeamedSingleUnits = []
      minTopInCurrentBeamedSingleUnits = undefined
      maxBottomInCurrentBeamedSingleUnits = undefined
    }
  })
  return beamsWithStems
}
