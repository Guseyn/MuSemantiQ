'use strict'

import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'

const correctStemEndCoordinates = (stem, newStemEndCoordinate) => {
  if (stem.direction === 'up' && (stem.topCorrectedByBeams === undefined || newStemEndCoordinate < stem.topCorrectedByBeams)) {
    stem.topCorrectedByBeams = newStemEndCoordinate
  } else if (stem.direction === 'down' && (stem.bottomCorrectedByBeams === undefined || newStemEndCoordinate > stem.bottomCorrectedByBeams)) {
    stem.bottomCorrectedByBeams = newStemEndCoordinate
  }
}

const updateBeamsPerimeterCoordinates = (beamsPerimeterCoordinates, arrayOfXsForStem, arrayOfXsForNextStem, arrayOfYsForStem, arrayOfYsForNextStem) => {
  beamsPerimeterCoordinates[0] = beamsPerimeterCoordinates[0] || {}
  beamsPerimeterCoordinates[1] = beamsPerimeterCoordinates[1] || {}
  beamsPerimeterCoordinates[2] = beamsPerimeterCoordinates[2] || {}
  beamsPerimeterCoordinates[3] = beamsPerimeterCoordinates[3] || {}
  const minXForStem = Math.min(...arrayOfXsForStem)
  const maxXForNextStem = Math.max(...arrayOfXsForNextStem)
  const minYForStem = Math.min(...arrayOfYsForStem)
  const maxYForStem = Math.max(...arrayOfYsForStem)
  const minYForNextStem = Math.min(...arrayOfYsForNextStem)
  const maxYForNextStem = Math.max(...arrayOfYsForNextStem)
  beamsPerimeterCoordinates[0].x = beamsPerimeterCoordinates[0].x ? Math.min(beamsPerimeterCoordinates[0].x, minXForStem) : minXForStem
  beamsPerimeterCoordinates[0].y = beamsPerimeterCoordinates[0].y ? Math.min(beamsPerimeterCoordinates[0].y, minYForStem) : minYForStem
  beamsPerimeterCoordinates[1].x = beamsPerimeterCoordinates[1].x ? Math.max(beamsPerimeterCoordinates[1].x, maxXForNextStem) : maxXForNextStem
  beamsPerimeterCoordinates[1].y = beamsPerimeterCoordinates[1].y ? Math.min(beamsPerimeterCoordinates[1].y, minYForNextStem) : minYForNextStem
  beamsPerimeterCoordinates[2].x = beamsPerimeterCoordinates[2].x ? Math.max(beamsPerimeterCoordinates[2].x, maxXForNextStem) : maxXForNextStem
  beamsPerimeterCoordinates[2].y = beamsPerimeterCoordinates[2].y ? Math.max(beamsPerimeterCoordinates[2].y, maxYForNextStem) : maxYForNextStem
  beamsPerimeterCoordinates[3].x = beamsPerimeterCoordinates[3].x ? Math.min(beamsPerimeterCoordinates[3].x, minXForStem) : minXForStem
  beamsPerimeterCoordinates[3].y = beamsPerimeterCoordinates[3].y ? Math.max(beamsPerimeterCoordinates[3].y, maxYForStem) : maxYForStem
}

