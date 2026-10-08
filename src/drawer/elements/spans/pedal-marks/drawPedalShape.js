'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import releasePedalShape from '#msq/drawer/elements/spans/pedal-marks/releasePedalShape.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createLine from '#msq/drawer/elements/basic/createLine.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import moveElementInTheCenterBetweenPoints from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPoints.js'
import moveElementBeforePointWithInterval from '#msq/drawer/elements/basic/moveElementBeforePointWithInterval.js'
import moveElementAfterPointWithInterval from '#msq/drawer/elements/basic/moveElementAfterPointWithInterval.js'
import moveElementInTheCenterBetweenPointsAboveAndBelow from '#msq/drawer/elements/basic/moveElementInTheCenterBetweenPointsAboveAndBelow.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (pedalStructure, styles) {
  const { intervalBetweenStaveLines, fontColor, pedalLetters, pedalStandAloneTextFontOptions, pedalTextOnVariablePeakFontOptions, pedalBracketStrokeOptions, variablePeakPathPoints, pedalBracketLineXOffset, pedalBracketLineYOffset, pedalMarksYOffsetInCaseIfThereAreTextValuesOnVariablePeaks, wholePedalStructureStartYOffset, pedalVerticalPartOfBracketHeight, textOnVariablePeakYCorrection, pedalStandAloneTextAfterUnitXOffset, pedalStandAloneTextBeforeUnitXOffset, variablePeakAfterUnitXOffset, variablePeakBeforeUnitXOffset, releasePedalAfterUnitXOffset, releasePedalBeforeUnitXOffset, releasePedalRightOffsetAtEndOfMeasure, emptyPointAsPedalMarkXCorrection, emptyPointAsPedalMarkYCorrection, pedalEmptyPointAfterUnitXOffset, pedalEmptyPointBeforeUnitXOffset, releasePedalYCorrection } = styles
  const standAloneTextsAndPeaksAndReleases = []
  const onlyStandAloneTextsAndEmptyPoints = []
  const onlyVariablePeaks = []
  const onlyReleases = []
  pedalStructure.chordsWithStandAloneTextsAndVariablePeaksAndReleasePedals.forEach(
    chordWithMark => {
      const currentSingleUnit = chordWithMark.chord
      const xCenterOfSingleUnit = (currentSingleUnit.left + currentSingleUnit.right) / 2
      if (chordWithMark.type === 'emptyPoint') {
        let xPoint = currentSingleUnit.left + emptyPointAsPedalMarkXCorrection
        if (chordWithMark.afterUnit) {
          xPoint = currentSingleUnit.right + pedalEmptyPointAfterUnitXOffset
        } else if (chordWithMark.beforeUnit) {
          xPoint = currentSingleUnit.left - pedalEmptyPointBeforeUnitXOffset
        }
        const emptyPoint = {
          itIsEmptyPoint: true,
          top: 0,
          bottom: 0,
          left: xPoint,
          right: xPoint,
          transformations: []
        }
        moveElement(emptyPoint, 0, pedalStructure.y + emptyPointAsPedalMarkYCorrection)
        standAloneTextsAndPeaksAndReleases.push(
          emptyPoint
        )
        onlyStandAloneTextsAndEmptyPoints.push(
          emptyPoint
        )
      } else if (chordWithMark.type === 'standAloneText') {
        let standAloneText
        if (pedalLetters[chordWithMark.textValue]) {
          standAloneText = createPath(
            pedalLetters[chordWithMark.textValue].points,
            null,
            fontColor,
            xCenterOfSingleUnit,
            0
          )
          moveElementInTheCenterBetweenPointsAboveAndBelow(
            standAloneText,
            pedalStructure.y,
            pedalStructure.y
          )
        } else {
          standAloneText = createText(
            chordWithMark.textValue,
            pedalStandAloneTextFontOptions
          )(styles, xCenterOfSingleUnit, pedalStructure.y)
        }
        if (chordWithMark.afterUnit) {
          moveElementAfterPointWithInterval(
            standAloneText,
            currentSingleUnit.right,
            pedalStandAloneTextAfterUnitXOffset
          )
        } else if (chordWithMark.beforeUnit) {
          moveElementBeforePointWithInterval(
            standAloneText,
            currentSingleUnit.left,
            pedalStandAloneTextBeforeUnitXOffset
          )
        } else {
          moveElementInTheCenterBetweenPoints(
            standAloneText,
            currentSingleUnit.left,
            currentSingleUnit.right
          )
        }
        addPropertiesToElement(
          standAloneText,
          {
            'ref-ids': `${pedalStructure.key},${pedalStructure.key.replace('pedal', 'pedal-text')}`
          }
        )
        standAloneTextsAndPeaksAndReleases.push(
          standAloneText
        )
        onlyStandAloneTextsAndEmptyPoints.push(
          standAloneText
        )
      } else if (chordWithMark.type === 'variablePeak') {
        const drawnVariablePeak = createPath(
          variablePeakPathPoints, pedalBracketStrokeOptions, false, xCenterOfSingleUnit, pedalStructure.y
        )
        if (chordWithMark.afterUnit) {
          moveElementAfterPointWithInterval(
            drawnVariablePeak,
            currentSingleUnit.right,
            variablePeakAfterUnitXOffset
          )
        } else if (chordWithMark.beforeUnit) {
          moveElementBeforePointWithInterval(
            drawnVariablePeak,
            currentSingleUnit.left,
            variablePeakBeforeUnitXOffset
          )
        } else {
          moveElementInTheCenterBetweenPoints(
            drawnVariablePeak,
            currentSingleUnit.left,
            currentSingleUnit.right
          )
        }
        drawnVariablePeak.isVariablePeak = true
        standAloneTextsAndPeaksAndReleases.push(
          drawnVariablePeak
        )
        onlyVariablePeaks.push(
          drawnVariablePeak
        )
        addPropertiesToElement(
          drawnVariablePeak,
          {
            'ref-ids': `variable-peak-${currentSingleUnit.measureIndexInGeneral + 1}-${currentSingleUnit.staveIndex + 1}-${currentSingleUnit.voiceIndex + 1}-${currentSingleUnit.singleUnitIndex + 1}`
          }
        )
        chordWithMark.drawnVariablePeak = drawnVariablePeak
      } else if (chordWithMark.type === 'releasePedal') {
        const releasePedal = releasePedalShape()(
          styles,
          (
            chordWithMark.atEndOfMeasure
              ? (chordWithMark.measure.right - releasePedalRightOffsetAtEndOfMeasure)
              : xCenterOfSingleUnit
          ),
          0
        )
        moveElementInTheCenterBetweenPointsAboveAndBelow(
          releasePedal,
          pedalStructure.y,
          pedalStructure.y
        )
        if (!chordWithMark.atEndOfMeasure) {
          if (chordWithMark.afterUnit) {
            moveElementAfterPointWithInterval(
              releasePedal,
              currentSingleUnit.right,
              releasePedalAfterUnitXOffset
            )
          } else if (chordWithMark.beforeUnit) {
            moveElementBeforePointWithInterval(
              releasePedal,
              currentSingleUnit.left,
              releasePedalBeforeUnitXOffset
            )
          } else {
            moveElementInTheCenterBetweenPoints(
              releasePedal,
              currentSingleUnit.left,
              currentSingleUnit.right
            )
          }
        }
        releasePedal.isReleasePedal = true
        standAloneTextsAndPeaksAndReleases.push(
          releasePedal
        )
        onlyReleases.push(
          releasePedal
        )
        addPropertiesToElement(
          releasePedal,
          {
            'ref-ids': pedalStructure.key.replace('pedal', 'release')
          }
        )
      }
    }
  )
  const pedalBracketLines = []
  if (pedalStructure.withBrackets) {
    for (let index = 0; index < standAloneTextsAndPeaksAndReleases.length; index++) {
      if (index < standAloneTextsAndPeaksAndReleases.length - 1) {
        const currentPedalMark = standAloneTextsAndPeaksAndReleases[index]
        const nextPedalMark = standAloneTextsAndPeaksAndReleases[index + 1]
        const leftPointOfBracketLine = currentPedalMark.right + (currentPedalMark.isVariablePeak ? 0 : pedalBracketLineXOffset)
        const rightPointOfBracketLine = nextPedalMark.left - (nextPedalMark.isVariablePeak ? 0 : pedalBracketLineXOffset)
        if (leftPointOfBracketLine < rightPointOfBracketLine) {
          pedalBracketLines.push(
            createLine(
              leftPointOfBracketLine,
              pedalStructure.y + pedalBracketLineYOffset,
              rightPointOfBracketLine,
              pedalStructure.y + pedalBracketLineYOffset, pedalBracketStrokeOptions
            )
          )
        }
      }
    }
    const firstStandAloneTextOrPeakOrRelease = standAloneTextsAndPeaksAndReleases[0]
    if (firstStandAloneTextOrPeakOrRelease && firstStandAloneTextOrPeakOrRelease.itIsEmptyPoint) {
      pedalBracketLines.push(
        createLine(
          firstStandAloneTextOrPeakOrRelease.left + pedalBracketLineXOffset,
          pedalStructure.y + pedalBracketLineYOffset,
          firstStandAloneTextOrPeakOrRelease.left + pedalBracketLineXOffset,
          pedalStructure.y + pedalBracketLineYOffset - pedalVerticalPartOfBracketHeight,
          pedalBracketStrokeOptions
        )
      )
    }
    const lastStandAloneTextOrPeakOrRelease = standAloneTextsAndPeaksAndReleases[standAloneTextsAndPeaksAndReleases.length - 1]
    if (lastStandAloneTextOrPeakOrRelease && !lastStandAloneTextOrPeakOrRelease.isReleasePedal) {
      pedalBracketLines.push(
        createLine(
          lastStandAloneTextOrPeakOrRelease.right + (lastStandAloneTextOrPeakOrRelease.isVariablePeak ? 0 : pedalBracketLineXOffset),
          pedalStructure.y + pedalBracketLineYOffset,
          pedalStructure.rightPoint + pedalBracketLineXOffset,
          pedalStructure.y + pedalBracketLineYOffset, pedalBracketStrokeOptions
        )
      )
    }
    if (pedalStructure.finish && pedalStructure.withBracketClosure && !lastStandAloneTextOrPeakOrRelease.isReleasePedal) {
      const releaseBracket = createLine(
        pedalStructure.rightPoint + pedalBracketLineXOffset,
        pedalStructure.y + pedalBracketLineYOffset,
        pedalStructure.rightPoint + pedalBracketLineXOffset,
        pedalStructure.y + pedalBracketLineYOffset - pedalVerticalPartOfBracketHeight,
        pedalBracketStrokeOptions
      )
      pedalBracketLines.push(
        releaseBracket
      )
      addPropertiesToElement(
        releaseBracket,
        {
          'ref-ids': pedalStructure.key.replace('pedal', 'release')
        }
      )
    }
  }
  const groupedStandAloneTextsAndEmptyPoints = createGroup(
    'standAloneTextAndEmptyPoints',
    onlyStandAloneTextsAndEmptyPoints
  )
  const groupedVariablePeaks = createGroup(
    'variablePeaks',
    onlyVariablePeaks
  )
  const groupedReleases = createGroup(
    'releases',
    onlyReleases
  )
  const groupedPedalBracketLines = createGroup(
    'pedalBrackets',
    pedalBracketLines
  )
  addPropertiesToElement(
    groupedPedalBracketLines,
    {
      'ref-ids': pedalStructure.key.replace('pedal', 'pedal-line')
    }
  )
  if (pedalBracketLines.length > 0) {
    if (onlyVariablePeaks.length > 0) {
      moveElement(
        groupedPedalBracketLines,
        0,
        groupedVariablePeaks.bottom - groupedPedalBracketLines.bottom
      )
    } else if (onlyStandAloneTextsAndEmptyPoints.length > 0) {
      moveElement(
        groupedPedalBracketLines,
        0,
        groupedStandAloneTextsAndEmptyPoints.bottom - groupedPedalBracketLines.bottom
      )
    }
    onlyStandAloneTextsAndEmptyPoints.forEach(standAloneTextOrEmptyPoint => {
      moveElement(
        standAloneTextOrEmptyPoint,
        0,
        groupedPedalBracketLines.bottom - standAloneTextOrEmptyPoint.bottom + pedalBracketStrokeOptions.width / 2
      )
    })
    onlyReleases.forEach(release => {
      moveElement(
        release,
        0,
        groupedPedalBracketLines.bottom - (release.top + release.bottom) / 2
      )
    })
  } else {
    onlyReleases.forEach(release => {
      moveElement(
        release,
        0,
        releasePedalYCorrection
      )
    })
  }
  let pedalMarksWithLines = createGroup(
    'pedalMarksWithLines',
    [
      groupedStandAloneTextsAndEmptyPoints,
      groupedVariablePeaks,
      groupedReleases,
      groupedPedalBracketLines
    ]
  )
  const textsOnVariablePeaks = []
  if (pedalStructure.hasTextValuesOnVariablePeaks) {
    moveElement(
      pedalMarksWithLines,
      0,
      pedalMarksYOffsetInCaseIfThereAreTextValuesOnVariablePeaks + textOnVariablePeakYCorrection
    )
    const chordsWithVariablePeaksAndTextsOnThem = pedalStructure.chordsWithStandAloneTextsAndVariablePeaksAndReleasePedals.filter(
      chordWithMark => chordWithMark.type === 'variablePeak' && chordWithMark.textValue
    )
    chordsWithVariablePeaksAndTextsOnThem.forEach(
      chordWithMark => {
        if (chordWithMark.drawnVariablePeak) {
          let xPoint = (chordWithMark.drawnVariablePeak.left + chordWithMark.drawnVariablePeak.right) / 2
          let textOnVariablePeak
          if (pedalLetters[chordWithMark.textValue]) {
            textOnVariablePeak = createPath(
              pedalLetters[chordWithMark.textValue].points,
              null,
              fontColor,
              xPoint,
              0
            )
          } else {
            textOnVariablePeak = createText(
              chordWithMark.textValue,
              pedalTextOnVariablePeakFontOptions
            )(styles, xPoint, 0)
          }
          moveElementInTheCenterBetweenPoints(
            textOnVariablePeak,
            xPoint,
            xPoint
          )
          moveElementInTheCenterBetweenPointsAboveAndBelow(
            textOnVariablePeak,
            pedalStructure.y + textOnVariablePeakYCorrection,
            pedalStructure.y + textOnVariablePeakYCorrection
          )
          addPropertiesToElement(
            textOnVariablePeak,
            {
              'ref-ids': `variable-peak-text-${chordWithMark.chord.measureIndexInGeneral + 1}-${chordWithMark.chord.staveIndex + 1}-${chordWithMark.chord.voiceIndex + 1}-${chordWithMark.chord.singleUnitIndex + 1}`
            }
          )
          textsOnVariablePeaks.push(
            textOnVariablePeak
          )
        }
      }
    )
  }
  const wholePedalStructure = createGroup(
    'wholePedalStructure',
    [
      pedalMarksWithLines,
      ...textsOnVariablePeaks
    ]
  )
  moveElement(
    wholePedalStructure,
    0,
    wholePedalStructureStartYOffset + (pedalStructure.yCorrection || 0) * intervalBetweenStaveLines
  )
  const wholePedalStructureWithAdditionalInformation = createElementWithAdditionalInformation(
    wholePedalStructure,
    {
      chords: pedalStructure.chords
    }
  )
  addPropertiesToElement(
    wholePedalStructureWithAdditionalInformation,
    {
      'ref-ids': pedalStructure.key
    }
  )
  return wholePedalStructureWithAdditionalInformation
}