export default function (styles, stem, nextStem, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, isFirstBeam, isLastBeam, numberOfBeamsForStem, numberOfBeamsForNextStem, beamLineCoefficients, anyStemDirectionChangesInBeamedSingleUnits, firstStemDirection) {
  const { noteBeamStrokeOptions, noteSquareStemStrokeOptions, heightOfBeamedStemExtension, cutBeamLength, negativeXOffsetOfTremoloBeams, graceElementsScaleFactor } = styles

  const tunedNoteBeamStrokeOptions = Object.assign({}, noteBeamStrokeOptions)
  const tunedNoteSquareStemStrokeOptions = Object.assign({}, noteSquareStemStrokeOptions)
  let tunedHeightOfBeamedStemExtension = heightOfBeamedStemExtension
  let tunedCutBeamLength = cutBeamLength
  let tunedNegativeXOffsetOfTremoloBeams = negativeXOffsetOfTremoloBeams
  if (stem.isGrace || nextStem.isGrace) {
    tunedNoteBeamStrokeOptions.width *= graceElementsScaleFactor
    tunedNoteSquareStemStrokeOptions.width *= graceElementsScaleFactor
    tunedHeightOfBeamedStemExtension *= graceElementsScaleFactor
    tunedCutBeamLength *= graceElementsScaleFactor
    tunedNegativeXOffsetOfTremoloBeams *= graceElementsScaleFactor
  }

  const xStemCorrection = noteSquareStemStrokeOptions.width / 2
  const beamStrokeXCorrection = noteBeamStrokeOptions.width / 2
  const stemX = stem.left
  const nextStemX = nextStem.left
  const beamsPiece = []
  const tremoloBeamsPiece = []
  const beamsPerimeterCoordinates = []

  const middlePointXFromStem = stemX + tunedCutBeamLength
  const middlePointYFromStem = middlePointXFromStem * beamLineCoefficients.gradient + beamLineCoefficients.topIntercept

  const middlePointXFromNextStem = nextStemX - tunedCutBeamLength
  const middlePointYFromNextStem = middlePointXFromNextStem * beamLineCoefficients.gradient + beamLineCoefficients.topIntercept

  const maxNumberOfBeamsWithoutConsideringSingleBeamedConnections = Math.max(numberOfBeamsForStem, numberOfBeamsForNextStem)
  const maxNumberOfBeams = stem.beamedWithNextWithJustOneBeam ? 1 : maxNumberOfBeamsWithoutConsideringSingleBeamedConnections

  // maybe we need use maxNumberOfBeamsWithoutConsideringSingleBeamedConnections instead of maxNumberOfBeams in the next line, we'll see
  const startIndexOfTremoloStrokesForBothStems = maxNumberOfBeams - Math.max(stem.numberOfTremoloStrokesInUnit, nextStem.numberOfTremoloStrokesInUnit) - 1

  if (!anyStemDirectionChangesInBeamedSingleUnits) {
    for (let index = 0; index < maxNumberOfBeams; index++) {
      const endPointCorrectionOfCurrentBeamLine = allBeamsHeightNormalWhereAllStemsWithSameDirection - index * beamLineHeightNormal - index * tunedHeightOfBeamedStemExtension
      const startPointCorrectionOfCurrentBeamLine = endPointCorrectionOfCurrentBeamLine - beamLineHeightNormal

      const currentTopBeamDownLineForStem = stem.top - endPointCorrectionOfCurrentBeamLine
      const currentBottomBeamUpLineForStem = stem.bottom + endPointCorrectionOfCurrentBeamLine
      const currentTopBeamUpLineForStem = stem.top - startPointCorrectionOfCurrentBeamLine
      const currentBottomBeamDownLineForStem = stem.bottom + startPointCorrectionOfCurrentBeamLine

      const currentTopBeamDownLineForNextStem = nextStem.top - endPointCorrectionOfCurrentBeamLine
      const currentBottomBeamUpLineForNextStem = nextStem.bottom + endPointCorrectionOfCurrentBeamLine
      const currentTopBeamUpLineForNextStem = nextStem.top - startPointCorrectionOfCurrentBeamLine
      const currentBottomBeamDownLineForNextStem = nextStem.bottom + startPointCorrectionOfCurrentBeamLine

      const currentTopBeamDownLineForMiddlePointFromStem = middlePointYFromStem - endPointCorrectionOfCurrentBeamLine
      const currentBottomBeamUpLineForMiddlePointFromStem = middlePointYFromStem + endPointCorrectionOfCurrentBeamLine
      const currentTopBeamUpLineForMiddlePointFromStem = middlePointYFromStem - startPointCorrectionOfCurrentBeamLine
      const currentBottomBeamDownLineForMiddlePointFromStem = middlePointYFromStem + startPointCorrectionOfCurrentBeamLine

      const currentTopBeamDownLineForMiddlePointFromNextStem = middlePointYFromNextStem - endPointCorrectionOfCurrentBeamLine
      const currentBottomBeamUpLineForMiddlePointFromNextStem = middlePointYFromNextStem + endPointCorrectionOfCurrentBeamLine
      const currentTopBeamUpLineForMiddlePointFromNextStem = middlePointYFromNextStem - startPointCorrectionOfCurrentBeamLine
      const currentBottomBeamDownLineForMiddlePointFromNextStem = middlePointYFromNextStem + startPointCorrectionOfCurrentBeamLine

      if (index < numberOfBeamsForStem) {
        if (index < numberOfBeamsForNextStem) {
          let negativeXOffsetOfBeamInCaseIfItIsTremoloBeam = 0
          let itIsTremoloBeamLine = false
          if (stem.hasConnectedTremolo && stem.unitDuration < 1 / 2 && index > startIndexOfTremoloStrokesForBothStems) {
            negativeXOffsetOfBeamInCaseIfItIsTremoloBeam = tunedNegativeXOffsetOfTremoloBeams
            itIsTremoloBeamLine = true
          }
          const points = [
            'M',
            (isFirstBeam ? stemX - xStemCorrection + beamStrokeXCorrection : stemX) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeam, (stem.direction === 'up' ? currentTopBeamUpLineForStem : currentBottomBeamDownLineForStem) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeam * beamLineCoefficients.gradient,
            'L',
            (isLastBeam ? nextStemX + xStemCorrection - beamStrokeXCorrection : nextStemX) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeam, (stem.direction === 'up' ? currentTopBeamUpLineForNextStem : currentBottomBeamDownLineForNextStem) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeam * beamLineCoefficients.gradient,
            'L',
            (isLastBeam ? nextStemX + xStemCorrection - beamStrokeXCorrection : nextStemX) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeam, (stem.direction === 'up' ? currentTopBeamDownLineForNextStem : currentBottomBeamUpLineForNextStem) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeam * beamLineCoefficients.gradient,
            'L',
            (isFirstBeam ? stemX - xStemCorrection + beamStrokeXCorrection : stemX) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeam, (stem.direction === 'up' ? currentTopBeamDownLineForStem : currentBottomBeamUpLineForStem) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeam * beamLineCoefficients.gradient,
            'Z'
          ]
          const beamLine = createPath(
            points,
            tunedNoteBeamStrokeOptions,
            true,
            0,
            0
          )
          if (itIsTremoloBeamLine) {
            tremoloBeamsPiece.push(beamLine)
          } else {
            beamsPiece.push(beamLine)
          }
          updateBeamsPerimeterCoordinates(
            beamsPerimeterCoordinates,
            [ points[1], points[10] ],
            [ points[4], points[7] ],
            [ points[2], points[11] ],
            [ points[5], points[8] ]
          )
        } else {
          const points = [
            'M',
            isFirstBeam ? stemX - xStemCorrection + beamStrokeXCorrection : stemX, stem.direction === 'up' ? currentTopBeamUpLineForStem : currentBottomBeamDownLineForStem,
            'L',
            middlePointXFromStem, stem.direction === 'up' ? currentTopBeamUpLineForMiddlePointFromStem : currentBottomBeamDownLineForMiddlePointFromStem,
            'L',
            middlePointXFromStem, stem.direction === 'up' ? currentTopBeamDownLineForMiddlePointFromStem : currentBottomBeamUpLineForMiddlePointFromStem,
            'L',
            isFirstBeam ? stemX - xStemCorrection + beamStrokeXCorrection : stemX, stem.direction === 'up' ? currentTopBeamDownLineForStem : currentBottomBeamUpLineForStem,
            'Z'
          ]
          beamsPiece.push(
            createPath(
              points,
              tunedNoteBeamStrokeOptions,
              true,
              0,
              0
            )
          )
        }
      } else {
        const points = [
          'M',
          middlePointXFromNextStem, nextStem.direction === 'up' ? currentTopBeamUpLineForMiddlePointFromNextStem : currentBottomBeamDownLineForMiddlePointFromNextStem,
          'L',
          isLastBeam ? nextStemX + xStemCorrection - beamStrokeXCorrection : nextStemX, nextStem.direction === 'up' ? currentTopBeamUpLineForNextStem : currentBottomBeamDownLineForNextStem,
          'L',
          isLastBeam ? nextStemX + xStemCorrection - beamStrokeXCorrection : nextStemX, nextStem.direction === 'up' ? currentTopBeamDownLineForNextStem : currentBottomBeamUpLineForNextStem,
          'L',
          middlePointXFromNextStem, nextStem.direction === 'up' ? currentTopBeamDownLineForMiddlePointFromNextStem : currentBottomBeamUpLineForMiddlePointFromNextStem,
          'Z'
        ]
        beamsPiece.push(
          createPath(
            points,
            tunedNoteBeamStrokeOptions,
            true,
            0,
            0
          )
        )
      }
    }
  } else {
    const pilingDirectionSignOfBeams = firstStemDirection === 'up' ? -1 : 1
    const stemEndCoordinate = stem[stem.direction === 'up' ? 'top' : 'bottom']
    const nextStemEndCoordinate = nextStem[nextStem.direction === 'up' ? 'top' : 'bottom']
    for (let index = 0; index < maxNumberOfBeams; index++) {
      if (index < numberOfBeamsForStem) {
        if (index < numberOfBeamsForNextStem) {
          let negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem = 0
          let negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem = 0
          let itIsTremoloBeamLine = false
          if (stem.hasConnectedTremolo && stem.unitDuration < 1 / 2 && index > startIndexOfTremoloStrokesForBothStems) {
            if (stem.direction === 'down') {
              negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem = stem.nonDisplacedPartOfUnitWidth + tunedNegativeXOffsetOfTremoloBeams
            } else {
              negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem = tunedNegativeXOffsetOfTremoloBeams
            }
            if (nextStem.direction === 'up') {
              negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem = nextStem.nonDisplacedPartOfUnitWidth + tunedNegativeXOffsetOfTremoloBeams
            } else {
              negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem = tunedNegativeXOffsetOfTremoloBeams
            }
            itIsTremoloBeamLine = true
          }
          const points = [
            'M',
            (stemX - xStemCorrection + beamStrokeXCorrection) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem * beamLineCoefficients.gradient),
            'L',
            (stemX + xStemCorrection - beamStrokeXCorrection) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem * beamLineCoefficients.gradient),
            'L',
            (nextStemX - xStemCorrection + beamStrokeXCorrection) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) - (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem * beamLineCoefficients.gradient),
            'L',
            (nextStemX + xStemCorrection - beamStrokeXCorrection) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) - (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem * beamLineCoefficients.gradient),
            'L',
            (nextStemX + xStemCorrection - beamStrokeXCorrection) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal - (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem * beamLineCoefficients.gradient),
            'L',
            (nextStemX - xStemCorrection + beamStrokeXCorrection) - negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal - (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForNextStem * beamLineCoefficients.gradient),
            'L',
            (stemX + xStemCorrection - beamStrokeXCorrection) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal + (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem * beamLineCoefficients.gradient),
            'L',
            (stemX - xStemCorrection + beamStrokeXCorrection) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal + (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem * beamLineCoefficients.gradient),
            'L',
            (stemX - xStemCorrection + beamStrokeXCorrection) + negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + (negativeXOffsetOfBeamInCaseIfItIsTremoloBeamForStem * beamLineCoefficients.gradient),
            'Z'
          ]
          const beamLine = createPath(
            points,
            tunedNoteBeamStrokeOptions,
            true,
            0,
            0
          )
          updateBeamsPerimeterCoordinates(
            beamsPerimeterCoordinates,
            [ points[1], points[4], points[19], points[22], points[25] ],
            [ points[7], points[10], points[13], points[16] ],
            [ points[2], points[5], points[20], points[23], points[26] ],
            [ points[8], points[11], points[14], points[17] ]
          )
          if (itIsTremoloBeamLine) {
            tremoloBeamsPiece.push(beamLine)
          } else {
            beamsPiece.push(beamLine)
          }
        } else {
          const points = [
            'M',
            stemX - xStemCorrection + beamStrokeXCorrection, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
            'L',
            stemX + xStemCorrection - beamStrokeXCorrection, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
            'L',
            middlePointXFromStem - xStemCorrection + beamStrokeXCorrection, middlePointYFromStem + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
            'L',
            middlePointXFromStem - xStemCorrection + beamStrokeXCorrection, middlePointYFromStem + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
            'L',
            stemX - xStemCorrection + beamStrokeXCorrection, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
            'L',
            stemX + xStemCorrection - beamStrokeXCorrection, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
            'L',
            stemX + xStemCorrection - beamStrokeXCorrection, stemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
            'Z'
          ]
          beamsPiece.push(
            createPath(
              points,
              tunedNoteBeamStrokeOptions,
              true,
              0,
              0
            )
          )
        }
      } else {
        const points = [
          'M',
          middlePointXFromNextStem - xStemCorrection + beamStrokeXCorrection, middlePointYFromNextStem + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
          'L',
          nextStemX - xStemCorrection + beamStrokeXCorrection, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
          'L',
          nextStemX + xStemCorrection - beamStrokeXCorrection, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension),
          'L',
          nextStemX + xStemCorrection - beamStrokeXCorrection, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
          'L',
          nextStemX - xStemCorrection + beamStrokeXCorrection, nextStemEndCoordinate + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
          'L',
          middlePointXFromNextStem - xStemCorrection + beamStrokeXCorrection, middlePointYFromNextStem + pilingDirectionSignOfBeams * index * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal,
          'Z'
        ]
        beamsPiece.push(
          createPath(
            points,
            tunedNoteBeamStrokeOptions,
            true,
            0,
            0
          )
        )
      }
      if (index === numberOfBeamsForStem - 1) {
        const indexToWhichBeamedStemExtensionNeedsToBeExtended = (stem.hasConnectedTremolo && (stem.unitDuration <= 1 / 4)) ? startIndexOfTremoloStrokesForBothStems : index
        correctStemEndCoordinates(stem, stemEndCoordinate + pilingDirectionSignOfBeams * indexToWhichBeamedStemExtensionNeedsToBeExtended * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal)
      }
      if (index === numberOfBeamsForNextStem - 1) {
        const indexToWhichBeamedStemExtensionNeedsToBeExtended = (stem.hasConnectedTremolo && (stem.unitDuration <= 1 / 4)) ? startIndexOfTremoloStrokesForBothStems : index
        correctStemEndCoordinates(nextStem, nextStemEndCoordinate + pilingDirectionSignOfBeams * indexToWhichBeamedStemExtensionNeedsToBeExtended * (beamLineHeightNormal + tunedHeightOfBeamedStemExtension) + pilingDirectionSignOfBeams * beamLineHeightNormal)
      }
    }
  }
  const groupedBeamsPiece = createGroup(
    'beams',
    beamsPiece
  )
  const groupedTremoloBeamsPiece = createGroup(
    'tremoloBeams',
    tremoloBeamsPiece
  )
  addPropertiesToElement(
    groupedBeamsPiece,
    {
      'ref-ids': `beam-${stem.measureIndexInGeneral + 1}-${stem.staveIndex + 1}-${stem.voiceIndex + 1}-${stem.singleUnitIndex + 1}`
    }
  )
  addPropertiesToElement(
    groupedTremoloBeamsPiece,
    {
      'ref-ids': `tremolo-${stem.measureIndexInGeneral + 1}-${stem.staveIndex + 1}-${stem.voiceIndex + 1}-${stem.singleUnitIndex + 1}`
    }
  )
  return createElementWithAdditionalInformation(
    createGroup(
      'beamsIncludingTremolo',
      [
        groupedBeamsPiece,
        groupedTremoloBeamsPiece
      ]
    ),
    {
      perimeterCoordinates: beamsPerimeterCoordinates
    }
  )
}
